import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { logger, NotFoundError, ConfigurationError } from '@mantras-next/core';
import { Agent, AgentConfig } from '../interfaces';
import { BaseAgent } from '../base/base-agent';
import { SimpleAgent } from '../implementations/simple-agent';

/**
 * 智能体管理器
 * 负责管理和协调多个智能体
 */
export class AgentManager {
  /**
   * 智能体映射表
   */
  private agents: Map<string, Agent> = new Map();
  
  /**
   * 智能体配置映射表
   */
  private agentConfigs: Map<string, AgentConfig> = new Map();
  
  /**
   * 构造函数
   * @param configDirectoryPath 配置目录路径
   */
  constructor(configDirectoryPath?: string) {
    if (configDirectoryPath) {
      this.loadAgentsFromDirectory(configDirectoryPath);
    }
  }
  
  /**
   * 从目录加载智能体配置
   * @param directoryPath 目录路径
   */
  public loadAgentsFromDirectory(directoryPath: string): void {
    try {
      // 检查目录是否存在
      if (!fs.existsSync(directoryPath)) {
        throw new Error(`Directory does not exist: ${directoryPath}`);
      }
      
      // 读取目录中的文件
      const files = fs.readdirSync(directoryPath);
      
      // 过滤YAML文件
      const yamlFiles = files.filter(file => 
        file.endsWith('.yaml') || file.endsWith('.yml')
      );
      
      logger.info(`[AgentManager] Found ${yamlFiles.length} YAML files in ${directoryPath}`);
      
      // 加载每个YAML文件
      for (const file of yamlFiles) {
        const filePath = path.join(directoryPath, file);
        try {
          // 加载配置
          const config = this.loadAgentConfigFromYaml(filePath);
          
          // 创建智能体
          const agent = this.createAgentFromConfig(config);
          
          // 注册智能体
          this.registerAgent(agent, config);
          
          logger.info(`[AgentManager] Successfully loaded and created agent from ${file}: ${config.name} (${config.id})`);
        } catch (error) {
          logger.error(`[AgentManager] Error processing agent config file ${file}:`, error);
        }
      }
    } catch (error) {
      logger.error(`[AgentManager] Error reading agent configuration directory ${directoryPath}:`, error);
      throw new ConfigurationError(`Failed to load agents from directory: ${directoryPath}`, { cause: error });
    }
  }
  
  /**
   * 从YAML文件加载智能体配置
   * @param filePath 文件路径
   * @returns 智能体配置
   */
  public loadAgentConfigFromYaml(filePath: string): AgentConfig {
    try {
      // 读取文件内容
      const fileContents = fs.readFileSync(filePath, 'utf8');
      
      // 解析YAML
      const config = yaml.load(fileContents) as AgentConfig;
      
      // 验证配置
      if (!config || !config.id || !config.name) {
        throw new ConfigurationError('Invalid agent configuration: id and name are required.');
      }
      
      logger.debug(`[AgentManager] Loaded agent configuration from ${filePath}: ${config.name} (${config.id})`);
      return config;
    } catch (error) {
      logger.error(`[AgentManager] Error loading agent configuration from ${filePath}:`, error);
      throw new ConfigurationError(`Failed to load agent configuration from ${filePath}`, { cause: error });
    }
  }
  
  /**
   * 从配置创建智能体
   * @param config 智能体配置
   * @returns 智能体实例
   */
  public createAgentFromConfig(config: AgentConfig): Agent {
    // 创建简单智能体
    // 在实际应用中，应该根据配置类型创建不同的智能体
    const agent = new SimpleAgent(config);
    
    logger.debug(`[AgentManager] Created agent: ${agent.name} (${agent.id})`);
    return agent;
  }
  
  /**
   * 注册智能体
   * @param agent 智能体实例
   * @param config 智能体配置
   */
  public registerAgent(agent: Agent, config: AgentConfig): void {
    // 检查是否已存在
    if (this.agents.has(agent.id)) {
      logger.warn(`[AgentManager] Agent with ID ${agent.id} already exists, replacing`);
    }
    
    // 注册智能体
    this.agents.set(agent.id, agent);
    this.agentConfigs.set(agent.id, config);
    
    logger.info(`[AgentManager] Registered agent: ${agent.name} (${agent.id})`);
  }
  
  /**
   * 注销智能体
   * @param agentId 智能体ID
   * @returns 是否成功注销
   */
  public unregisterAgent(agentId: string): boolean {
    // 检查是否存在
    if (!this.agents.has(agentId)) {
      logger.warn(`[AgentManager] Agent with ID ${agentId} does not exist`);
      return false;
    }
    
    // 注销智能体
    this.agents.delete(agentId);
    this.agentConfigs.delete(agentId);
    
    logger.info(`[AgentManager] Unregistered agent: ${agentId}`);
    return true;
  }
  
