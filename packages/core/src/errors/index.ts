/**
 * Mantras基础错误类
 * 所有框架特定错误的基类
 */
export class MantrasError extends Error {
  /**
   * 错误代码
   */
  code: string;
  
  /**
   * 错误详情
   */
  details?: any;
  
  /**
   * 构造函数
   * @param message 错误消息
   * @param code 错误代码
   * @param details 错误详情
   */
  constructor(message: string, code: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
    
    // 确保正确的原型链，使instanceof操作符正常工作
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * 工具执行错误
 * 当工具执行失败时抛出
 */
export class ToolExecutionError extends MantrasError {
  /**
   * 工具ID
   */
  toolId: string;
  
  /**
   * 构造函数
   * @param message 错误消息
   * @param toolId 工具ID
   * @param details 错误详情
   */
  constructor(message: string, toolId: string, details?: any) {
    super(message, 'TOOL_EXECUTION_ERROR', details);
    this.toolId = toolId;
  }
}

/**
 * 智能体执行错误
 * 当智能体执行失败时抛出
 */
export class AgentExecutionError extends MantrasError {
  /**
   * 智能体ID
   */
  agentId: string;
  
  /**
   * 构造函数
   * @param message 错误消息
   * @param agentId 智能体ID
   * @param details 错误详情
   */
  constructor(message: string, agentId: string, details?: any) {
    super(message, 'AGENT_EXECUTION_ERROR', details);
    this.agentId = agentId;
  }
}

/**
 * LLM错误
 * 当与LLM交互失败时抛出
 */
export class LLMError extends MantrasError {
  /**
   * 提供商名称
   */
  provider?: string;
  
  /**
   * 模型名称
   */
  model?: string;
  
  /**
   * 构造函数
   * @param message 错误消息
   * @param provider 提供商名称
   * @param model 模型名称
   * @param details 错误详情
   */
  constructor(message: string, provider?: string, model?: string, details?: any) {
    super(message, 'LLM_ERROR', details);
    this.provider = provider;
    this.model = model;
  }
}

/**
 * 验证错误
 * 当输入验证失败时抛出
 */
export class ValidationError extends MantrasError {
  /**
   * 构造函数
   * @param message 错误消息
   * @param details 错误详情
   */
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

/**
 * 配置错误
 * 当配置无效时抛出
 */
export class ConfigurationError extends MantrasError {
  /**
   * 构造函数
   * @param message 错误消息
   * @param details 错误详情
   */
  constructor(message: string, details?: any) {
    super(message, 'CONFIGURATION_ERROR', details);
  }
}

/**
 * 超时错误
 * 当操作超时时抛出
 */
export class TimeoutError extends MantrasError {
  /**
   * 超时时间（毫秒）
   */
  timeoutMs: number;
  
  /**
   * 构造函数
   * @param message 错误消息
   * @param timeoutMs 超时时间（毫秒）
   * @param details 错误详情
   */
  constructor(message: string, timeoutMs: number, details?: any) {
    super(message, 'TIMEOUT_ERROR', details);
    this.timeoutMs = timeoutMs;
  }
}

/**
 * 资源未找到错误
 * 当请求的资源不存在时抛出
 */
export class NotFoundError extends MantrasError {
  /**
   * 资源类型
   */
  resourceType: string;
  
  /**
   * 资源ID
   */
  resourceId: string;
  
  /**
   * 构造函数
   * @param message 错误消息
   * @param resourceType 资源类型
   * @param resourceId 资源ID
   * @param details 错误详情
   */
  constructor(message: string, resourceType: string, resourceId: string, details?: any) {
    super(message, 'NOT_FOUND_ERROR', details);
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * 权限错误
 * 当操作没有足够权限时抛出
 */
export class PermissionError extends MantrasError {
  /**
   * 所需权限
   */
  requiredPermission: string;
  
  /**
   * 构造函数
   * @param message 错误消息
   * @param requiredPermission 所需权限
   * @param details 错误详情
   */
  constructor(message: string, requiredPermission: string, details?: any) {
    super(message, 'PERMISSION_ERROR', details);
    this.requiredPermission = requiredPermission;
  }
}