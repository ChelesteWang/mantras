// src/core/agent-manager.ts
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { AgentConfig } from '../interfaces/agent-config.interface';
import { ItemConfig } from '../../tools/interfaces/item-config.interface';
import { BaseAgent } from '../agents/core/base.agent';
import { IMantra } from '../../tools/interfaces/mantra.interface';
import { IAgent } from '../interfaces/agent.interface';
import * as path from 'path'; // Added for path resolution
import { Logger } from './logger';
import { registry } from '../../core/registry';

export class AgentManager {
  private agents: IAgent[] = [];
  private agentConfigs: AgentConfig[] = [];

  constructor(configDirectoryPath?: string) {
    if (configDirectoryPath) {
      this.loadAgentsFromDirectory(configDirectoryPath);
    }
  }

  /**
   * Loads agent configurations from YAML files in a specified directory.
   * @param directoryPath The path to the directory containing agent YAML configuration files.
   */
  public loadAgentsFromDirectory(directoryPath: string): void {
    try {
      const files = fs.readdirSync(directoryPath);
      files.forEach(file => {
        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          const filePath = `${directoryPath}/${file}`;
          try {
            const agentConfig = this.loadAgentConfigFromYaml(filePath);
            this.agentConfigs.push(agentConfig);
            const agent = this.createAgentFromConfig(agentConfig);
            this.agents.push(agent);
            Logger.log(`Successfully loaded and created agent from ${file}`);
          } catch (error) {
            Logger.error(`Error processing agent config file ${file}:`, error);
          }
        }
      });
    } catch (error) {
      Logger.error(`Error reading agent configuration directory ${directoryPath}:`, error);
    }
  }

  /**
   * Loads a single agent configuration from a YAML file.
   * @param filePath Path to the YAML configuration file.
   * @returns The parsed AgentConfig object.
   */
  public loadAgentConfigFromYaml(filePath: string): AgentConfig {
    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const config = yaml.load(fileContents) as AgentConfig;
      if (!config || !config.id || !config.name) {
        throw new Error('Invalid agent configuration: id and name are required.');
      }
      Logger.log(`Loaded agent configuration from ${filePath}`);
      return config;
    } catch (error) {
      Logger.error(`Error loading agent configuration from ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Creates an IAgent instance from an AgentConfig object.
   * It also instantiates and learns items defined in the config.
   * @param agentConfig The agent configuration.
   * @returns An IAgent instance.
   */
  public createAgentFromConfig(agentConfig: AgentConfig): IAgent {
    const initialItems: IMantra[] = [];
    if (agentConfig.items) {
      agentConfig.items.forEach(itemConfig => {
        try {
          // For now, we assume itemConfig directly maps to IMantra or can be adapted.
          // In a real scenario, you might load the TS file specified in itemConfig.executionPath
          // and instantiate the class. This is a simplified version.
          if (!itemConfig.id || !itemConfig.name || !itemConfig.description) {
            Logger.warn('Skipping item due to missing id, name, or description:', itemConfig);
            return;
          }
          const item: IMantra = {
            id: itemConfig.id,
            name: itemConfig.name,
            description: itemConfig.description,
            metadata: itemConfig.metadata,
            execute: async (ideContext, rules, params) => {
              if (itemConfig.executionPath) {
                try {
                  // itemConfig.executionPath is like "config/agents/tools/greeting-tool.ts" or "src/tools/code-formatter.tool.ts"
                  // The tsc output preserves this structure under dist, e.g.:
                  // "dist/config/agents/tools/greeting-tool.js" or "dist/src/tools/code-formatter.tool.js"
                  const relativeJsPath = itemConfig.executionPath.replace(/\.ts$/, '.js');
                  const absoluteModulePath = path.resolve(process.cwd(), 'dist', relativeJsPath);


                  Logger.log(`Attempting to load module from: ${absoluteModulePath} (derived from ${itemConfig.executionPath}, projectRoot: ${process.cwd()})`);
                  const loadedModule = require(absoluteModulePath);

                  console.log(`Loaded module for ${itemConfig.name}:`, loadedModule);
                  console.log(`Keys of loaded module for ${itemConfig.name}: ${Object.keys(loadedModule)}`);
                  
                  // Attempt to find the exported class/object by item name (e.g., GreetingTool for "Greeter Tool")
                  // or by a conventional export name like 'default' or the item's ID (e.g., item_001_greet)
                  let ItemClass;
                  const classNameFromName = itemConfig.name.replace(/\s+/g, ''); // e.g., GreeterTool
                  const classNameFromId = itemConfig.id.replace(/-/g, '_'); // e.g., item_001_greet

                  if (loadedModule[classNameFromName]) {
                    ItemClass = loadedModule[classNameFromName];
                  } else if (loadedModule[classNameFromId]) {
                    ItemClass = loadedModule[classNameFromId];
                  } else if (loadedModule.default) {
                    ItemClass = loadedModule.default;
                  } else {
                    // Fallback: try to find the first class that implements IMantra (more complex)
                    // For now, we'll throw an error if no direct match is found.
                    Logger.error(`Could not find a suitable class/export in ${itemConfig.executionPath}. Expected ${classNameFromName}, ${classNameFromId}, or default export.`);
                    throw new Error(`Could not find a suitable class/export in ${itemConfig.executionPath}`);
                  }

                  const itemInstance: IMantra = new ItemClass();
                  // Ensure the instance has the correct id, name, description from config, 
                  // as the class might have defaults.
                  itemInstance.id = itemConfig.id;
                  itemInstance.name = itemConfig.name;
                  itemInstance.description = itemConfig.description;
                  itemInstance.metadata = { ...itemInstance.metadata, ...itemConfig.metadata };

                  Logger.log(`Dynamically loaded and executing item ${itemInstance.name} (ID: ${itemInstance.id}) from ${itemConfig.executionPath}`);
                  return await itemInstance.execute(ideContext, rules, params);
                } catch (e) {
                  Logger.error(`Error loading or executing item from ${itemConfig.executionPath}:`, e);
                  throw e;
                }
              } else {
                Logger.warn(`No execution path defined for item ${itemConfig.name}. Cannot execute.`);
                return `No execution path defined for ${itemConfig.name}`;
              }
            }
          };
          initialItems.push(item);
          registry.registerItem(item); // Register item globally
        } catch (error) {
          Logger.error(`Error creating item from config: ${itemConfig.name}`, error);
        }
      });
    }

    const agent = new BaseAgent(
      agentConfig.id,
      agentConfig.name,
      initialItems,
      agentConfig.status,
      agentConfig.capabilities
    );
    Logger.log(`Created agent: ${agent.name} (ID: ${agent.id})`);
    return agent;
  }

  /**
   * Generates a Markdown representation of an agent's configuration.
   * @param agentConfig The agent configuration.
   * @returns A string containing the Markdown documentation.
   */
  public generateAgentMarkdown(agentConfig: AgentConfig): string {
    let markdown = `# Agent: ${agentConfig.name} (ID: ${agentConfig.id})\n\n`;
    if (agentConfig.status) {
      markdown += `**Status:** ${agentConfig.status}\n`;
    }
    if (agentConfig.capabilities && agentConfig.capabilities.length > 0) {
      markdown += `**Capabilities:**\n`;
      agentConfig.capabilities.forEach(cap => {
        markdown += `  - ${cap}\n`;
      });
    }
    markdown += `\n`;

    if (agentConfig.items && agentConfig.items.length > 0) {
      markdown += `## Items\n\n`;
      agentConfig.items.forEach(item => {
        markdown += `### ${item.name} (ID: ${item.id})\n`;
        markdown += `**Description:** ${item.description}\n`;
        if (item.executionPath) {
          markdown += `**Execution Path:** \`${item.executionPath}\`\n`;
        }
        if (item.metadata && Object.keys(item.metadata).length > 0) {
          markdown += `**Metadata:**\n\`\`\`json
${JSON.stringify(item.metadata, null, 2)}
\`\`\`\n`;
        }
        markdown += `\n`;
      });
    }
    return markdown;
  }

  /**
   * Generates Markdown documentation for all loaded agent configurations and saves them to files.
   * @param outputDirectoryPath The directory where Markdown files will be saved.
   */
  public generateAllAgentsMarkdown(outputDirectoryPath: string): void {
    if (!fs.existsSync(outputDirectoryPath)) {
      fs.mkdirSync(outputDirectoryPath, { recursive: true });
    }
    this.agentConfigs.forEach(agentConfig => {
      const markdownContent = this.generateAgentMarkdown(agentConfig);
      const filePath = `${outputDirectoryPath}/${agentConfig.id}.md`;
      try {
        fs.writeFileSync(filePath, markdownContent, 'utf8');
        Logger.log(`Generated Markdown for agent ${agentConfig.name} at ${filePath}`);
      } catch (error) {
        Logger.error(`Error writing Markdown for agent ${agentConfig.name}:`, error);
      }
    });
  }

  public getAgentById(agentId: string): IAgent | undefined {
    return this.agents.find(agent => agent.id === agentId);
  }

  public getAllAgents(): IAgent[] {
    return this.agents;
  }

  public getAllAgentConfigs(): AgentConfig[] {
    return this.agentConfigs;
  }
}