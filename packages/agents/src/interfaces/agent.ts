import {
  Callable,
  Component,
  IDEContext,
  Rule
} from '@mantras-next/core';
import { Tool } from '@mantras-next/tools';
import { Memory } from './memory';

/**
 * 智能体输入接口
 * 定义智能体执行的输入数据
 */
export interface AgentInput {
  /**
   * 任务描述
   */
  task: string;
  
  /**
   * IDE上下文
   */
  ideContext?: IDEContext;
  
  /**
   * 规则列表
   */
  rules?: Rule[];
  
  /**
   * 最大迭代次数
   */
  maxIterations?: number;
  
  /**
   * 停止条件
   */
  stopCriteria?: StopCriteria;
  
  /**
   * 额外参数
   */
  [key: string]: any;
}

/**
 * 智能体输出接口
 * 定义智能体执行的输出数据
 */
export interface AgentOutput {
  /**
   * 执行结果
   */
  result: any;
  
  /**
   * 执行步骤
   */
  steps: AgentStep[];
  
  /**
   * 执行指标
   */
  metrics: {
    /**
     * 总token数
     */
    totalTokens?: number;
    
    /**
     * 执行时长（毫秒）
     */
    duration: number;
    
    /**
     * 迭代次数
     */
    iterations: number;
  };
}

/**
 * 智能体步骤接口
 * 定义智能体执行的单个步骤
 */
export interface AgentStep {
  /**
   * 思考过程
   */
  thought?: string;
  
  /**
   * 执行的动作
   */
  action: {
    /**
     * 工具ID
     */
    tool: string;
    
    /**
     * 工具输入
     */
    input: any;
  };
  
  /**
   * 观察结果
   */
  observation: any;
  
  /**
   * 时间戳
   */
  timestamp: number;
}

/**
 * 停止条件接口
 * 定义智能体执行的停止条件
 */
export interface StopCriteria {
  /**
   * 停止词列表
   */
  stopWords?: string[];
  
  /**
   * 停止条件函数
   */
  shouldStop?: (output: any, step: AgentStep) => boolean;
}

/**
 * 智能体接口
 * 定义智能体的基本结构和行为
 */
export interface Agent extends Callable<AgentInput, AgentOutput> {
  /**
   * 工具列表
   */
  tools: Tool[];
  
  /**
   * 记忆系统
   */
  memory?: Memory;
  
  /**
   * 添加工具
   * @param tool 工具
   */
  addTool(tool: Tool): void;
  
  /**
   * 移除工具
   * @param toolId 工具ID
   * @returns 是否成功移除
   */
  removeTool(toolId: string): boolean;
  
  /**
   * 设置记忆系统
   * @param memory 记忆系统
   */
  setMemory(memory: Memory): void;
}

/**
 * 智能体配置接口
 * 定义智能体的配置选项
 */
export interface AgentConfig {
  /**
   * 智能体ID
   */
  id: string;
  
  /**
   * 智能体名称
   */
  name: string;
  
  /**
   * 智能体描述
   */
  description?: string;
  
  /**
   * 智能体元数据
   */
  metadata?: Record<string, any>;
  
  /**
   * 初始工具列表
   */
  tools?: Tool[];
  
  /**
   * 记忆系统
   */
  memory?: Memory;
  
  /**
   * 最大迭代次数
   */
  maxIterations?: number;
  
  /**
   * 停止条件
   */
  stopCriteria?: StopCriteria;
}