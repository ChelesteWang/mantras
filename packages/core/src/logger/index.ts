/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

/**
 * 日志记录器接口
 */
export interface Logger {
  /**
   * 记录调试级别的日志
   * @param message 日志消息
   * @param args 附加参数
   */
  debug(message: string, ...args: any[]): void;
  
  /**
   * 记录信息级别的日志
   * @param message 日志消息
   * @param args 附加参数
   */
  info(message: string, ...args: any[]): void;
  
  /**
   * 记录警告级别的日志
   * @param message 日志消息
   * @param args 附加参数
   */
  warn(message: string, ...args: any[]): void;
  
  /**
   * 记录错误级别的日志
   * @param message 日志消息
   * @param args 附加参数
   */
  error(message: string, ...args: any[]): void;
  
  /**
   * 设置日志级别
   * @param level 日志级别
   */
  setLevel(level: LogLevel): void;
}

/**
 * 日志记录器选项
 */
export interface LoggerOptions {
  /**
   * 日志级别
   * @default LogLevel.INFO
   */
  level?: LogLevel;
  
  /**
   * 日志前缀
   */
  prefix?: string;
  
  /**
   * 是否包含时间戳
   * @default true
   */
  timestamp?: boolean;
  
  /**
   * 自定义格式化函数
   */
  formatter?: (level: LogLevel, message: string, args: any[]) => string;
}

/**
 * 控制台日志记录器实现
 */
export class ConsoleLogger implements Logger {
  /**
   * 日志级别
   */
  private level: LogLevel;
  
  /**
   * 日志前缀
   */
  private prefix: string;
  
  /**
   * 是否包含时间戳
   */
  private timestamp: boolean;
  
  /**
   * 自定义格式化函数
   */
  private formatter?: (level: LogLevel, message: string, args: any[]) => string;
  
  /**
   * 构造函数
   * @param options 日志记录器选项
   */
  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.prefix = options.prefix ?? 'Mantras';
    this.timestamp = options.timestamp ?? true;
    this.formatter = options.formatter;
  }
  
  /**
   * 记录调试级别的日志
   * @param message 日志消息
   * @param args 附加参数
   */
  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.format(LogLevel.DEBUG, message), ...args);
    }
  }
  
  /**
   * 记录信息级别的日志
   * @param message 日志消息
   * @param args 附加参数
   */
  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(this.format(LogLevel.INFO, message), ...args);
    }
  }
  
  /**
   * 记录警告级别的日志
   * @param message 日志消息
   * @param args 附加参数
   */
  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.format(LogLevel.WARN, message), ...args);
    }
  }
  
  /**
   * 记录错误级别的日志
   * @param message 日志消息
   * @param args 附加参数
   */
  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.format(LogLevel.ERROR, message), ...args);
    }
  }
  
  /**
   * 设置日志级别
   * @param level 日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  /**
   * 格式化日志消息
   * @param level 日志级别
   * @param message 日志消息
   * @returns 格式化后的日志消息
   */
  private format(level: LogLevel, message: string): string {
    if (this.formatter) {
      return this.formatter(level, message, []);
    }
    
    const levelStr = LogLevel[level];
    const timestampStr = this.timestamp ? `[${new Date().toISOString()}] ` : '';
    return `${timestampStr}[${this.prefix}] [${levelStr}] ${message}`;
  }
}

/**
 * 默认日志记录器实例
 */
export const logger = new ConsoleLogger();