/**
 * 标准化的 MCP 工具基类 - 提供类型安全和错误处理
 */

import { z } from 'zod';

// 核心类型定义
export interface ToolExecutionResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: Error;
  readonly duration: number;
  readonly metadata: {
    readonly tool: string;
    readonly timestamp: string;
    readonly version: string;
  };
}

export interface ToolMetadata {
  readonly category: ToolCategory;
  readonly version: string;
  readonly tags: readonly string[];
  readonly deprecated?: boolean;
  readonly rateLimit?: RateLimitConfig;
}

export type ToolCategory = 
  | 'analysis' 
  | 'resource_discovery' 
  | 'scoring' 
  | 'comparison' 
  | 'suggestions'
  | 'transformation'
  | 'validation';

export interface RateLimitConfig {
  readonly maxRequests: number;
  readonly windowMs: number;
  readonly skipSuccessfulRequests?: boolean;
}

// 错误类型定义
export abstract class MCPError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  readonly timestamp: string;
  readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    this.context = context;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      context: this.context
    };
  }
}

export class ToolValidationError extends MCPError {
  readonly code = 'TOOL_VALIDATION_ERROR';
  readonly statusCode = 400;
}

export class ToolExecutionError extends MCPError {
  readonly code = 'TOOL_EXECUTION_ERROR';
  readonly statusCode = 500;
}

export class RateLimitExceededError extends MCPError {
  readonly code = 'RATE_LIMIT_EXCEEDED';
  readonly statusCode = 429;
}

// 验证工具
export class RuntimeValidator {
  static validateInput<T>(
    input: unknown, 
    schema: z.ZodSchema<T>
  ): { success: true; data: T } | { success: false; error: ToolValidationError } {
    try {
      const validated = schema.parse(input);
      return { success: true, data: validated };
    } catch (error) {
      const validationError = new ToolValidationError(
        'Input validation failed',
        { originalError: error, input }
      );
      return { success: false, error: validationError };
    }
  }
}

// 速率限制器
export class RateLimiter {
  private requests: number[] = [];

  constructor(private config: RateLimitConfig) {}

  tryAcquire(): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // 清理过期请求
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

// 标准化工具基类
export abstract class StandardMCPTool<TInput, TOutput> {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly schema: z.ZodSchema<TInput>;
  abstract readonly metadata: ToolMetadata;
  
  private rateLimiter?: RateLimiter;

  constructor() {
    // 延迟初始化速率限制器
    setTimeout(() => {
      if (this.metadata.rateLimit) {
        this.rateLimiter = new RateLimiter(this.metadata.rateLimit);
      }
    }, 0);
  }

  protected abstract executeCore(input: TInput): Promise<TOutput>;

  async execute(rawInput: unknown): Promise<ToolExecutionResult<TOutput>> {
    const startTime = Date.now();
    
    try {
      // 速率限制检查
      if (this.rateLimiter && !this.rateLimiter.tryAcquire()) {
        throw new RateLimitExceededError(
          `Rate limit exceeded for tool: ${this.name}`,
          { 
            tool: this.name,
            remainingRequests: this.rateLimiter.getRemainingRequests()
          }
        );
      }

      // 输入验证
      const validationResult = RuntimeValidator.validateInput(rawInput, this.schema);
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error,
          duration: Date.now() - startTime,
          metadata: {
            tool: this.name,
            timestamp: new Date().toISOString(),
            version: this.metadata.version
          }
        };
      }

      // 执行核心逻辑
      const result = await this.executeCore(validationResult.data);
      