  /**
   * 获取智能体
   * @param agentId 智能体ID
   * @returns 智能体实例
   */
  public getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }
  
  /**
   * 获取智能体，如果不存在则抛出错误
   * @param agentId 智能体ID
   * @returns 智能体实例
   * @throws 如果智能体不存在
   */
  public getAgentOrThrow(agentId: string): Agent {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new NotFoundError(`Agent not found: ${agentId}`, 'agent', agentId);
    }
    return agent;
  }
  
  /**
   * 获取所有智能体
   * @returns 智能体数组
   */
  public getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }
  
  /**
   * 获取智能体配置
   * @param agentId 智能体ID
   * @returns 智能体配置
   */
  public getAgentConfig(agentId: string): AgentConfig | undefined {
    return this.agentConfigs.get(agentId);
  }
  
  /**
   * 获取所有智能体配置
   * @returns 智能体配置数组
   */
  public getAllAgentConfigs(): AgentConfig[] {
    return Array.from(this.agentConfigs.values());
  }
  
  /**
   * 生成智能体的Markdown文档
   * @param agentId 智能体ID
   * @returns Markdown文档
   */
  public generateAgentMarkdown(agentId: string): string {
    // 获取智能体和配置
    const agent = this.getAgentOrThrow(agentId);
    const config = this.getAgentConfig(agentId);
    
    if (!config) {
      throw new NotFoundError(`Agent configuration not found: ${agentId}`, 'agent_config', agentId);
    }
    
    // 生成Markdown
    let markdown = `# 智能体: ${agent.name} (ID: ${agent.id})\n\n`;
    
    // 添加描述
    if (agent.description) {
      markdown += `${agent.description}\n\n`;
    }
    
    // 添加元数据
    if (Object.keys(agent.metadata).length > 0) {
      markdown += `## 元数据\n\n`;
      markdown += `\`\`\`json\n${JSON.stringify(agent.metadata, null, 2)}\n\`\`\`\n\n`;
    }
    
    // 添加工具
    if (agent.tools.length > 0) {
      markdown += `## 工具\n\n`;
      
      for (const tool of agent.tools) {
        markdown += `### ${tool.name} (ID: ${tool.id})\n\n`;
        
        if (tool.description) {
          markdown += `${tool.description}\n\n`;
        }
        
        markdown += `- 类别: ${tool.category}\n`;
        
        if (tool.requiredPermissions && tool.requiredPermissions.length > 0) {
          markdown += `- 所需权限: ${tool.requiredPermissions.join(', ')}\n`;
        }
        
        markdown += `\n`;
      }
    }
    
    // 添加记忆系统
    if (agent.memory) {
      markdown += `## 记忆系统\n\n`;
      markdown += `- 名称: ${agent.memory.name}\n`;
      markdown += `- ID: ${agent.memory.id}\n`;
      
      if (agent.memory.description) {
        markdown += `- 描述: ${agent.memory.description}\n`;
      }
      
      markdown += `\n`;
    }
    
    return markdown;
  }
  
  /**
   * 生成所有智能体的Markdown文档并保存到目录
   * @param outputDirectoryPath 输出目录路径
   */
  public generateAllAgentsMarkdown(outputDirectoryPath: string): void {
    try {
      // 确保目录存在
      if (!fs.existsSync(outputDirectoryPath)) {
        fs.mkdirSync(outputDirectoryPath, { recursive: true });
      }
      
      // 获取所有智能体
      const agents = this.getAllAgents();
      
      logger.info(`[AgentManager] Generating Markdown for ${agents.length} agents to ${outputDirectoryPath}`);
      
      // 生成每个智能体的Markdown
      for (const agent of agents) {
        try {
          // 生成Markdown
          const markdown = this.generateAgentMarkdown(agent.id);
          
          // 保存到文件
          const filePath = path.join(outputDirectoryPath, `${agent.id}.md`);
          fs.writeFileSync(filePath, markdown, 'utf8');
          
          logger.info(`[AgentManager] Generated Markdown for agent ${agent.name} at ${filePath}`);
        } catch (error) {
          logger.error(`[AgentManager] Error generating Markdown for agent ${agent.name}:`, error);
        }
      }
    } catch (error) {
      logger.error(`[AgentManager] Error generating Markdown:`, error);
      throw error;
    }
  }
}