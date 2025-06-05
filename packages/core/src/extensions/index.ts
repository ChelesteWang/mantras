import { Component } from '../interfaces/component';
import { BaseRegistry } from '../registry';

/**
 * 扩展点接口
 * 定义扩展点的基本操作
 */
export interface ExtensionPoint<T> {
  /**
   * 注册扩展
   * @param extension 扩展实现
   */
  register(extension: T): void;
  
  /**
   * 注销扩展
   * @param id 扩展ID
   * @returns 是否成功注销
   */
  unregister(id: string): boolean;
  
  /**
   * 获取所有扩展
   * @returns 扩展数组
   */
  getExtensions(): T[];
}

/**
 * 钩子函数类型
 * 接收上下文并返回修改后的上下文
 */
export type HookFunction<T> = (context: T) => Promise<T>;

/**
 * 钩子扩展接口
 * 为钩子函数提供ID和元数据
 */
export interface HookExtension<T> extends Component {
  /**
   * 钩子函数
   */
  hook: HookFunction<T>;
  
  /**
   * 优先级，数字越小优先级越高
   */
  priority?: number;
}

/**
 * 钩子扩展点接口
 * 定义钩子扩展点的操作
 */
export interface HookExtensionPoint<T> extends ExtensionPoint<HookExtension<T>> {
  /**
   * 执行所有钩子
   * @param context 上下文
   * @returns 处理后的上下文
   */
  execute(context: T): Promise<T>;
}

/**
 * 中间件类型
 * 接收输入和下一个处理函数，返回输出
 */
export type Middleware<Input, Output> = (
  input: Input,
  next: (input: Input) => Promise<Output>
) => Promise<Output>;

/**
 * 中间件扩展接口
 * 为中间件提供ID和元数据
 */
export interface MiddlewareExtension<Input, Output> extends Component {
  /**
   * 中间件函数
   */
  middleware: Middleware<Input, Output>;
  
  /**
   * 优先级，数字越小优先级越高
   */
  priority?: number;
}

/**
 * 中间件扩展点接口
 * 定义中间件扩展点的操作
 */
export interface MiddlewareExtensionPoint<Input, Output> extends ExtensionPoint<MiddlewareExtension<Input, Output>> {
  /**
   * 执行中间件链
   * @param input 输入
   * @param next 最终处理函数
   * @returns 处理后的输出
   */
  execute(input: Input, next: (input: Input) => Promise<Output>): Promise<Output>;
}

/**
 * 基础钩子扩展点实现
 */
export class BaseHookExtensionPoint<T> implements HookExtensionPoint<T> {
  /**
   * 扩展点名称
   */
  private name: string;
  
  /**
   * 扩展注册表
   */
  private registry: BaseRegistry<HookExtension<T>>;
  
  /**
   * 构造函数
   * @param name 扩展点名称
   */
  constructor(name: string) {
    this.name = name;
    this.registry = new BaseRegistry<HookExtension<T>>(name);
  }
  
  /**
   * 注册钩子扩展
   * @param extension 钩子扩展
   */
  register(extension: HookExtension<T>): void {
    this.registry.register(extension);
  }
  
  /**
   * 注销钩子扩展
   * @param id 扩展ID
   * @returns 是否成功注销
   */
  unregister(id: string): boolean {
    return this.registry.unregister(id);
  }
  
  /**
   * 获取所有钩子扩展
   * @returns 钩子扩展数组
   */
  getExtensions(): HookExtension<T>[] {
    return this.registry.list();
  }
  
  /**
   * 执行所有钩子
   * @param context 上下文
   * @returns 处理后的上下文
   */
  async execute(context: T): Promise<T> {
    // 获取所有扩展并按优先级排序
    const extensions = this.getExtensions().sort((a, b) => {
      const priorityA = a.priority ?? 100;
      const priorityB = b.priority ?? 100;
      return priorityA - priorityB;
    });
    
    // 顺序执行所有钩子
    let result = context;
    for (const extension of extensions) {
      result = await extension.hook(result);
    }
    
    return result;
  }
}

