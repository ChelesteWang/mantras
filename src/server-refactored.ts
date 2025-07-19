/**
 * 重构后的服务器入口文件 - 使用新的架构模式
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Command } from 'commander';

// 导入新的架构组件
import { container, DIContainer } from './shared/container/di-container';
import { toolRegistry, ToolRegistry } from './presentation/mcp/tool-registry';
import { config, ConfigManager } from './config/environment';
import { GlobalErrorHandler } from './shared/errors/error-handler';

// 导入现有组件（逐步迁移）
import { BuildOptimizedAssetRepository } from './build-optimized-asset-repository';
import { MarkdownAssetRepository } from './markdown-asset-repository';
import { PersonaSummoner } from './persona-summoner';
import { MemoryManagementTool, MemoryAnalysisTool } from './tools/memory.tool';

// 导入工具定义 (TODO: 创建这些工具文件)
// import { createInitTool } from './tools/init.tool';
// import { createAssetTools } from './tools/asset.tools';
// import { createPersonaTools } from './tools/persona.tools';
// import { createMantraTools } from './tools/mantra.tools';
// import { createMemoryTools } from './tools/memory.tools';

/**
 * 应用程序引导类
 */
class Application {
  private server: McpServer;
  private configManager: ConfigManager;
  private container: DIContainer;
  private toolRegistry: ToolRegistry;

  constructor() {
    this.configManager = ConfigManager.getInstance();
    this.container = container;
    this.toolRegistry = toolRegistry;
    
    // 创建 MCP 服务器
    this.server = new McpServer({
      name: this.configManager.get('app').name,
      version: this.configManager.get('app').version
    });
  }

  /**
   * 初始化应用程序
   */
  async initialize(): Promise<void> {
    try {
      // 1. 验证配置
      this.validateConfiguration();
      
      // 2. 注册服务
      this.registerServices();
      
      // 3. 注册工具
      await this.registerTools();
      
      // 4. 设置错误处理
      this.setupErrorHandling();
      
      // 5. 设置监控
      this.setupMonitoring();
      
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
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      console.log(`🚀 ${this.configManager.get('app').name} started successfully`);
      console.log(`📊 Configuration: ${this.configManager.get('nodeEnv')} mode`);
      console.log(`🔧 Features enabled: ${this.getEnabledFeatures().join(', ')}`);
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
   * 注册工具
   */
  private async registerTools(): Promise<void> {
    try {
      // TODO: 实现工具创建和注册
      // 暂时使用空数组，后续实现具体工具
      const allTools: any[] = [];
      
      /*
      // 创建工具实例
      const initTool = createInitTool();
      const assetTools = createAssetTools(this.container);
      const personaTools = createPersonaTools(this.container);
      const mantraTools = createMantraTools(this.container);
      const memoryTools = createMemoryTools(this.container);
      
      // 注册所有工具
      const allTools = [
        initTool,
        ...assetTools,
        ...personaTools,
        ...mantraTools,
        ...memoryTools
      ];
      */
      
      this.toolRegistry.registerAll(allTools);
      
      // 注册到 MCP 服务器
      this.toolRegistry.registerToServer(this.server);
      
      console.log(`✅ Registered ${allTools.length} tools successfully`);
    } catch (error) {
      console.error('❌ Failed to register tools:', error);
      throw error;
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
   * 设置监控
   */
  private setupMonitoring(): void {
    if (!this.configManager.get('monitoring').enabled) {
      return;
    }

    // 添加工具执行监控中间件
    this.toolRegistry.addMiddleware({
      before: async (context) => {
        console.log(`🔧 Executing tool: ${context.toolName}`);
      },
      
      after: async (context, result) => {
        console.log(`✅ Tool ${context.toolName} completed in ${result.duration}ms`);
      },
      
      onError: async (context, result) => {
        console.error(`❌ Tool ${context.toolName} failed:`, result.error?.message);
      }
    });

    // 定期输出统计信息
    if (this.configManager.get('monitoring').metricsEnabled) {
      setInterval(() => {
        const stats = this.toolRegistry.getToolStats();
        console.log('📊 Tool Statistics:', {
          totalTools: stats.totalTools,
          totalExecutions: stats.totalExecutions,
          successRate: `${(stats.successRate * 100).toFixed(1)}%`,
          avgDuration: `${stats.averageDuration.toFixed(1)}ms`
        });
      }, this.configManager.get('monitoring').healthCheckInterval);
    }

    console.log('✅ Monitoring configured');
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
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  // 解析命令行参数
  const program = new Command();
  program
    .option('--config <path>', 'Path to configuration file')
    .option('--assets-dir <path>', 'Path to assets directory', './assets')
    .option('--use-build-assets', 'Use build-time optimized assets', false)
    .option('--log-level <level>', 'Log level', 'info')
    .parse(process.argv);

  const options = program.opts();

  try {
    // 创建应用程序实例
    const app = new Application();

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

    // 初始化并启动应用程序
    await app.initialize();
    await app.start();

  } catch (error) {
    console.error('💥 Application failed to start:', error);
    process.exit(1);
  }
}

// 启动应用程序
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export { Application };