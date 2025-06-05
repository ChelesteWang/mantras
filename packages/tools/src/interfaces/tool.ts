import { Callable, Component, IDEContext, Rule } from '@mantras-next/core';
import { z } from 'zod';

/**
 * 工具接口
 * 定义工具的基本结构和行为
 */
export interface Tool<Input = any, Output = any> extends Callable<Input, Output> {
  /**
   * 工具类别
   */
  category: string;
  
  /**
   * 工具所需权限
   */
  requiredPermissions?: string[];
  
  /**
   * 工具输入输出模式
   */
  schema: {
    /**
     * 输入模式
     */
    input: z.ZodType<Input>;
    
    /**
     * 输出模式
     */
    output: z.ZodType<Output>;
  };
}

/**
 * IDE工具接口
 * 定义IDE特定工具的结构和行为
 */
export interface IDETool<Input = any, Output = any> extends Tool<Input, Output> {
  /**
   * 支持的语言列表
   */
  supportedLanguages?: string[];
  
  /**
   * 支持的IDE列表
   */
  supportedIDEs?: string[];
  
  /**
   * 使用IDE上下文
   * @param context IDE上下文
   */
  useIDEContext(context: IDEContext): void;
}

/**
 * 代码工具接口
 * 定义代码相关工具的结构和行为
 */
export interface CodeTool<Input = any, Output = any> extends IDETool<Input, Output> {
  /**
   * 工具支持的语言
   */
  language: string;
  
  /**
   * 支持的框架列表
   */
  supportedFrameworks?: string[];
}

/**
 * 文件工具接口
 * 定义文件操作工具的结构和行为
 */
export interface FileTool<Input = any, Output = any> extends IDETool<Input, Output> {
  /**
   * 支持的文件类型列表
   */
  supportedFileTypes?: string[];
}

/**
 * 工具上下文接口
 * 定义工具执行的上下文信息
 */
export interface ToolContext {
  /**
   * IDE上下文
   */
  ideContext?: IDEContext;
  
  /**
   * 规则列表
   */
  rules?: Rule[];
  
  /**
   * 运行ID
   */
  runId?: string;
  
  /**
   * 元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 工具结果接口
 * 定义工具执行的结果
 */
export interface ToolResult<T = any> {
  /**
   * 结果数据
   */
  data: T;
  
  /**
   * 是否成功
   */
  success: boolean;
  
  /**
   * 结果消息
   */
  message?: string;
  
  /**
   * 执行时间（毫秒）
   */
  executionTime?: number;
  
  /**
   * 元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 工具配置接口
 * 定义工具的配置选项
 */
export interface ToolConfig {
  /**
   * 工具ID
   */
  id: string;
  
  /**
   * 工具名称
   */
  name: string;
  
  /**
   * 工具描述
   */
  description?: string;
  
  /**
   * 工具类别
   */
  category: string;
  
  /**
   * 工具所需权限
   */
  requiredPermissions?: string[];
  
  /**
   * 工具元数据
   */
  metadata?: Record<string, any>;
}