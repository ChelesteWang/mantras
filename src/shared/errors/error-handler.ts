/**
 * 统一错误处理系统
 */

export enum ErrorCode {
  // 验证错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SCHEMA_VALIDATION_ERROR = 'SCHEMA_VALIDATION_ERROR',

  // 业务逻辑错误
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  // 基础设施错误
  INFRASTRUCTURE_ERROR = 'INFRASTRUCTURE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // 系统错误
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // 工具相关错误
  TOOL_NOT_FOUND = 'TOOL_NOT_FOUND',
  TOOL_EXECUTION_ERROR = 'TOOL_EXECUTION_ERROR',
  PERSONA_NOT_FOUND = 'PERSONA_NOT_FOUND',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
}

export interface ErrorContext {
  operation: string;
  component: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
  suggestions?: string[];
}

/**
 * 基础错误类
 */
export abstract class BaseError extends Error {
  abstract readonly code: ErrorCode;
  abstract readonly statusCode: number;

  public readonly timestamp: string;
  public readonly context?: ErrorContext;

  constructor(message: string, context?: ErrorContext) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    this.context = context;

    // 确保堆栈跟踪正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toResponse(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      requestId: this.context?.requestId,
      suggestions: this.getSuggestions(),
    };
  }

  protected getSuggestions(): string[] {
    return [];
  }
}

/**
 * 验证错误
 */
export class ValidationError extends BaseError {
  readonly code = ErrorCode.VALIDATION_ERROR;
  readonly statusCode = 400;

  constructor(
    message: string,
    public readonly field?: string,
    context?: ErrorContext
  ) {
    super(message, context);
  }

  protected getSuggestions(): string[] {
    return [
      '请检查输入参数的格式和类型',
      '确保所有必需字段都已提供',
      '参考 API 文档了解正确的参数格式',
    ];
  }
}

/**
 * 业务逻辑错误
 */
export class BusinessLogicError extends BaseError {
  readonly code = ErrorCode.BUSINESS_LOGIC_ERROR;
  readonly statusCode = 422;

  protected getSuggestions(): string[] {
    return ['请检查业务规则和约束条件', '确保操作符合当前业务状态', '联系管理员了解业务规则详情'];
  }
}

/**
 * 资源未找到错误
 */
export class ResourceNotFoundError extends BaseError {
  readonly code = ErrorCode.RESOURCE_NOT_FOUND;
  readonly statusCode = 404;

  constructor(resourceType: string, resourceId: string, context?: ErrorContext) {
    super(`${resourceType} with ID '${resourceId}' not found`, context);
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  public readonly resourceType: string;
  public readonly resourceId: string;

  protected getSuggestions(): string[] {
    return [
      `确认 ${this.resourceType} ID '${this.resourceId}' 是否正确`,
      `检查 ${this.resourceType} 是否已被删除`,
      '使用列表 API 查看可用的资源',
    ];
  }
}

/**
 * 基础设施错误
 */
export class InfrastructureError extends BaseError {
  readonly code = ErrorCode.INFRASTRUCTURE_ERROR;
  readonly statusCode = 500;

  protected getSuggestions(): string[] {
    return ['请稍后重试', '如果问题持续存在，请联系技术支持', '检查系统状态页面了解服务状态'];
  }
}

/**
 * 速率限制错误
 */
export class RateLimitError extends BaseError {
  readonly code = ErrorCode.RATE_LIMIT_EXCEEDED;
  readonly statusCode = 429;

  constructor(
    message: string,
    public readonly retryAfter?: number,
    context?: ErrorContext
  ) {
    super(message, context);
  }

  protected getSuggestions(): string[] {
    const suggestions = ['请降低请求频率', '考虑实现请求缓存以减少 API 调用'];

    if (this.retryAfter) {
      suggestions.unshift(`请在 ${this.retryAfter} 秒后重试`);
    }

    return suggestions;
  }
}

/**
 * 工具执行错误
 */
export class ToolExecutionError extends BaseError {
  readonly code = ErrorCode.TOOL_EXECUTION_ERROR;
  readonly statusCode = 500;

