import { IDEContext, logger } from '@mantras-next/core';
import { BaseTool } from './base-tool';
import { IDETool, ToolConfig, ToolContext } from '../interfaces/tool';

/**
 * IDE工具配置接口
 * 扩展工具配置，添加IDE特定选项
 */
export interface IDEToolConfig extends ToolConfig {
  /**
   * 支持的语言列表
   */
  supportedLanguages?: string[];
  
  /**
   * 支持的IDE列表
   */
  supportedIDEs?: string[];
}

/**
 * IDE工具基类
 * 提供IDE特定工具的基本实现
 */
export abstract class BaseIDETool<Input = any, Output = any> 
  extends BaseTool<Input, Output> 
  implements IDETool<Input, Output> {
  
  /**
   * 支持的语言列表
   */
  public readonly supportedLanguages: string[];
  
  /**
   * 支持的IDE列表
   */
  public readonly supportedIDEs: string[];
  
  /**
   * 当前IDE上下文
   */
  protected ideContext?: IDEContext;
  
  /**
   * 构造函数
   * @param config IDE工具配置
   */
  constructor(config: IDEToolConfig) {
    super(config);
    this.supportedLanguages = config.supportedLanguages || [];
    this.supportedIDEs = config.supportedIDEs || [];
  }
  
  /**
   * 使用IDE上下文
   * @param context IDE上下文
   */
  useIDEContext(context: IDEContext): void {
    this.ideContext = context;
    logger.debug(`[${this.name}] IDE context set:`, context);
  }
  
  /**
   * 检查语言支持
   * @param language 语言
   * @returns 是否支持该语言
   */
  protected supportsLanguage(language: string): boolean {
    // 如果未指定支持的语言，则默认支持所有语言
    if (this.supportedLanguages.length === 0) {
      return true;
    }
    return this.supportedLanguages.includes(language.toLowerCase());
  }
  
  /**
   * 检查IDE支持
   * @param ide IDE标识符
   * @returns 是否支持该IDE
   */
  protected supportsIDE(ide: string): boolean {
    // 如果未指定支持的IDE，则默认支持所有IDE
    if (this.supportedIDEs.length === 0) {
      return true;
    }
    return this.supportedIDEs.includes(ide.toLowerCase());
  }
  
  /**
   * 获取当前文件语言
   * @param context 工具上下文
   * @returns 当前文件语言或undefined
   */
  protected getCurrentLanguage(context: ToolContext): string | undefined {
    const ideContext = context.ideContext || this.ideContext;
    return ideContext?.currentFile?.language;
  }
  
  /**
   * 验证IDE上下文
   * @param context 工具上下文
   * @throws 如果IDE上下文无效或不支持当前语言/IDE
   */
  protected validateIDEContext(context: ToolContext): void {
    const ideContext = context.ideContext || this.ideContext;
    
    if (!ideContext) {
      logger.warn(`[${this.name}] No IDE context provided`);
      return;
    }
    
    const currentLanguage = this.getCurrentLanguage(context);
    if (currentLanguage && !this.supportsLanguage(currentLanguage)) {
      logger.warn(`[${this.name}] Language not supported: ${currentLanguage}`);
    }
    
    // 可以添加更多的IDE上下文验证逻辑
  }
  
  /**
   * 获取工作区根路径
   * @param context 工具上下文
   * @returns 工作区根路径或undefined
   */
  protected getWorkspaceRoot(context: ToolContext): string | undefined {
    const ideContext = context.ideContext || this.ideContext;
    return ideContext?.workspace?.rootPath || ideContext?.project?.rootPath;
  }
  
  /**
   * 获取当前文件路径
   * @param context 工具上下文
   * @returns 当前文件路径或undefined
   */
  protected getCurrentFilePath(context: ToolContext): string | undefined {
    const ideContext = context.ideContext || this.ideContext;
    return ideContext?.currentFile?.path;
  }
  
  /**
   * 获取当前文件内容
   * @param context 工具上下文
   * @returns 当前文件内容或undefined
   */
  protected getCurrentFileContent(context: ToolContext): string | undefined {
    const ideContext = context.ideContext || this.ideContext;
    return ideContext?.currentFile?.content;
  }
  
  /**
   * 获取选中的文本
   * @param context 工具上下文
   * @returns 选中的文本或undefined
   */
  protected getSelectedText(context: ToolContext): string | undefined {
    const ideContext = context.ideContext || this.ideContext;
    return ideContext?.selection?.text;
  }
}