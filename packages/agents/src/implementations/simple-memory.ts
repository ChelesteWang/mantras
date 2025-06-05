import { logger } from '@mantras-next/core';
import { Memory, MemoryConfig, MemoryItem } from '../interfaces/memory';

/**
 * 简单内存
 * 一个基本的内存实现，使用Map存储数据
 */
export class SimpleMemory implements Memory {
  /**
   * 内存ID
   */
  public readonly id: string;
  
  /**
   * 内存名称
   */
  public readonly name: string;
  
  /**
   * 内存描述
   */
  public readonly description: string;
  
  /**
   * 内存元数据
   */
  public readonly metadata: Record<string, any>;
  
  /**
   * 数据存储
   */
  private storage: Map<string, any> = new Map();
  
  /**
   * 上下文存储
   */
  private contexts: MemoryItem[] = [];
  
  /**
   * 最大容量
   */
  private maxSize: number;
  
  /**
   * 过期时间（毫秒）
   */
  private ttl?: number;
  
  /**
   * 构造函数
   * @param config 内存配置
   */
  constructor(config: MemoryConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description || '';
    this.metadata = config.metadata || {};
    this.maxSize = config.maxSize || 1000;
    this.ttl = config.ttl;
  }
  
  /**
   * 存储数据
   * @param key 键
   * @param value 值
   */
  async save(key: string, value: any): Promise<void> {
    // 检查容量
    if (this.storage.size >= this.maxSize) {
      // 如果达到最大容量，删除最早的项
      const oldestKey = this.storage.keys().next().value;
      if (oldestKey !== undefined) {
        this.storage.delete(oldestKey);
        logger.debug(`[${this.name}] Maximum capacity reached, deleted oldest item: ${oldestKey}`);
      }
    }
    
    // 存储数据
    this.storage.set(key, value);
    logger.debug(`[${this.name}] Saved data with key: ${key}`);
  }
  
  /**
   * 加载数据
   * @param key 键
   * @returns 值
   */
  async load(key: string): Promise<any> {
    // 检查是否存在
    if (!this.storage.has(key)) {
      logger.debug(`[${this.name}] Data not found for key: ${key}`);
      return undefined;
    }
    
    // 加载数据
    const value = this.storage.get(key);
    logger.debug(`[${this.name}] Loaded data for key: ${key}`);
    return value;
  }
  
  /**
   * 添加上下文
   * @param context 上下文数据
   */
  async addContext(context: any): Promise<void> {
    // 创建记忆项
    const item: MemoryItem = {
      id: `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      content: context,
      timestamp: Date.now(),
      tags: context.tags || []
    };
    
    // 检查容量
    if (this.contexts.length >= this.maxSize) {
      // 如果达到最大容量，删除最早的项
      this.contexts.shift();
      logger.debug(`[${this.name}] Maximum context capacity reached, deleted oldest context`);
    }
    
    // 添加上下文
    this.contexts.push(item);
    logger.debug(`[${this.name}] Added context: ${item.id}`);
  }
  
  /**
   * 获取相关上下文
   * @param query 查询
   * @param k 返回结果数量
   * @returns 相关上下文列表
   */
  async getRelevantContext(query: string, k: number = 5): Promise<any[]> {
    // 如果没有上下文，返回空数组
    if (this.contexts.length === 0) {
      return [];
    }
    
    // 简单实现：返回最近的k个上下文
    // 在实际应用中，应该使用向量相似度等方法查找相关上下文
    const sortedContexts = [...this.contexts]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, k);
    
    logger.debug(`[${this.name}] Retrieved ${sortedContexts.length} relevant contexts for query: ${query}`);
    
    // 返回上下文内容
    return sortedContexts.map(item => item.content);
  }
  
  /**
   * 清空记忆
   */
  async clear(): Promise<void> {
    // 清空存储
    this.storage.clear();
    this.contexts = [];
    logger.debug(`[${this.name}] Memory cleared`);
  }
  
  /**
   * 清理过期数据
   * 如果设置了TTL，则删除过期的数据
   */
  private cleanExpired(): void {
    if (!this.ttl) return;
    
    const now = Date.now();
    const expiryTime = now - this.ttl;
    
    // 清理上下文
    this.contexts = this.contexts.filter(item => item.timestamp >= expiryTime);
    
    // 由于Map没有时间戳，无法清理过期的存储数据
    // 在实际应用中，应该使用带有时间戳的存储结构
  }
}