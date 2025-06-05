import { logger } from '@mantras-next/core';
import { BaseAgent } from '../base/base-agent';
import { AgentInput, AgentStep, StopCriteria } from '../interfaces/agent';

/**
 * 简单智能体
 * 一个基本的智能体实现，按顺序执行指定的工具
 */
export class SimpleAgent extends BaseAgent {
  /**
   * 执行智能体
   * @param input 输入数据
   * @param runId 运行ID
   * @param maxIterations 最大迭代次数
   * @param stopCriteria 停止条件
   * @returns 执行结果
   */
  protected async execute(
    input: AgentInput,
    runId: string,
    maxIterations: number,
    stopCriteria?: StopCriteria
  ): Promise<{
    result: any;
    steps: AgentStep[];
    totalTokens?: number;
  }> {
    // 初始化结果
    const steps: AgentStep[] = [];
    let finalResult: any = null;
    let totalTokens = 0;
    
    // 解析任务
    const task = input.task;
    logger.info(`[${this.name}] Executing task: ${task}`);
    
    // 如果没有工具，直接返回
    if (this.tools.length === 0) {
      logger.warn(`[${this.name}] No tools available`);
      return {
        result: { message: 'No tools available to execute the task' },
        steps,
        totalTokens
      };
    }
    
    // 简单实现：尝试使用每个工具执行任务
    for (let i = 0; i < Math.min(this.tools.length, maxIterations); i++) {
      const tool = this.tools[i];
      
      // 创建步骤
      const step: AgentStep = {
        thought: `I'll try using the ${tool.name} tool to execute this task.`,
        action: {
          tool: tool.id,
          input: { task }
        },
        observation: null,
        timestamp: Date.now()
      };
      
      try {
        // 执行工具
        logger.debug(`[${this.name}] Executing tool: ${tool.name} (${tool.id})`);
        const toolResult = await this.executeTool(tool.id, { task }, {
          runId,
          metadata: {
            ideContext: input.ideContext,
            rules: input.rules
          }
        });
        
        // 记录观察结果
        step.observation = toolResult;
        
        // 更新最终结果
        finalResult = toolResult;
        
        // 检查是否应该停止
        if (this.shouldStop(toolResult, step, stopCriteria)) {
          logger.debug(`[${this.name}] Stopping execution after tool: ${tool.name}`);
          steps.push(step);
          break;
        }
      } catch (error) {
        // 记录错误
        step.observation = {
          error: error instanceof Error ? error.message : String(error)
        };
        
        logger.warn(`[${this.name}] Tool execution failed: ${tool.name}`, error);
      }
      
      // 添加步骤
      steps.push(step);
    }
    
    // 如果没有最终结果，返回一个默认结果
    if (finalResult === null) {
      finalResult = {
        message: 'Failed to execute the task with available tools'
      };
    }
    
    return {
      result: finalResult,
      steps,
      totalTokens
    };
  }
}