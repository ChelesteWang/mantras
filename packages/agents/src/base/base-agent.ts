import {
  CallOptions,
  AgentExecutionError,
  ValidationError,
  eventBus,
  EventType,
  logger
} from '@mantras-next/core';
import { Tool } from '@mantras-next/tools';
import {
  Agent,
  AgentConfig,
  AgentInput,
  AgentOutput,
  AgentStep,
  Memory,
  StopCriteria
} from '../interfaces';
import { z } from 'zod';

/**
 * 基础智能体抽象类
 * 提供智能体的基本实现
 */
export abstract class BaseAgent implements Agent {
  /**
   * 智能体ID
   */
  public readonly id: string;
  
  /**
   * 智能体名称
   */
  public readonly name: string;
  
  /**
   * 智能体描述
   */
  public readonly description: string;
  
  /**
   * 智能体元数据
   */
  public readonly metadata: Record<string, any>;
  
  /**
   * 工具列表
   */
  public tools: Tool[];
  
  /**
   * 记忆系统
   */
  public memory?: Memory;
  
  /**
   * 最大迭代次数
   */
  protected maxIterations: number;
  
  /**
   * 停止条件
   */
  protected stopCriteria?: StopCriteria;
  
  /**
   * 构造函数
   * @param config 智能体配置
   */
  constructor(config: AgentConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description || '';
    this.metadata = config.metadata || {};
    this.tools = config.tools || [];
    this.memory = config.memory;
    this.maxIterations = config.maxIterations || 10;
    this.stopCriteria = config.stopCriteria;
  }
  
  /**
   * 添加工具
   * @param tool 工具
   */
  addTool(tool: Tool): void {
    // 检查是否已存在相同ID的工具
    const existingTool = this.tools.find(t => t.id === tool.id);
    if (existingTool) {
      logger.warn(`[${this.name}] Tool with ID ${tool.id} already exists, replacing`);
      this.removeTool(tool.id);
    }
    
    this.tools.push(tool);
    logger.debug(`[${this.name}] Added tool: ${tool.name} (${tool.id})`);
  }
  
  /**
   * 移除工具
   * @param toolId 工具ID
   * @returns 是否成功移除
   */
  removeTool(toolId: string): boolean {
    const initialLength = this.tools.length;
    this.tools = this.tools.filter(tool => tool.id !== toolId);
    const removed = this.tools.length < initialLength;
    
    if (removed) {
      logger.debug(`[${this.name}] Removed tool: ${toolId}`);
    } else {
      logger.debug(`[${this.name}] Tool not found: ${toolId}`);
    }
    
    return removed;
  }
  
  /**
   * 设置记忆系统
   * @param memory 记忆系统
   */
  setMemory(memory: Memory): void {
    this.memory = memory;
    logger.debug(`[${this.name}] Set memory: ${memory.name} (${memory.id})`);
  }
  
