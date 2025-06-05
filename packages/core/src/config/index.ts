import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationError } from '../errors';

/**
 * 配置管理器接口
 * 定义配置的获取和设置方法
 */
export interface ConfigManager {
  /**
   * 获取配置值
   * @param key 配置键
   * @param defaultValue 默认值
   * @returns 配置值或默认值
   */
  get<T>(key: string, defaultValue?: T): T;
  
  /**
   * 设置配置值
   * @param key 配置键
   * @param value 配置值
   */
  set<T>(key: string, value: T): void;
  
  /**
   * 从文件加载配置
   * @param filePath 文件路径
   */
  loadFromFile(filePath: string): Promise<void>;
  
  /**
   * 从环境变量加载配置
   * @param prefix 环境变量前缀
   */
  loadFromEnv(prefix?: string): void;
  
  /**
   * 导出配置
   * @returns 配置对象
   */
  export(): Record<string, any>;
}

/**
 * 基础配置管理器实现
 */
export class BaseConfigManager implements ConfigManager {
  /**
   * 配置存储
   */
  private config: Record<string, any> = {};
  
  /**
   * 构造函数
   * @param initialConfig 初始配置
   */
  constructor(initialConfig: Record<string, any> = {}) {
    this.config = { ...initialConfig };
  }
  
  /**
   * 获取配置值
   * @param key 配置键，支持点符号路径，如 'app.server.port'
   * @param defaultValue 默认值
   * @returns 配置值或默认值
   */
  get<T>(key: string, defaultValue?: T): T {
    const value = this.getNestedValue(this.config, key);
    return value !== undefined ? value : (defaultValue as T);
  }
  
  /**
   * 设置配置值
   * @param key 配置键，支持点符号路径，如 'app.server.port'
   * @param value 配置值
   */
  set<T>(key: string, value: T): void {
    this.setNestedValue(this.config, key, value);
  }
  
  /**
   * 从文件加载配置
   * @param filePath 文件路径
   */
  async loadFromFile(filePath: string): Promise<void> {
    try {
      const ext = path.extname(filePath).toLowerCase();
      let config: Record<string, any> = {};
      
      if (ext === '.json') {
        const content = await fs.promises.readFile(filePath, 'utf8');
        config = JSON.parse(content);
      } else if (ext === '.js' || ext === '.cjs') {
        // 使用require加载JS配置文件
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const module = require(path.resolve(filePath));
        config = module.default || module;
      } else {
        throw new ConfigurationError(`Unsupported file extension: ${ext}`);
      }
      
      // 合并配置
      this.merge(config);
    } catch (error) {
      if (error instanceof Error) {
        throw new ConfigurationError(`Failed to load config from file: ${filePath}`, { cause: error });
      }
      throw error;
    }
  }
  
  /**
   * 从环境变量加载配置
   * @param prefix 环境变量前缀，默认为 'MANTRAS_'
   */
  loadFromEnv(prefix: string = 'MANTRAS_'): void {
    // 遍历所有环境变量
    for (const [key, value] of Object.entries(process.env)) {
      // 检查是否有指定前缀
      if (key.startsWith(prefix) && value !== undefined) {
        // 移除前缀并转换为小写
        const configKey = key.substring(prefix.length).toLowerCase().replace(/_/g, '.');
        
        // 尝试解析值（布尔值、数字等）
        let parsedValue: any = value;
        if (value.toLowerCase() === 'true') {
          parsedValue = true;
        } else if (value.toLowerCase() === 'false') {
          parsedValue = false;
        } else if (!isNaN(Number(value)) && value.trim() !== '') {
          parsedValue = Number(value);
        }
        
        // 设置配置值
        this.set(configKey, parsedValue);
      }
    }
  }
  
  /**
   * 导出配置
   * @returns 配置对象的深拷贝
   */
  export(): Record<string, any> {
    return JSON.parse(JSON.stringify(this.config));
  }
  
  /**
   * 合并配置
   * @param source 要合并的配置对象
   */
  merge(source: Record<string, any>): void {
    this.config = this.deepMerge(this.config, source);
  }
  
  /**
   * 深度合并对象
   * @param target 目标对象
   * @param source 源对象
   * @returns 合并后的对象
   */
  private deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const output = { ...target };
    
    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) continue;
      
      if (isObject(value) && isObject(output[key])) {
        output[key] = this.deepMerge(output[key], value);
      } else {
        output[key] = value;
      }
    }
    
    return output;
  }
  
  /**
   * 获取嵌套值
   * @param obj 对象
   * @param path 路径，如 'app.server.port'
   * @returns 值或undefined
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === undefined || current === null) return undefined;
      current = current[key];
    }
    
    return current;
  }
  
  /**
   * 设置嵌套值
   * @param obj 对象
   * @param path 路径，如 'app.server.port'
   * @param value 值
   */
  private setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current = obj;
    
    for (const key of keys) {
      if (!(key in current) || !isObject(current[key])) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  }
}

/**
 * 检查值是否为对象
 * @param value 要检查的值
 * @returns 是否为对象
 */
function isObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 默认配置管理器实例
 */
export const config = new BaseConfigManager();