import { logger } from '@mantras-next/core';
import { BaseIDETool } from './ide-tool';
import { CodeTool, ToolContext } from '../interfaces/tool';

/**
 * 代码工具配置接口
 * 扩展IDE工具配置，添加代码特定选项
 */
export interface CodeToolConfig {
  /**
   * 工具ID
   */
  id: string;
  
  /**
   * 工具名称
   */
  name: string;
  
  /**
   * 工具描述
   */
  description?: string;
  
  /**
   * 工具类别
   */
  category: string;
  
  /**
   * 工具所需权限
   */
  requiredPermissions?: string[];
  
  /**
   * 工具元数据
   */
  metadata?: Record<string, any>;
  
  /**
   * 支持的语言列表
   */
  supportedLanguages?: string[];
  
  /**
   * 支持的IDE列表
   */
  supportedIDEs?: string[];
  
  /**
   * 工具支持的语言
   */
  language: string;
  
  /**
   * 支持的框架列表
   */
  supportedFrameworks?: string[];
}

/**
 * 代码工具基类
 * 提供代码相关工具的基本实现
 */
export abstract class BaseCodeTool<Input = any, Output = any> 
  extends BaseIDETool<Input, Output> 
  implements CodeTool<Input, Output> {
  
  /**
   * 工具支持的语言
   */
  public readonly language: string;
  
  /**
   * 支持的框架列表
   */
  public readonly supportedFrameworks: string[];
  
  /**
   * 构造函数
   * @param config 代码工具配置
   */
  constructor(config: CodeToolConfig) {
    super({
      id: config.id,
      name: config.name,
      description: config.description,
      category: config.category,
      requiredPermissions: config.requiredPermissions,
      metadata: config.metadata,
      supportedLanguages: config.supportedLanguages,
      supportedIDEs: config.supportedIDEs
    });
    
    this.language = config.language;
    this.supportedFrameworks = config.supportedFrameworks || [];
    
    // 确保supportedLanguages包含language
    if (!this.supportedLanguages.includes(this.language)) {
      this.supportedLanguages.push(this.language);
    }
  }
  
  /**
   * 检查框架支持
   * @param framework 框架名称
   * @returns 是否支持该框架
   */
  protected supportsFramework(framework: string): boolean {
    // 如果未指定支持的框架，则默认支持所有框架
    if (this.supportedFrameworks.length === 0) {
      return true;
    }
    return this.supportedFrameworks.includes(framework.toLowerCase());
  }
  
  /**
   * 验证代码上下文
   * @param context 工具上下文
   * @throws 如果代码上下文无效或不支持当前语言/框架
   */
  protected validateCodeContext(context: ToolContext): void {
    // 首先验证IDE上下文
    this.validateIDEContext(context);
    
    const ideContext = context.ideContext || this.ideContext;
    if (!ideContext) return;
    
    // 验证当前语言是否为工具支持的语言
    const currentLanguage = this.getCurrentLanguage(context);
    if (currentLanguage && currentLanguage !== this.language && !this.supportsLanguage(currentLanguage)) {
      logger.warn(`[${this.name}] Current language ${currentLanguage} is not supported by this tool (supports ${this.language})`);
    }
    
    // 验证当前框架是否为工具支持的框架
    const currentFramework = ideContext.project?.framework;
    if (currentFramework && !this.supportsFramework(currentFramework)) {
      logger.warn(`[${this.name}] Framework not supported: ${currentFramework}`);
    }
  }
  
  /**
   * 获取代码片段
   * 优先获取选中的文本，如果没有选中文本则获取当前文件内容
   * @param context 工具上下文
   * @returns 代码片段或undefined
   */
  protected getCodeSnippet(context: ToolContext): string | undefined {
    const selectedText = this.getSelectedText(context);
    if (selectedText) {
      return selectedText;
    }
    return this.getCurrentFileContent(context);
  }
}