  /**
   * 调用智能体
   * @param input 输入数据
   * @param options 调用选项
   * @returns 输出数据
   */
  async call(input: AgentInput, options?: CallOptions): Promise<AgentOutput> {
    const startTime = Date.now();
    const runId = options?.runId || `run-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    try {
      // 发出智能体开始事件
      await eventBus.emit(EventType.START, runId, {
        agentId: this.id,
        agentName: this.name,
        input
      });
      
      // 验证输入
      this.validateInput(input);
      
      // 设置最大迭代次数
      const maxIterations = input.maxIterations || this.maxIterations;
      
      // 设置停止条件
      const stopCriteria = input.stopCriteria || this.stopCriteria;
      
      // 执行智能体
      logger.debug(`[${this.name}] Executing with task: ${input.task}`);
      const result = await this.execute(input, runId, maxIterations, stopCriteria);
      
      // 计算执行指标
      const duration = Date.now() - startTime;
      const output: AgentOutput = {
        result: result.result,
        steps: result.steps,
        metrics: {
          totalTokens: result.totalTokens,
          duration,
          iterations: result.steps.length
        }
      };
      
      // 发出智能体结束事件
      await eventBus.emit(EventType.END, runId, {
        agentId: this.id,
        agentName: this.name,
        output
      });
      
      return output;
    } catch (error) {
      // 处理错误
      const agentError = this.handleError(error, runId);
      
      // 发出错误事件
      await eventBus.emit(EventType.ERROR, runId, {
        agentId: this.id,
        agentName: this.name,
        error: agentError
      });
      
      throw agentError;
    }
  }
  
  /**
   * 执行智能体
   * 子类必须实现此方法
   * @param input 输入数据
   * @param runId 运行ID
   * @param maxIterations 最大迭代次数
   * @param stopCriteria 停止条件
   * @returns 执行结果
   */
  protected abstract execute(
    input: AgentInput,
    runId: string,
    maxIterations: number,
    stopCriteria?: StopCriteria
  ): Promise<{
    result: any;
    steps: AgentStep[];
    totalTokens?: number;
  }>;
  
  /**
   * 验证输入
   * @param input 输入数据
   * @throws 如果输入无效
   */
  protected validateInput(input: AgentInput): void {
    // 基本验证：确保有任务描述
    if (!input.task || input.task.trim() === '') {
      throw new ValidationError('Task description is required', { input });
    }
    
    // 子类可以覆盖此方法以添加更多验证
  }
  
  /**
   * 处理错误
   * @param error 原始错误
   * @param runId 运行ID
   * @returns 处理后的错误
   */
  protected handleError(error: unknown, runId: string): Error {
    if (error instanceof Error) {
      logger.error(`[${this.name}] Error:`, error);
      
      if (error instanceof AgentExecutionError) {
        return error;
      }
      
      return new AgentExecutionError(
        `Error executing agent ${this.name}: ${error.message}`,
        this.id,
        { originalError: error, runId }
      );
    }
    
    const message = String(error);
    logger.error(`[${this.name}] Execution error:`, message);
    
    return new AgentExecutionError(
      `Error executing agent ${this.name}: ${message}`,
      this.id,
      { originalError: error, runId }
    );
  }
  
  /**
   * 获取工具
   * @param toolId 工具ID
   * @returns 工具实例或undefined
   */
  protected getTool(toolId: string): Tool | undefined {
    return this.tools.find(tool => tool.id === toolId);
  }
  
  /**
   * 执行工具
   * @param toolId 工具ID
   * @param input 工具输入
   * @param options 调用选项
   * @returns 工具输出
   * @throws 如果工具不存在或执行失败
   */
  protected async executeTool(toolId: string, input: any, options?: CallOptions): Promise<any> {
    const tool = this.getTool(toolId);
    if (!tool) {
      throw new Error(`Tool not found: ${toolId}`);
    }
    
    logger.debug(`[${this.name}] Executing tool: ${tool.name} (${tool.id})`);
    return await tool.call(input, options);
  }
  
  /**
   * 检查是否应该停止
   * @param output 当前输出
   * @param step 当前步骤
   * @param stopCriteria 停止条件
   * @returns 是否应该停止
   */
  protected shouldStop(output: any, step: AgentStep, stopCriteria?: StopCriteria): boolean {
    if (!stopCriteria) return false;
    
    // 检查停止词
    if (stopCriteria.stopWords && stopCriteria.stopWords.length > 0) {
      const outputStr = JSON.stringify(output).toLowerCase();
      for (const word of stopCriteria.stopWords) {
        if (outputStr.includes(word.toLowerCase())) {
          logger.debug(`[${this.name}] Stop word detected: ${word}`);
          return true;
        }
      }
    }
    
    // 检查停止条件函数
    if (stopCriteria.shouldStop && stopCriteria.shouldStop(output, step)) {
      logger.debug(`[${this.name}] Stop condition met`);
      return true;
    }
    
    return false;
  }
}