      return {
        success: true,
        data: result,
        duration: Date.now() - startTime,
        metadata: {
          tool: this.name,
          timestamp: new Date().toISOString(),
          version: this.metadata.version
        }
      };
      
    } catch (error) {
      const mcpError = error instanceof MCPError 
        ? error 
        : new ToolExecutionError(
            `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`,
            { tool: this.name, originalError: error }
          );

      return {
        success: false,
        error: mcpError,
        duration: Date.now() - startTime,
        metadata: {
          tool: this.name,
          timestamp: new Date().toISOString(),
          version: this.metadata.version
        }
      };
    }
  }

  // 工具信息获取
  getInfo(): {
    name: string;
    description: string;
    metadata: ToolMetadata;
    schema: object;
  } {
    return {
      name: this.name,
      description: this.description,
      metadata: this.metadata,
      schema: this.schema._def // Zod schema 定义
    };
  }

  // 健康检查
  async healthCheck(): Promise<{ healthy: boolean; details?: string }> {
    try {
      // 子类可以重写此方法进行特定的健康检查
      return { healthy: true };
    } catch (error) {
      return { 
        healthy: false, 
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// 工具注册器增强版
export class EnhancedToolRegistry {
  private tools = new Map<string, StandardMCPTool<any, any>>();
  private executionMetrics = new Map<string, ToolMetrics>();

  register<TInput, TOutput>(tool: StandardMCPTool<TInput, TOutput>): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool '${tool.name}' is already registered`);
    }

    this.tools.set(tool.name, tool);
    this.executionMetrics.set(tool.name, {
      totalExecutions: 0,
      successCount: 0,
      totalDuration: 0,
      averageDuration: 0,
      successRate: 0,
      lastExecuted: null
    });
  }

  async executeTool<TOutput>(
    toolName: string, 
    input: unknown
  ): Promise<ToolExecutionResult<TOutput>> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    const result = await tool.execute(input);
    this.updateMetrics(toolName, result);
    
    return result as ToolExecutionResult<TOutput>;
  }

  getTool(name: string): StandardMCPTool<any, any> | undefined {
    return this.tools.get(name);
  }

  getAllTools(): StandardMCPTool<any, any>[] {
    return Array.from(this.tools.values());
  }

  getToolsByCategory(category: ToolCategory): StandardMCPTool<any, any>[] {
    return this.getAllTools().filter(tool => tool.metadata.category === category);
  }

  getMetrics(toolName?: string): ToolMetrics | Map<string, ToolMetrics> {
    if (toolName) {
      return this.executionMetrics.get(toolName) || {
        totalExecutions: 0,
        successCount: 0,
        totalDuration: 0,
        averageDuration: 0,
        successRate: 0,
        lastExecuted: null
      };
    }
    return new Map(this.executionMetrics);
  }

  async healthCheckAll(): Promise<Map<string, { healthy: boolean; details?: string }>> {
    const results = new Map<string, { healthy: boolean; details?: string }>();
    
    for (const [name, tool] of this.tools) {
      try {
        const health = await tool.healthCheck();
        results.set(name, health);
      } catch (error) {
        results.set(name, {
          healthy: false,
          details: `Health check failed: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
    
    return results;
  }

  private updateMetrics(toolName: string, result: ToolExecutionResult<any>): void {
    const metrics = this.executionMetrics.get(toolName);
    if (!metrics) return;

    metrics.totalExecutions++;
    metrics.totalDuration += result.duration;
    metrics.averageDuration = metrics.totalDuration / metrics.totalExecutions;
    
    if (result.success) {
      metrics.successCount++;
    }
    
    metrics.successRate = metrics.successCount / metrics.totalExecutions;
    metrics.lastExecuted = new Date().toISOString();
  }
}

export interface ToolMetrics {
  totalExecutions: number;
  successCount: number;
  totalDuration: number;
  averageDuration: number;
  successRate: number;
  lastExecuted: string | null;
}

// 示例工具实现
export class ExampleAnalysisTool extends StandardMCPTool<
  { input: string; options?: { includeMetadata?: boolean } },
  { analysis: string; metadata?: object }
> {
  readonly name = 'example_analysis';
  readonly description = '示例分析工具，展示标准化实现模式';
  readonly schema = z.object({
    input: z.string().min(1).describe('要分析的输入内容'),
    options: z.object({
      includeMetadata: z.boolean().optional().describe('是否包含元数据')
    }).optional()
  });
  readonly metadata: ToolMetadata = {
    category: 'analysis',
    version: '1.0.0',
    tags: ['example', 'analysis'],
    rateLimit: {
      maxRequests: 100,
      windowMs: 60000 // 1分钟
    }
  };

  protected async executeCore(input: {
    input: string;
    options?: { includeMetadata?: boolean };
  }): Promise<{ analysis: string; metadata?: object }> {
    // 模拟分析处理
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const result: { analysis: string; metadata?: object } = {
      analysis: `分析结果: ${input.input.length} 个字符`
    };

    if (input.options?.includeMetadata) {
      result.metadata = {
        processedAt: new Date().toISOString(),
        inputLength: input.input.length,
        processingTime: 10
      };
    }

    return result;
  }
}