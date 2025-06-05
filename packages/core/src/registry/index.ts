import { Component } from '../interfaces/component';
import { NotFoundError } from '../errors';

/**
 * 注册表接口
 * 定义组件注册和查找的通用接口
 */
export interface Registry<T extends Component> {
  /**
   * 注册组件
   * @param component 要注册的组件
   */
  register(component: T): void;
  
  /**
   * 注销组件
   * @param id 组件ID
   * @returns 是否成功注销
   */
  unregister(id: string): boolean;
  
  /**
   * 获取组件
   * @param id 组件ID
   * @returns 组件实例，如果不存在则返回undefined
   */
  get(id: string): T | undefined;
  
  /**
   * 列出所有组件
   * @returns 组件数组
   */
  list(): T[];
  
  /**
   * 按条件筛选组件
   * @param predicate 筛选条件函数
   * @returns 符合条件的组件数组
   */
  filter(predicate: (component: T) => boolean): T[];
}

/**
 * 基础注册表实现
 * 提供组件注册和查找的基本功能
 */
export class BaseRegistry<T extends Component> implements Registry<T> {
  /**
   * 存储组件的Map
   */
  private components: Map<string, T> = new Map();
  
  /**
   * 注册表名称
   */
  private name: string;
  
  /**
   * 构造函数
   * @param name 注册表名称
   */
  constructor(name: string) {
    this.name = name;
  }
  
  /**
   * 注册组件
   * @param component 要注册的组件
   * @throws 如果组件ID已存在，则抛出错误
   */
  register(component: T): void {
    if (this.components.has(component.id)) {
      throw new Error(`Component with ID "${component.id}" already registered in ${this.name} registry.`);
    }
    this.components.set(component.id, component);
  }
  
  /**
   * 注销组件
   * @param id 组件ID
   * @returns 是否成功注销
   */
  unregister(id: string): boolean {
    return this.components.delete(id);
  }
  
  /**
   * 获取组件
   * @param id 组件ID
   * @returns 组件实例，如果不存在则返回undefined
   */
  get(id: string): T | undefined {
    return this.components.get(id);
  }
  
  /**
   * 获取组件，如果不存在则抛出错误
   * @param id 组件ID
   * @returns 组件实例
   * @throws 如果组件不存在，则抛出NotFoundError
   */
  getOrThrow(id: string): T {
    const component = this.get(id);
    if (!component) {
      throw new NotFoundError(
        `Component with ID "${id}" not found in ${this.name} registry.`,
        'component',
        id
      );
    }
    return component;
  }
  
  /**
   * 列出所有组件
   * @returns 组件数组
   */
  list(): T[] {
    return Array.from(this.components.values());
  }
  
  /**
   * 按条件筛选组件
   * @param predicate 筛选条件函数
   * @returns 符合条件的组件数组
   */
  filter(predicate: (component: T) => boolean): T[] {
    return this.list().filter(predicate);
  }
  
  /**
   * 清空注册表
   */
  clear(): void {
    this.components.clear();
  }
  
  /**
   * 获取注册表大小
   * @returns 组件数量
   */
  size(): number {
    return this.components.size;
  }
  
  /**
   * 检查组件是否已注册
   * @param id 组件ID
   * @returns 是否已注册
   */
  has(id: string): boolean {
    return this.components.has(id);
  }
}

/**
 * 服务定位器类
 * 提供全局服务注册和查找功能
 */
export class ServiceLocator {
  /**
   * 存储服务的静态Map
   */
  private static services: Map<string, any> = new Map();
  
  /**
   * 注册服务
   * @param id 服务ID
   * @param service 服务实例
   */
  static register<T>(id: string, service: T): void {
    ServiceLocator.services.set(id, service);
  }
  
  /**
   * 获取服务
   * @param id 服务ID
   * @returns 服务实例，如果不存在则返回undefined
   */
  static get<T>(id: string): T | undefined {
    return ServiceLocator.services.get(id) as T | undefined;
  }
  
  /**
   * 获取服务，如果不存在则抛出错误
   * @param id 服务ID
   * @returns 服务实例
   * @throws 如果服务不存在，则抛出NotFoundError
   */
  static getOrThrow<T>(id: string): T {
    const service = ServiceLocator.get<T>(id);
    if (service === undefined) {
      throw new NotFoundError(
        `Service with ID "${id}" not found in ServiceLocator.`,
        'service',
        id
      );
    }
    return service;
  }
  
  /**
   * 检查服务是否已注册
   * @param id 服务ID
   * @returns 是否已注册
   */
  static has(id: string): boolean {
    return ServiceLocator.services.has(id);
  }
  
  /**
   * 注销服务
   * @param id 服务ID
   * @returns 是否成功注销
   */
  static unregister(id: string): boolean {
    return ServiceLocator.services.delete(id);
  }
  
  /**
   * 清空所有服务
   */
  static clear(): void {
    ServiceLocator.services.clear();
  }
}