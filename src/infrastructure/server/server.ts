/**
 * Mantras MCP 服务器 - 集成重构后的架构模式
 * 支持依赖注入、配置管理、错误处理和监控
 */

import { BuildOptimizedAssetRepository } from '../../core/assets/build-optimized-asset-repository';
import { MarkdownAssetRepository } from '../../core/assets/markdown-asset-repository';
import { PersonaSummoner } from '../../core/personas/persona-summoner';
import { PROMPT_TEMPLATES } from '../../core/templates/prompt-templates';
import { initTool } from '../../tools/init.tool';
import { MemoryManagementTool, MemoryAnalysisTool } from '../../tools/memory.tool';
import { createImprovedIntentAnalysisTools } from '../../tools/improved-intent-analysis';
import { Command } from 'commander';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 导入重构后的架构组件
import { DIContainer } from '../../shared/container/di-container';
import { ConfigManager } from '../config/environment';
import { GlobalErrorHandler, createErrorContext } from '../../shared/errors/error-handler';

/**
 * 应用程序类 - 封装服务器逻辑
 */
class MantrasApplication {
  private server: McpServer;
  private container: DIContainer;
  private configManager: ConfigManager;
  private isInitialized = false;

  constructor() {
    this.container = new DIContainer();
    this.configManager = ConfigManager.getInstance();
    
    // 创建 MCP 服务器
    this.server = new McpServer({
      name: this.configManager.get('app').name,
      version: this.configManager.get('app').version
    });
  }

  /**
   * 初始化应用程序
   */
  async initialize(options: any): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🚀 Initializing Mantras MCP Server...');
      
      // 1. 设置错误处理
      this.setupErrorHandling();
      
      // 2. 更新配置
      this.updateConfigFromOptions(options);
      
      // 3. 验证配置
      this.validateConfiguration();
      
      // 4. 注册服务
      this.registerServices();
      
      // 5. 注册工具
      await this.registerTools();
      