  constructor(toolName: string, originalError: Error, context?: ErrorContext) {
    super(`Tool '${toolName}' execution failed: ${originalError.message}`, context);
    this.toolName = toolName;
    this.originalError = originalError;
  }

  public readonly toolName: string;
  public readonly originalError: Error;

  protected getSuggestions(): string[] {
    return [
      `检查工具 '${this.toolName}' 的输入参数`,
      '确认工具所需的依赖服务正常运行',
      '查看工具文档了解使用要求',
    ];
  }
}

/**
 * 全局错误处理器
 */
export class GlobalErrorHandler {
  private static errorListeners: ErrorListener[] = [];
  private static errorCounts = new Map<ErrorCode, number>();

  /**
   * 处理错误并返回标准化响应
   */
  static handle(error: Error, context?: ErrorContext): ErrorResponse {
    let processedError: BaseError;

    // 转换为标准错误类型
    if (error instanceof BaseError) {
      processedError = error;
    } else {
      processedError = this.convertToBaseError(error, context);
    }

    // 记录错误
    this.logError(processedError, context);

    // 更新错误统计
    this.updateErrorStats(processedError.code);

    // 通知监听器
    this.notifyListeners(processedError, context);

    return processedError.toResponse();
  }

  /**
   * 记录错误日志
   */
  static logError(error: BaseError, context?: ErrorContext): void {
    const logData = {
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
      },
      context,
      timestamp: error.timestamp,
    };

    // 根据错误严重程度选择日志级别
    if (error.statusCode >= 500) {
      console.error('Critical Error:', logData);
    } else if (error.statusCode >= 400) {
      console.warn('Client Error:', logData);
    } else {
      console.info('Error Info:', logData);
    }
  }

  /**
   * 添加错误监听器
   */
  static addErrorListener(listener: ErrorListener): void {
    this.errorListeners.push(listener);
  }

  /**
   * 移除错误监听器
   */
  static removeErrorListener(listener: ErrorListener): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * 获取错误统计信息
   */
  static getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  /**
   * 清除错误统计
   */
  static clearErrorStats(): void {
    this.errorCounts.clear();
  }

  /**
   * 转换普通错误为基础错误类型
   */
  private static convertToBaseError(error: Error, context?: ErrorContext): BaseError {
    // 根据错误类型和消息进行智能转换
    if (error.name === 'ValidationError' || error.message.includes('validation')) {
      return new ValidationError(error.message, undefined, context);
    }

    if (error.message.includes('not found')) {
      return new ResourceNotFoundError('Resource', 'unknown', context);
    }

    if (error.message.includes('rate limit')) {
      return new RateLimitError(error.message, undefined, context);
    }

    // 默认转换为基础设施错误
    return new InfrastructureError(error.message, context);
  }

  /**
   * 更新错误统计
   */
  private static updateErrorStats(code: ErrorCode): void {
    const current = this.errorCounts.get(code) || 0;
    this.errorCounts.set(code, current + 1);
  }

  /**
   * 通知错误监听器
   */
  private static notifyListeners(error: BaseError, context?: ErrorContext): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error, context);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }
}

/**
 * 错误监听器类型
 */
export type ErrorListener = (error: BaseError, context?: ErrorContext) => void;

/**
 * 错误处理中间件
 */
export function errorHandlerMiddleware() {
  return async (error: Error, context?: ErrorContext) => {
    return GlobalErrorHandler.handle(error, context);
  };
}

/**
 * 创建错误上下文的辅助函数
 */
export function createErrorContext(
  operation: string,
  component: string,
  options: Partial<ErrorContext> = {}
): ErrorContext {
  return {
    operation,
    component,
    ...options,
  };
}

/**
 * 错误装饰器 - 自动处理方法中的错误
 */
export function HandleErrors(component: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const context = createErrorContext(propertyKey, component);
        throw GlobalErrorHandler.handle(
          error instanceof Error ? error : new Error(String(error)),
          context
        );
      }
    };

    return descriptor;
  };
}
