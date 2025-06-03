console.log('--- INDEX.TS IS RUNNING ---');
// src/index.ts
import { AgentManager } from './core/agent-manager';
import { Logger } from './core/logger';
import { IDEContext, IRule } from './interfaces';
import * as path from 'path';

async function main() {
  Logger.log('Starting Mantra Agent System Demo...');

  // Define paths relative to the project root or a known base
  // Assuming the script is run from the project root or `src` directory
  // Determine projectRoot based on whether 'src' is in __dirname
  const projectRoot = __dirname.includes(path.join('src'))
    ? path.resolve(__dirname, '..') 
    : path.resolve(__dirname, '..', '..'); // Adjusted for dist/src structure
  const agentConfigDir = path.join(projectRoot, 'config', 'agents');
  const markdownOutputDir = path.join(projectRoot, 'docs', 'agents');

  Logger.log(`Agent Config Directory: ${agentConfigDir}`);
  Logger.log(`Markdown Output Directory: ${markdownOutputDir}`);

  // 1. Instantiate AgentManager and load agents from YAML configurations
  const agentManager = new AgentManager(agentConfigDir);

  // List all loaded agent configurations
  const allAgentConfigs = agentManager.getAllAgentConfigs();
  if (allAgentConfigs.length > 0) {
    Logger.log(`Loaded ${allAgentConfigs.length} agent configurations:`);
    allAgentConfigs.forEach(config => {
      Logger.log(`  - Agent: ${config.name} (ID: ${config.id})`);
    });
  } else {
    Logger.warn('No agent configurations were loaded. Check the config directory and YAML files.');
    return; // Exit if no agents loaded
  }

  // 2. Get a specific agent by ID
  const sampleAgentId = 'agent-001';
  console.log(`[IndexTS] Trying to get agent with ID: ${sampleAgentId}`);
  const sampleAgent = agentManager.getAgentById(sampleAgentId);
  console.log('[IndexTS] sampleAgent is: ', sampleAgent);

  if (sampleAgent) {
    console.log('[IndexTS] sampleAgent is TRUTHY, proceeding with execution.');
    Logger.log(`Found agent: ${sampleAgent.name} (ID: ${sampleAgent.id})`);
    Logger.log(`  Learned items: ${sampleAgent.learnedItems.map(item => item.name).join(', ')}`);

    // 3. Try to execute an item from the agent
    const greeterItemId = 'item-001-greet';
    const fileReaderItemId = 'item-002-file-reader';

    try {
      console.log(`[IndexTS] Attempting to execute item: ${greeterItemId}`);
      Logger.log(`\nAttempting to execute item: ${greeterItemId}`);
      const ideContext: IDEContext = {
        user: { id: 'user-123', name: 'DemoUser' },
        currentFile: { path: '/path/to/current/file.ts', language: 'typescript' },
        project: { rootPath: projectRoot, name: 'MantraProject' },
      };
      const rules: IRule[] = [
        {
          id: 'rule-01', 
          name: 'Politeness Rule',
          description: 'Be polite',
          definition: { type: 'behavioural', instruction: 'Always use polite language.' },
          severity: 'info',
          scope: 'interaction'
        }
      ];
      
      const greetingResult = await sampleAgent.executeRegisteredItem(
        greeterItemId,
        ideContext,
        rules,
        { userName: 'Specific Demo User' } // Params for the greeter tool
      );
      console.log(`[IndexTS] Execution result for ${greeterItemId}:`, greetingResult);
      Logger.log(`Execution result for ${greeterItemId}: ${greetingResult}`);

      // Try executing an item without an executionPath (should be handled gracefully)
      console.log(`[IndexTS] Attempting to execute item: ${fileReaderItemId}`);
      Logger.log(`\nAttempting to execute item: ${fileReaderItemId} (expected to have no execution path)`);
      const fileReaderResult = await sampleAgent.executeRegisteredItem(fileReaderItemId);
      console.log(`[IndexTS] Execution result for ${fileReaderItemId}:`, fileReaderResult);
      Logger.log(`Execution result for ${fileReaderItemId}: ${fileReaderResult}`);

    } catch (error) {
      console.error('[IndexTS] Error during item execution demo:', error);
      Logger.error(`Error during item execution demo:`, error);
    }
  } else {
    console.log('[IndexTS] sampleAgent is FALSY.');
    Logger.warn(`Agent with ID ${sampleAgentId} not found.`);
  }

  // 4. Generate Markdown documentation for all loaded agents
  Logger.log(`\nGenerating Markdown documentation for all agents to: ${markdownOutputDir}`);
  agentManager.generateAllAgentsMarkdown(markdownOutputDir);
  Logger.log('Markdown generation complete.');

  Logger.log('\nMantra Agent System Demo Finished.');
}

main().catch(error => {
  console.error('[IndexTS] Unhandled error in main function:', error);
  Logger.error('Unhandled error in main function:', error);
  process.exit(1);
});

// Export AgentManager and other core components if this is the main library entry point
export { AgentManager, Logger, registry } from './core';
export * from './interfaces';
export { BaseAgent } from './agents/core/base.agent';