      // 6. 设置监控
      this.setupMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Application initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      throw error;
    }
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Application must be initialized before starting');
    }

    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      console.log(`🚀 ${this.configManager.get('app').name} started successfully`);
      console.log(`📊 Environment: ${this.configManager.get('nodeEnv')}`);
      console.log(`🔧 Features: ${this.getEnabledFeatures().join(', ')}`);
      
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      throw error;
    }
  }

  /**
   * 优雅关闭
   */
  async shutdown(): Promise<void> {
    try {
      console.log('🔄 Shutting down gracefully...');
      
      // 清理资源
      this.container.clearSingletons();
      
      console.log('✅ Shutdown completed');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(): void {
    // 添加全局错误监听器
    GlobalErrorHandler.addErrorListener((error, context) => {
      console.error('Global error caught:', {
        error: error.message,
        code: error.code,
        context
      });
    });

    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      GlobalErrorHandler.handle(error);
      process.exit(1);
    });

    // 处理未处理的 Promise 拒绝
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      const error = reason instanceof Error ? reason : new Error(String(reason));
      GlobalErrorHandler.handle(error);
    });

    console.log('✅ Error handling configured');
  }

  /**
   * 从命令行选项更新配置
   */
  private updateConfigFromOptions(options: any): void {
    const configUpdates: any = {};
    
    if (options.assetsDir) {
      configUpdates.assets = { 
        ...this.configManager.get('assets'),
        directory: options.assetsDir 
      };
    }
    
    if (options.useBuildAssets) {
      configUpdates.assets = { 
        ...this.configManager.get('assets'),
        useBuildAssets: true 
      };
    }
    
    if (Object.keys(configUpdates).length > 0) {
      this.configManager.updateConfig(configUpdates);
    }
  }

  /**
   * 验证配置
   */
  private validateConfiguration(): void {
    const validation = this.configManager.validateConfig();
    if (!validation.valid) {
      const errors = validation.errors?.map(e => e.message).join(', ') || 'Unknown errors';
      throw new Error(`Configuration validation failed: ${errors}`);
    }
  }

  /**
   * 注册服务到依赖注入容器
   */
  private registerServices(): void {
    // 注册配置管理器
    this.container.registerSingleton('ConfigManager', () => this.configManager);
    
    // 注册资产仓库
    this.container.registerSingleton('AssetRepository', () => {
      const assetsConfig = this.configManager.get('assets');
      const fallbackRepository = new MarkdownAssetRepository(assetsConfig.directory);
      
      return assetsConfig.useBuildAssets 
        ? new BuildOptimizedAssetRepository(assetsConfig.buildAssetsPath, fallbackRepository)
        : fallbackRepository;
    });
    
    // 注册人格召唤器
    this.container.registerSingleton('PersonaSummoner', () => new PersonaSummoner());
    
    // 注册记忆工具
    this.container.registerSingleton('MemoryManagementTool', () => {
      const personaSummoner = this.container.resolve<PersonaSummoner>('PersonaSummoner');
      return new MemoryManagementTool(personaSummoner);
    });
    
    this.container.registerSingleton('MemoryAnalysisTool', () => {
      const personaSummoner = this.container.resolve<PersonaSummoner>('PersonaSummoner');
      return new MemoryAnalysisTool(personaSummoner);
    });
    
    console.log('✅ Services registered successfully');
  }

  /**
   * 注册工具到 MCP 服务器
   */
  private async registerTools(): Promise<void> {
    // 获取服务实例
    const repository = this.container.resolve('AssetRepository') as MarkdownAssetRepository | BuildOptimizedAssetRepository;
    const personaSummoner = this.container.resolve('PersonaSummoner') as PersonaSummoner;
    const memoryManagementTool = this.container.resolve('MemoryManagementTool') as MemoryManagementTool;
    const memoryAnalysisTool = this.container.resolve('MemoryAnalysisTool') as MemoryAnalysisTool;

    // 注册 init 工具 - 系统初始化和概览
    this.server.tool(
      "init",
      "Initialize and provide comprehensive overview of the Mantra MCP system for AI agents",
      {
        includeExamples: z.boolean().optional().describe("Whether to include usage examples"),
        includeArchitecture: z.boolean().optional().describe("Whether to include system architecture details")
      },
      async ({ includeExamples, includeArchitecture }) => {
        const result = await initTool.execute({ includeExamples, includeArchitecture });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
    );

    // 注册工具 - 使用registerTool with proper parameter extraction
    this.server.tool(
      "list_assets",
      "List all available assets including personas, prompts, and tools",
      {},
      async () => {
        const assets = await repository.getAssets();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(assets, null, 2)
            }
          ]
        };
      }
    );

    this.server.tool(
      "get_asset",
      "Get specific asset by ID",
      { assetId: z.string().describe("Asset ID to retrieve") },
      async ({ assetId }) => {
        const asset = await repository.getAssetById(assetId);

        if (!asset) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "Invalid asset ID",
                  requestedAssetId: assetId,
                  available: (await repository.getAssets()).map(a => a.id)
                }, null, 2)
              }
            ]
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(asset, null, 2)
            }
          ]
        };
      }
    );

    this.server.tool(
      "list_personas",
      "List all available persona definitions",
      {},
      async () => {
        const personas = personaSummoner.getPersonas();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(personas, null, 2)
            }
          ]
        };
      }
    );

    this.server.tool(
      "summon_persona",
      "Summon or activate a specific persona",
      {
        personaId: z.string().optional().describe("Specific persona ID to summon"),
        intent: z.string().optional().describe("Intent/type of interaction (e.g., 'technical', 'creative', 'analytical')"),
        customParams: z.record(z.any()).optional().describe("Custom parameters for persona customization")
      },
      async ({ personaId, intent, customParams }) => {
        const summoned = personaSummoner.summonPersona({
          personaId,
          intent,
          customParams
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(summoned, null, 2)
            }
          ]
        };
      }
    );

    this.server.tool(
      "analyze_user_intent",
      "深度分析用户意图，提供多维度洞察数据供 AI 自主决策使用",
      {
        userInput: z.string().describe("用户的输入内容"),
        context: z.string().optional().describe("对话上下文"),
        analysisDepth: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed').describe("分析深度")
      },
      async ({ userInput, context, analysisDepth }) => {
        const improvedTools = createImprovedIntentAnalysisTools();
        const analyzeIntentTool = improvedTools.find(tool => tool.name === 'analyze_user_intent');
        
        if (!analyzeIntentTool) {
          throw new Error('analyze_user_intent tool not found');
        }
        
        const result = await analyzeIntentTool.handler({ userInput, context, analysisDepth });
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
    );

    this.server.tool(
      "get_persona_options",
      "获取所有可用人格的详细信息，供 AI 选择使用",
      {
        includeCapabilities: z.boolean().default(true).describe("是否包含能力信息"),
        filterByDomain: z.string().optional().describe("按领域筛选")
      },
      async ({ includeCapabilities, filterByDomain }) => {
        const improvedTools = createImprovedIntentAnalysisTools();
        const getPersonaOptionsTool = improvedTools.find(tool => tool.name === 'get_persona_options');
        
        if (!getPersonaOptionsTool) {
          throw new Error('get_persona_options tool not found');
        }
        
        const result = await getPersonaOptionsTool.handler({ includeCapabilities, filterByDomain });
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
    );

    this.server.tool(
      "evaluate_persona_match",
      "评估特定人格与用户需求的匹配度",
      {
        personaId: z.string().describe("人格ID"),
        userIntent: z.string().describe("用户意图"),
        requirements: z.array(z.string()).optional().describe("特定要求")
      },
      async ({ personaId, userIntent, requirements }) => {
        const improvedTools = createImprovedIntentAnalysisTools();
        const evaluateMatchTool = improvedTools.find(tool => tool.name === 'evaluate_persona_match');
        
        if (!evaluateMatchTool) {
          throw new Error('evaluate_persona_match tool not found');
        }
        
        const result = await evaluateMatchTool.handler({ personaId, userIntent, requirements });
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
    );

    this.server.tool(
      "list_active_sessions",
      "List all active persona sessions",
      {},
      async () => {
        const sessions = personaSummoner.getActiveSessions();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(sessions, null, 2)
            }
          ]
        };
      }
    );

    this.server.tool(
      "get_session",
      "Get details of a specific session",
      { sessionId: z.string().describe("The ID of the session to retrieve") },
      async ({ sessionId }) => {
        const session = personaSummoner.getSession(sessionId);
        if (session) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(session, null, 2)
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ error: "Session not found" }, null, 2)
              }
            ]
          };
        }
      }
    );

    this.server.tool(
      "release_session",
      "End an active persona session",
      { sessionId: z.string().describe("Session ID to release") },
      async ({ sessionId }) => {
        const released = personaSummoner.releaseSession(sessionId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: released,
                message: released ? `Session ${sessionId} released` : 'Session not found'
              }, null, 2)
            }
          ]
        };
      }
    );

    this.server.tool(
      "synthesize_persona",
      "Create new persona by combining existing ones",
      {
        basePersonaIds: z.array(z.string()).describe("Array of base persona IDs to combine"),
        customName: z.string().optional().describe("Custom name for synthesized persona")
      },
      async ({ basePersonaIds, customName }) => {
        if (!basePersonaIds || basePersonaIds.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "Cannot synthesize persona from an empty list of base personas."
                }, null, 2)
              }
            ]
          };
        }
        const synthesized = personaSummoner.synthesizePersona(basePersonaIds, customName);
        const asset = personaSummoner.toAsset(synthesized);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                synthesizedPersona: asset,
                message: `Created synthesized persona: ${synthesized.name}`
              }, null, 2)
            }
          ]
        };
      }
    );

    // 提示工程增强功能
    this.server.tool(
      "list_mantras",
      "List all available Mantra templates",
      {
        category: z.string().optional().describe("Filter by category")
      },
      async ({ category }) => {
        let templates = PROMPT_TEMPLATES;
        
        if (category) {
          templates = templates.filter(template => template.category === category);
        }
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                templates: templates.map(t => ({
                  id: t.id,
                  name: t.name,
                  description: t.description,
                  technique: t.technique,
                  category: t.category,
                  parameters: t.parameters
                })),
                availableCategories: [...new Set(PROMPT_TEMPLATES.map(t => t.category))]
              }, null, 2)
            }
          ]
        };
      }
    );

    this.server.tool(
      "apply_mantra",
      "Apply a Mantra template with user inputs",
      {
        templateName: z.string().describe("Name of the Mantra template to apply"),
        inputs: z.record(z.string()).describe("User inputs for the template slots")
      },
      async ({ templateName, inputs }) => {
        // 支持通过 name 或 id 查找模板
        const template = PROMPT_TEMPLATES.find(t => 
          t.id === templateName || t.name === templateName
        );
        
        if (!template) {
          throw new Error(`Template "${templateName}" not found. Available templates: ${PROMPT_TEMPLATES.map(t => t.id).join(', ')}`);
        }
        
        // 检查必需参数
        const missingParams = template.parameters.filter((param: string) => !inputs[param]);
        if (missingParams.length > 0) {
          throw new Error(`Missing required parameters: ${missingParams.join(', ')}. Required: ${template.parameters.join(', ')}`);
        }
        
        // 应用模板
        let result = template.template;
        template.parameters.forEach((param: string) => {
          const value = inputs[param] || '';
          result = result.replace(new RegExp(`{${param}}`, 'g'), value);
        });
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                appliedTemplate: {
                  id: template.id,
                  name: template.name,
                  technique: template.technique,
                  category: template.category
                },
                prompt: result,
                usedInputs: inputs
              }, null, 2)
            }
          ]
        };
      }
    );

    this.server.tool(
      "create_execution_plan",
      "Create an execution plan for a complex task",
      {
        userRequest: z.string().describe("The user's request or task description"),
        includeContext: z.boolean().optional().describe("Whether to include project context")
      },
      async ({ userRequest, includeContext = false }) => {
        // 简化的执行计划生成
        const planId = `plan_${Date.now()}`;
        
        // 基于用户请求分析任务类型
        const taskType = userRequest.toLowerCase().includes('debug') ? 'debugging' :
                        userRequest.toLowerCase().includes('refactor') ? 'refactoring' :
                        userRequest.toLowerCase().includes('implement') ? 'implementation' :
                        userRequest.toLowerCase().includes('review') ? 'code-review' : 'general';
        
        // 推荐相关的提示模板
        const relevantTemplates = PROMPT_TEMPLATES.filter(t => 
          t.category === taskType || 
          userRequest.toLowerCase().includes(t.technique.replace('_', ' '))
        );
        
        const plan = {
          id: planId,
          userRequest,
          taskType,
          recommendedTemplates: relevantTemplates.map(t => ({
            id: t.id,
            name: t.name,
            technique: t.technique,
            description: t.description
          })),
          steps: [
            "1. 分析问题和需求",
            "2. 选择合适的提示模板",
            "3. 准备必要的输入参数",
            "4. 应用模板生成提示",
            "5. 执行和验证结果"
          ],
          createdAt: new Date().toISOString()
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(plan, null, 2)
            }
          ]
        };
      }
    );

    this.server.tool(
      "execute_plan",
      "Execute a previously created execution plan",
      {
        planId: z.string().describe("The ID of the plan to execute")
      },
      async ({ planId }) => {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `Plan ${planId} execution started. Please use the recommended templates from the plan.`,
                status: "ready_for_template_application"
              }, null, 2)
            }
          ]
        };
      }
    );

    this.server.tool(
      "get_project_context",
      "Collect and return project context information",
      {
        includeFileStructure: z.boolean().optional().describe("Include file structure in context"),
        maxRelevantFiles: z.number().optional().describe("Maximum number of relevant files to include")
      },
      async ({ includeFileStructure = true, maxRelevantFiles = 10 }) => {
        // 简化的项目上下文收集
        const allAssets = await repository.getAssets();
        const personas = allAssets.filter(asset => asset.type === 'persona');
        const tools = allAssets.filter(asset => asset.type === 'tool');
        
        const context = {
          projectType: "Mantras MCP Server",
          mainLanguage: "TypeScript",
          framework: "Model Context Protocol",
          keyFeatures: [
            "Asset Management",
            "Persona Summoning", 
            "Prompt Engineering Templates",
            "Session Management"
          ],
          availableAssets: {
            personas: personas.length,
            promptTemplates: PROMPT_TEMPLATES.length,
            tools: tools.length
          },
          contextCollectedAt: new Date().toISOString()
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(context, null, 2)
            }
          ]
        };
      }
    );

    // 注册记忆管理工具
    this.server.tool(
      "manage_memory",
      "Manage agent memory including conversations, context, and long-term memories",
      {
        action: z.enum(['add_memory', 'search_memories', 'get_stats', 'add_conversation', 'get_conversation_history', 'set_context', 'get_context']).describe("Action to perform"),
        sessionId: z.string().optional().describe("Session ID for session-specific operations"),
        memoryType: z.enum(['conversation', 'context', 'preference', 'fact', 'task']).optional().describe("Type of memory to add"),
        content: z.any().optional().describe("Content to store in memory"),
        importance: z.number().min(1).max(10).optional().describe("Importance score (1-10)"),
        tags: z.array(z.string()).optional().describe("Tags for categorizing memory"),
        query: z.string().optional().describe("Search query for finding memories"),
        role: z.enum(['user', 'assistant', 'system']).optional().describe("Role for conversation entries"),
        limit: z.number().optional().describe("Limit for returned results"),
        contextUpdates: z.record(z.any()).optional().describe("Context updates to apply"),
        metadata: z.record(z.any()).optional().describe("Additional metadata")
      },
      async (args) => {
        const result = await memoryManagementTool.execute(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
    );

    // 注册记忆分析工具
    this.server.tool(
      "analyze_memory",
      "Analyze and provide insights about agent memory patterns and content",
      {
        action: z.enum(['analyze_patterns', 'get_insights', 'find_connections', 'memory_timeline']).describe("Analysis action to perform"),
        sessionId: z.string().optional().describe("Session ID for session-specific analysis"),
        timeRange: z.object({
          start: z.string().optional().describe("Start time for analysis range"),
          end: z.string().optional().describe("End time for analysis range")
        }).optional().describe("Time range for analysis"),
        minImportance: z.number().min(1).max(10).optional().describe("Minimum importance level for analysis"),
        tags: z.array(z.string()).optional().describe("Tags to focus analysis on")
      },
      async (args) => {
        const result = await memoryAnalysisTool.execute(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
    );

    console.log('✅ All tools registered successfully');
  }

  /**
   * 获取启用的功能列表
   */
  private getEnabledFeatures(): string[] {
    const features = this.configManager.get('features');
    return Object.entries(features)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature);
  }

  /**
   * 设置监控
   */
  private setupMonitoring(): void {
    if (!this.configManager.get('monitoring').enabled) {
      return;
    }

    // 定期输出统计信息
    if (this.configManager.get('monitoring').metricsEnabled) {
      setInterval(() => {
        const errorStats = GlobalErrorHandler.getErrorStats();
        console.log('📊 System Statistics:', {
          timestamp: new Date().toISOString(),
          errorCounts: errorStats,
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime()
        });
      }, this.configManager.get('monitoring').healthCheckInterval);
    }

    console.log('✅ Monitoring configured');
  }

  /**
   * 获取服务器实例（用于工具注册）
   */
  getServer(): McpServer {
    return this.server;
  }

  /**
   * 获取容器实例
   */
  getContainer(): DIContainer {
    return this.container;
  }
}

// 解析命令行参数
const program = new Command();
program
  .option('--assets-dir <path>', 'Path to assets directory', './assets')
  .option('--use-build-assets', 'Use build-time optimized assets', false)
  .option('--log-level <level>', 'Log level', 'info')
  .parse(process.argv);
const options = program.opts();

// 创建应用程序实例
const app = new MantrasApplication();

// 先初始化应用程序，然后再解析服务
let repository: MarkdownAssetRepository | BuildOptimizedAssetRepository;
let personaSummoner: PersonaSummoner;
let memoryManagementTool: MemoryManagementTool;
let memoryAnalysisTool: MemoryAnalysisTool;
let server: McpServer;

// 启动服务器
const transport = new StdioServerTransport();

/**
 * 主函数 - 使用新的架构模式启动应用程序
 */
async function main(): Promise<void> {
  try {
    // 设置优雅关闭处理
    process.on('SIGINT', async () => {
      console.log('\n🔄 Received SIGINT, shutting down gracefully...');
      await app.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
      await app.shutdown();
      process.exit(0);
    });

    // 初始化应用程序（包括服务注册和工具注册）
    await app.initialize(options);
    
    // 启动服务器
    await app.start();

  } catch (error) {
    console.error('💥 Application failed to start:', error);
    process.exit(1);
  }
}

// 启动应用程序（如果直接运行此文件）
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
} else {
  // 如果作为模块导入，则使用传统方式启动（向后兼容）
  // 需要先初始化应用程序
  app.initialize(options).then(() => {
    app.start().then(() => {
      console.log('🚀 Mantras MCP Server started in compatibility mode');
    });
  });
}

// 导出应用程序类和服务实例
export { 
  MantrasApplication,
  app
};

