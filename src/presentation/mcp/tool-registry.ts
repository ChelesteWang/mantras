/**
 * 工具注册系统 - 统一管理 MCP 工具的注册和配置
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export interface ToolMetadata {
  category: string;
  version: string;
  deprecated?: boolean;
  rateLimit?: RateLimitConfig;
  permissions?: string[];
  tags?: string[];
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  schema: z.ZodSchema;
  handler: ToolHandler;
  metadata: ToolMetadata;
}

export type ToolHandler = (args: any) => Promise<any>;

export interface ToolExecutionContext {
  toolName: string;
  args: any;
  timestamp: Date;
  requestId: string;
}

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: Error;
  duration: number;
  metadata?: Record<string, any>;
}

export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();
  private rateLimiters = new Map<string, RateLimiter>();
  private executionHistory: ToolExecutionResult[] = [];
  private middlewares: ToolMiddleware[] = [];

  /**
   * 注册工具
   */
  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool '${tool.name}' is already registered`);
    }

    // 验证工具定义
    this.validateToolDefinition(tool);

    this.tools.set(tool.name, tool);

    // 设置速率限制
    if (tool.metadata.rateLimit) {
      this.rateLimiters.set(tool.name, new RateLimiter(tool.metadata.rateLimit));
    }
  }

  /**
   * 批量注册工具
   */
  registerAll(tools: ToolDefinition[]): void {
    tools.forEach(tool => this.register(tool));
  }

  /**
   * 注册到 MCP 服务器
   */
  registerToServer(server: McpServer): void {
    this.tools.forEach(tool => {
      // 将 Zod schema 转换为 MCP 期望的格式
      const schemaObject = tool.schema instanceof z.ZodObject ? tool.schema.shape : {};

      server.tool(tool.name, tool.description, schemaObject, async (args: any) => {
        return this.executeWithMiddleware(tool, args);
      });
    });
  }

  /**
   * 添加中间件
   */
  addMiddleware(middleware: ToolMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * 执行工具（带中间件支持）
   */
  private async executeWithMiddleware(tool: ToolDefinition, args: any): Promise<any> {
    const context: ToolExecutionContext = {
      toolName: tool.name,
      args,
      timestamp: new Date(),
      requestId: this.generateRequestId(),
    };

    const startTime = Date.now();
    let result: ToolExecutionResult = {
      success: false,
      duration: 0,
    };

    try {
      // 检查速率限制
      await this.checkRateLimit(tool.name);

      // 执行前置中间件
      for (const middleware of this.middlewares) {
        if (middleware.before) {
          await middleware.before(context);
        }
      }

      // 执行工具
      const data = await tool.handler(args);

      result = {
        success: true,
        data,
        duration: Date.now() - startTime,
      };

      // 执行后置中间件
      for (const middleware of this.middlewares) {
        if (middleware.after) {
          await middleware.after(context, result);
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      result = {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        duration: Date.now() - startTime,
      };

      // 执行错误中间件
      for (const middleware of this.middlewares) {
        if (middleware.onError) {
          await middleware.onError(context, result);
        }
      }

      throw error;
    } finally {
      // 记录执行历史
      this.executionHistory.push(result);

      // 限制历史记录数量
      if (this.executionHistory.length > 1000) {
        this.executionHistory = this.executionHistory.slice(-500);
      }
    }
  }

  /**
   * 获取工具定义
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * 获取所有工具
   */
  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * 按类别获取工具
   */
  getToolsByCategory(category: string): ToolDefinition[] {
    return this.getAllTools().filter(tool => tool.metadata.category === category);
  }

  /**
   * 按标签获取工具
   */
  getToolsByTag(tag: string): ToolDefinition[] {
    return this.getAllTools().filter(tool => tool.metadata.tags?.includes(tag));
  }

  /**
   * 搜索工具
   */
  searchTools(query: string): ToolDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTools().filter(
      tool =>
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery) ||
        tool.metadata.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 获取工具统计信息
   */
  getToolStats(): ToolStats {
    const tools = this.getAllTools();
    const categories = new Map<string, number>();

    tools.forEach(tool => {
      const category = tool.metadata.category;
      categories.set(category, (categories.get(category) || 0) + 1);
    });

    const recentExecutions = this.executionHistory.slice(-100);
    const successRate =
      recentExecutions.length > 0
        ? recentExecutions.filter(r => r.success).length / recentExecutions.length
        : 0;

    const avgDuration =
      recentExecutions.length > 0
        ? recentExecutions.reduce((sum, r) => sum + r.duration, 0) / recentExecutions.length
        : 0;

    return {
      totalTools: tools.length,
      categoriesCount: categories.size,
      categoryBreakdown: Object.fromEntries(categories),
      totalExecutions: this.executionHistory.length,
      successRate,
      averageDuration: avgDuration,
      deprecatedTools: tools.filter(t => t.metadata.deprecated).length,
    };
  }

  /**
   * 验证工具定义
   */
  private validateToolDefinition(tool: ToolDefinition): void {
    if (!tool.name || typeof tool.name !== 'string') {
      throw new Error('Tool name is required and must be a string');
    }

    if (!tool.description || typeof tool.description !== 'string') {
      throw new Error('Tool description is required and must be a string');
    }

    if (!tool.schema) {
      throw new Error('Tool schema is required');
    }

    if (!tool.handler || typeof tool.handler !== 'function') {
      throw new Error('Tool handler is required and must be a function');
    }

    if (!tool.metadata || !tool.metadata.category) {
      throw new Error('Tool metadata with category is required');
    }
  }

  /**
   * 检查速率限制
   */
  private async checkRateLimit(toolName: string): Promise<void> {
    const rateLimiter = this.rateLimiters.get(toolName);
    if (rateLimiter && !rateLimiter.tryAcquire()) {
      throw new Error(`Rate limit exceeded for tool: ${toolName}`);
    }
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 速率限制器
 */
class RateLimiter {
  private requests: number[] = [];

  constructor(private config: RateLimitConfig) {}

  tryAcquire(): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // 清理过期的请求
    this.requests = this.requests.filter(time => time > windowStart);

    // 检查是否超过限制
    if (this.requests.length >= this.config.maxRequests) {
      return false;
    }

    // 记录新请求
    this.requests.push(now);
    return true;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const validRequests = this.requests.filter(time => time > windowStart);
    return Math.max(0, this.config.maxRequests - validRequests.length);
  }
}

/**
 * 工具中间件接口
 */
export interface ToolMiddleware {
  before?(context: ToolExecutionContext): Promise<void>;
  after?(context: ToolExecutionContext, result: ToolExecutionResult): Promise<void>;
  onError?(context: ToolExecutionContext, result: ToolExecutionResult): Promise<void>;
}

/**
 * 工具统计信息
 */
export interface ToolStats {
  totalTools: number;
  categoriesCount: number;
  categoryBreakdown: Record<string, number>;
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  deprecatedTools: number;
}

// 全局工具注册表实例
export const toolRegistry = new ToolRegistry();
