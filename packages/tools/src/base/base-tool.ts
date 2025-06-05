import {
  CallOptions,
  MantrasError,
  ToolExecutionError,
  ValidationError,
  eventBus,
  EventType,
  logger
} from '@mantras-next/core';
import { Tool, ToolConfig, ToolContext, ToolResult } from '../interfaces/tool';
import { z } from 'zod';

/**
 * 基础工具抽象类
 * 提供工具的基本实现
 */
export abstract class BaseTool<Input = any, Output = any> implements Tool<Input, Output> {
  /**
   * 工具ID
   */
  public readonly id: string;
  
  /**
   * 工具名称
   */
  public readonly name: string;
  
  /**
   * 工具描述
   */
  public readonly description: string;
  
  /**
   * 工具类别
   */
  public readonly category: string;
  
  /**
   * 工具所需权限
   */
  public readonly requiredPermissions: string[];
  
  /**
   * 工具元数据
   */
  public readonly metadata: Record<string, any>;
  
  /**
   * 工具输入输出模式
   */
  public abstract readonly schema: {
    input: z.ZodType<Input>;
    output: z.ZodType<Output>;
  };
  
  /**
   * 构造函数
   * @param config 工具配置
   */
  constructor(config: ToolConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description || '';
    this.category = config.category;
    this.requiredPermissions = config.requiredPermissions || [];
    this.metadata = config.metadata || {};
  }
  
  /**
   * 调用工具
   * @param input 输入数据
   * @param options 调用选项
   * @returns 输出数据
   */
  async call(input: Input, options?: CallOptions): Promise<Output> {
    const startTime = Date.now();
    const runId = options?.runId || `run-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    try {
      // 发出工具开始事件
      await eventBus.emit(EventType.TOOL_START, runId, {
        toolId: this.id,
        toolName: this.name,
        input
      });
      
      // 验证输入
      this.validateInput(input);
      
      // 提取上下文
      const context: ToolContext = {
        ideContext: options?.metadata?.ideContext,
        rules: options?.metadata?.rules,
        runId,
        metadata: options?.metadata
      };
      
      // 执行工具
      logger.debug(`[${this.name}] Executing with input:`, input);
      const result = await this.execute(input, context);
      
      // 验证输出
      this.validateOutput(result);
      
      // 发出工具结束事件
      const executionTime = Date.now() - startTime;
      await eventBus.emit(EventType.TOOL_END, runId, {
        toolId: this.id,
        toolName: this.name,
        output: result,
        executionTime
      });
      
      return result;
    } catch (error) {
      // 处理错误
      const toolError = this.handleError(error, runId);
      
      // 发出错误事件
      await eventBus.emit(EventType.ERROR, runId, {
        toolId: this.id,
        toolName: this.name,
        error: toolError
      });
      
      throw toolError;
    }
  }
  
  /**
   * 执行工具
   * 子类必须实现此方法
   * @param input 输入数据
   * @param context 工具上下文
   * @returns 输出数据
   */
  protected abstract execute(input: Input, context: ToolContext): Promise<Output>;
  
  /**
   * 验证输入
   * @param input 输入数据
   * @throws 如果输入无效
   */
  protected validateInput(input: Input): void {
    try {
      this.schema.input.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(`Invalid input for tool ${this.name}: ${error.message}`, {
          zodError: error,
          input
        });
      }
      throw error;
    }
  }
  
  /**
   * 验证输出
   * @param output 输出数据
   * @throws 如果输出无效
   */
  protected validateOutput(output: Output): void {
    try {
      this.schema.output.parse(output);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(`Invalid output from tool ${this.name}: ${error.message}`, {
          zodError: error,
          output
        });
      }
      throw error;
    }
  }
  
  /**
   * 处理错误
   * @param error 原始错误
   * @param runId 运行ID
   * @returns 处理后的错误
   */
  protected handleError(error: unknown, runId: string): Error {
    if (error instanceof MantrasError) {
      logger.error(`[${this.name}] Error:`, error);
      return error;
    }
    
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`[${this.name}] Execution error:`, error);
    
    return new ToolExecutionError(
      `Error executing tool ${this.name}: ${message}`,
      this.id,
      { originalError: error, runId }
    );
  }
  
  /**
   * 创建成功结果
   * @param data 结果数据
   * @param message 结果消息
   * @param metadata 结果元数据
   * @returns 工具结果
   */
  protected createSuccessResult<T>(data: T, message?: string, metadata?: Record<string, any>): ToolResult<T> {
    return {
      data,
      success: true,
      message: message || `Tool ${this.name} executed successfully`,
      executionTime: Date.now(),
      metadata
    };
  }
  
  /**
   * 创建失败结果
   * @param message 错误消息
   * @param data 错误数据
   * @param metadata 结果元数据
   * @returns 工具结果
   */
  protected createErrorResult<T>(message: string, data?: T, metadata?: Record<string, any>): ToolResult<T> {
    return {
      data: data as T,
      success: false,
      message: message || `Tool ${this.name} execution failed`,
      executionTime: Date.now(),
      metadata
    };
  }
}