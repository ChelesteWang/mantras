import * as path from 'path';
import { logger } from '@mantras-next/core';
import { BaseIDETool } from './ide-tool';
import { FileTool, ToolContext } from '../interfaces/tool';

/**
 * 文件工具配置接口
 * 扩展IDE工具配置，添加文件特定选项
 */
export interface FileToolConfig {
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
   * 支持的文件类型列表
   */
  supportedFileTypes?: string[];
}

/**
 * 文件工具基类
 * 提供文件操作工具的基本实现
 */
export abstract class BaseFileTool<Input = any, Output = any> 
  extends BaseIDETool<Input, Output> 
  implements FileTool<Input, Output> {
  
  /**
   * 支持的文件类型列表
   */
  public readonly supportedFileTypes: string[];
  
  /**
   * 构造函数
   * @param config 文件工具配置
   */
  constructor(config: FileToolConfig) {
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
    
    this.supportedFileTypes = config.supportedFileTypes || [];
  }
  
  /**
   * 检查文件类型支持
   * @param filePath 文件路径
   * @returns 是否支持该文件类型
   */
  protected supportsFileType(filePath: string): boolean {
    // 如果未指定支持的文件类型，则默认支持所有文件类型
    if (this.supportedFileTypes.length === 0) {
      return true;
    }
    
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    return this.supportedFileTypes.includes(ext);
  }
  
  /**
   * 验证文件上下文
   * @param context 工具上下文
   * @throws 如果文件上下文无效或不支持当前文件类型
   */
  protected validateFileContext(context: ToolContext): void {
    // 首先验证IDE上下文
    this.validateIDEContext(context);
    
    const currentFilePath = this.getCurrentFilePath(context);
    if (!currentFilePath) {
      logger.warn(`[${this.name}] No current file path in context`);
      return;
    }
    
    // 验证当前文件类型是否为工具支持的类型
    if (!this.supportsFileType(currentFilePath)) {
      const ext = path.extname(currentFilePath).toLowerCase().replace('.', '');
      logger.warn(`[${this.name}] File type not supported: ${ext}`);
    }
  }
  
  /**
   * 获取文件扩展名
   * @param filePath 文件路径
   * @returns 文件扩展名（不带点）
   */
  protected getFileExtension(filePath: string): string {
    return path.extname(filePath).toLowerCase().replace('.', '');
  }
  
  /**
   * 获取文件名（带扩展名）
   * @param filePath 文件路径
   * @returns 文件名
   */
  protected getFileName(filePath: string): string {
    return path.basename(filePath);
  }
  
  /**
   * 获取文件名（不带扩展名）
   * @param filePath 文件路径
   * @returns 文件名
   */
  protected getFileBaseName(filePath: string): string {
    return path.basename(filePath, path.extname(filePath));
  }
  
  /**
   * 获取文件所在目录
   * @param filePath 文件路径
   * @returns 目录路径
   */
  protected getFileDirectory(filePath: string): string {
    return path.dirname(filePath);
  }
  
  /**
   * 构建文件的绝对路径
   * @param relativePath 相对路径
   * @param context 工具上下文
   * @returns 绝对路径或undefined
   */
  protected buildAbsolutePath(relativePath: string, context: ToolContext): string | undefined {
    const workspaceRoot = this.getWorkspaceRoot(context);
    if (!workspaceRoot) {
      logger.warn(`[${this.name}] No workspace root in context, cannot build absolute path`);
      return undefined;
    }
    
    return path.resolve(workspaceRoot, relativePath);
  }
  
  /**
   * 获取相对于工作区的路径
   * @param absolutePath 绝对路径
   * @param context 工具上下文
   * @returns 相对路径或undefined
   */
  protected getRelativePath(absolutePath: string, context: ToolContext): string | undefined {
    const workspaceRoot = this.getWorkspaceRoot(context);
    if (!workspaceRoot) {
      logger.warn(`[${this.name}] No workspace root in context, cannot get relative path`);
      return undefined;
    }
    
    return path.relative(workspaceRoot, absolutePath);
  }
}