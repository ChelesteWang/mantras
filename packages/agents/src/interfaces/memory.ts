import { Component } from '@mantras-next/core';

/**
 * 记忆接口
 * 定义记忆系统的基本结构和行为
 */
export interface Memory extends Component {
  /**
   * 存储数据
   * @param key 键
   * @param value 值
   */
  save(key: string, value: any): Promise<void>;
  
  /**
   * 加载数据
   * @param key 键
   * @returns 值
   */
  load(key: string): Promise<any>;
  
  /**
   * 添加上下文
   * @param context 上下文数据
   */
  addContext(context: any): Promise<void>;
  
  /**
   * 获取相关上下文
   * @param query 查询
   * @param k 返回结果数量
   * @returns 相关上下文列表
   */
  getRelevantContext(query: string, k?: number): Promise<any[]>;
  
  /**
   * 清空记忆
   */
  clear(): Promise<void>;
}

/**
 * 短期记忆接口
 * 定义会话内的短期记忆系统
 */
export interface ShortTermMemory extends Memory {
  /**
   * 开始会话
   * @returns 会话ID
   */
  startSession(): Promise<string>;
  
  /**
   * 结束会话
   * @param sessionId 会话ID
   */
  endSession(sessionId: string): Promise<void>;
}

/**
 * 长期记忆接口
 * 定义持久化的长期记忆系统
 */
export interface LongTermMemory extends Memory {
  /**
   * 向量存储
   */
  vectorStore?: any; // 后续会定义具体的向量存储接口
  
  /**
   * 搜索记忆
   * @param query 查询
   * @param k 返回结果数量
   * @returns 搜索结果
   */
  search(query: string, k?: number): Promise<any[]>;
  
  /**
   * 整合记忆
   * 将短期记忆整合到长期记忆中
   */
  consolidate(): Promise<void>;
}

/**
 * 记忆项接口
 * 定义记忆系统中存储的单个记忆项
 */
export interface MemoryItem {
  /**
   * 记忆ID
   */
  id: string;
  
  /**
   * 记忆内容
   */
  content: any;
  
  /**
   * 记忆时间
   */
  timestamp: number;
  
  /**
   * 记忆标签
   */
  tags?: string[];
  
  /**
   * 记忆元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 记忆配置接口
 * 定义记忆系统的配置选项
 */
export interface MemoryConfig {
  /**
   * 记忆ID
   */
  id: string;
  
  /**
   * 记忆名称
   */
  name: string;
  
  /**
   * 记忆描述
   */
  description?: string;
  
  /**
   * 记忆元数据
   */
  metadata?: Record<string, any>;
  
  /**
   * 最大容量
   */
  maxSize?: number;
  
  /**
   * 过期时间（毫秒）
   */
  ttl?: number;
}