/**
 * 基础中间件扩展点实现
 */
export class BaseMiddlewareExtensionPoint<Input, Output> implements MiddlewareExtensionPoint<Input, Output> {
  /**
   * 扩展点名称
   */
  private name: string;
  
  /**
   * 扩展注册表
   */
  private registry: BaseRegistry<MiddlewareExtension<Input, Output>>;
  
  /**
   * 构造函数
   * @param name 扩展点名称
   */
  constructor(name: string) {
    this.name = name;
    this.registry = new BaseRegistry<MiddlewareExtension<Input, Output>>(name);
  }
  
  /**
   * 注册中间件扩展
   * @param extension 中间件扩展
   */
  register(extension: MiddlewareExtension<Input, Output>): void {
    this.registry.register(extension);
  }
  
  /**
   * 注销中间件扩展
   * @param id 扩展ID
   * @returns 是否成功注销
   */
  unregister(id: string): boolean {
    return this.registry.unregister(id);
  }
  
  /**
   * 获取所有中间件扩展
   * @returns 中间件扩展数组
   */
  getExtensions(): MiddlewareExtension<Input, Output>[] {
    return this.registry.list();
  }
  
  /**
   * 执行中间件链
   * @param input 输入
   * @param finalHandler 最终处理函数
   * @returns 处理后的输出
   */
  async execute(input: Input, finalHandler: (input: Input) => Promise<Output>): Promise<Output> {
    // 获取所有扩展并按优先级排序
    const extensions = this.getExtensions().sort((a, b) => {
      const priorityA = a.priority ?? 100;
      const priorityB = b.priority ?? 100;
      return priorityA - priorityB;
    });
    
    // 构建中间件链
    const chain = extensions.reduceRight(
      (next, extension) => {
        return (input: Input) => extension.middleware(input, next);
      },
      finalHandler
    );
    
    // 执行中间件链
    return chain(input);
  }
}

/**
 * 扩展点注册表
 * 管理所有扩展点
 */
export class ExtensionPointRegistry {
  /**
   * 存储扩展点的Map
   */
  private extensionPoints: Map<string, ExtensionPoint<any>> = new Map();
  
  /**
   * 注册扩展点
   * @param id 扩展点ID
   * @param extensionPoint 扩展点实例
   */
  register<T extends ExtensionPoint<any>>(id: string, extensionPoint: T): void {
    if (this.extensionPoints.has(id)) {
      throw new Error(`ExtensionPoint with ID "${id}" already registered.`);
    }
    this.extensionPoints.set(id, extensionPoint);
  }
  
  /**
   * 获取扩展点
   * @param id 扩展点ID
   * @returns 扩展点实例
   */
  get<T extends ExtensionPoint<any>>(id: string): T | undefined {
    return this.extensionPoints.get(id) as T | undefined;
  }
  
  /**
   * 获取扩展点，如果不存在则抛出错误
   * @param id 扩展点ID
   * @returns 扩展点实例
   * @throws 如果扩展点不存在
   */
  getOrThrow<T extends ExtensionPoint<any>>(id: string): T {
    const extensionPoint = this.get<T>(id);
    if (!extensionPoint) {
      throw new Error(`ExtensionPoint with ID "${id}" not found.`);
    }
    return extensionPoint;
  }
  
  /**
   * 注销扩展点
   * @param id 扩展点ID
   * @returns 是否成功注销
   */
  unregister(id: string): boolean {
    return this.extensionPoints.delete(id);
  }
  
  /**
   * 列出所有扩展点
   * @returns 扩展点ID数组
   */
  list(): string[] {
    return Array.from(this.extensionPoints.keys());
  }
}

/**
 * 默认扩展点注册表实例
 */
export const extensionPoints = new ExtensionPointRegistry();