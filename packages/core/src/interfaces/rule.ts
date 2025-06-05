/**
 * 规则接口
 * 定义智能体和工具需要遵循的规则或指导方针
 */
export interface Rule {
  /**
   * 规则的唯一标识符
   */
  id: string;

  /**
   * 规则的人类可读名称
   */
  name: string;

  /**
   * 规则的详细描述
   */
  description: string;

  /**
   * 规则的具体定义或参数
   * 可以是字符串、正则表达式、配置对象等
   */
  definition: any;

  /**
   * 规则违反时的严重程度
   * - error: 错误，必须遵循
   * - warning: 警告，建议遵循
   * - info: 信息，可选遵循
   */
  severity?: 'error' | 'warning' | 'info';

  /**
   * 规则的适用范围
   * 可以是单个范围或多个范围的数组
   * 例如：'file', 'project', 'language:typescript'
   */
  scope?: string | string[];
}

/**
 * 规则集接口
 * 定义一组相关规则
 */
export interface RuleSet {
  /**
   * 规则集的唯一标识符
   */
  id: string;

  /**
   * 规则集的人类可读名称
   */
  name: string;

  /**
   * 规则集的描述
   */
  description?: string;

  /**
   * 规则集中包含的规则
   */
  rules: Rule[];
}

/**
 * 规则验证结果接口
 * 定义规则验证的结果
 */
export interface RuleValidationResult {
  /**
   * 规则的ID
   */
  ruleId: string;

  /**
   * 是否通过验证
   */
  passed: boolean;

  /**
   * 验证消息
   */
  message?: string;

  /**
   * 违反规则的位置信息
   */
  location?: {
    file?: string;
    line?: number;
    column?: number;
  };

  /**
   * 修复建议
   */
  fix?: {
    description: string;
    action?: string;
  };
}