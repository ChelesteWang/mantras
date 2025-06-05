/**
 * 基础组件接口
 * 所有Mantras-Next组件的基础接口，提供基本的标识和元数据属性
 */
export interface Component {
  /**
   * 组件的唯一标识符
   */
  id: string;

  /**
   * 组件的人类可读名称
   */
  name: string;

  /**
   * 组件的描述信息
   */
  description?: string;

  /**
   * 组件的元数据，可以包含任意附加信息
   */
  metadata?: Record<string, any>;
}

/**
 * 调用选项接口
 * 定义组件调用时的配置选项
 */
export interface CallOptions {
  /**
   * 回调函数集合
   */
  callbacks?: Callbacks;

  /**
   * 运行ID，用于追踪调用
   */
  runId?: string;

  /**
   * 调用相关的元数据
   */
  metadata?: Record<string, any>;

  /**
   * 标签，用于分类和过滤
   */
  tags?: string[];
}

/**
 * 回调函数接口
 * 定义组件执行生命周期的回调函数
 */
export interface Callbacks {
  /**
   * 组件开始执行时的回调
   * @param runId 运行ID
   * @param input 输入数据
   */
  onStart?: (runId: string, input: any) => void | Promise<void>;

  /**
   * 组件执行结束时的回调
   * @param runId 运行ID
   * @param output 输出数据
   */
  onEnd?: (runId: string, output: any) => void | Promise<void>;

  /**
   * 组件执行出错时的回调
   * @param runId 运行ID
   * @param error 错误对象
   */
  onError?: (runId: string, error: Error) => void | Promise<void>;
}