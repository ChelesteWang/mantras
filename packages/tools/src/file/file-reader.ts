import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { BaseFileTool } from '../base/file-tool';
import { ToolCategories, ToolPermissions } from '../index';
import { ToolContext } from '../interfaces/tool';

/**
 * 文件读取工具输入接口
 */
export interface FileReaderInput {
  /**
   * 文件路径，可以是相对于工作区的路径或绝对路径
   * 如果不提供，则使用当前活动文件
   */
  filePath?: string;
  
  /**
   * 读取选项
   */
  options?: {
    /**
     * 编码，默认为 'utf8'
     */
    encoding?: string;
    
    /**
     * 起始行号，从1开始
     */
    startLine?: number;
    
    /**
     * 结束行号，从1开始
     */
    endLine?: number;
    
    /**
     * 是否包含行号
     */
    includeLineNumbers?: boolean;
  };
}

/**
 * 文件读取工具输出接口
 */
export interface FileReaderOutput {
  /**
   * 文件内容
   */
  content: string;
  
  /**
   * 文件信息
   */
  info: {
    /**
     * 文件路径
     */
    filePath: string;
    
    /**
     * 文件大小（字节）
     */
    size: number;
    
    /**
     * 文件修改时间
     */
    modifiedTime: Date;
    
    /**
     * 文件类型
     */
    fileType: string;
    
    /**
     * 行数
     */
    lineCount: number;
    
    /**
     * 读取的行范围
     */
    readRange?: {
      startLine: number;
      endLine: number;
    };
  };
}

/**
 * 文件读取工具
 * 读取文件内容的工具实现
 */
export class FileReaderTool extends BaseFileTool<FileReaderInput, FileReaderOutput> {
  /**
   * 工具模式定义
   */
  public readonly schema = {
    input: z.object({
      filePath: z.string().optional(),
      options: z.object({
        encoding: z.string().optional(),
        startLine: z.number().min(1).optional(),
        endLine: z.number().min(1).optional(),
        includeLineNumbers: z.boolean().optional()
      }).optional()
    }),
    output: z.object({
      content: z.string(),
      info: z.object({
        filePath: z.string(),
        size: z.number(),
        modifiedTime: z.date(),
        fileType: z.string(),
        lineCount: z.number(),
        readRange: z.object({
          startLine: z.number(),
          endLine: z.number()
        }).optional()
      })
    })
  };
  
  /**
   * 构造函数
   */
  constructor() {
    super({
      id: 'file-reader',
      name: '文件读取工具',
      description: '读取文件内容，支持部分读取和行号显示',
      category: ToolCategories.FILE,
      requiredPermissions: [ToolPermissions.READ_FILE],
      supportedFileTypes: ['txt', 'md', 'js', 'ts', 'json', 'html', 'css', 'scss', 'less', 'xml', 'yaml', 'yml']
    });
  }
  
  /**
   * 执行文件读取
   * @param input 输入数据
   * @param context 工具上下文
   * @returns 文件内容和信息
   */
  protected async execute(input: FileReaderInput, context: ToolContext): Promise<FileReaderOutput> {
    // 验证文件上下文
    this.validateFileContext(context);
    
    // 获取文件路径
    let filePath = input.filePath;
    if (!filePath) {
      // 如果未提供文件路径，则使用当前活动文件
      filePath = this.getCurrentFilePath(context);
      if (!filePath) {
        throw new Error('未提供文件路径，且无法获取当前活动文件路径');
      }
    }
    
    // 如果是相对路径，则转换为绝对路径
    if (!path.isAbsolute(filePath)) {
      const absolutePath = this.buildAbsolutePath(filePath, context);
      if (!absolutePath) {
        throw new Error(`无法构建绝对路径: ${filePath}`);
      }
      filePath = absolutePath;
    }
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }
    
    // 获取文件信息
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      throw new Error(`不是文件: ${filePath}`);
    }
    
    // 获取读取选项
    const options = input.options || {};
    const encoding = options.encoding || 'utf8';
    const includeLineNumbers = options.includeLineNumbers || false;
    
    // 读取文件内容
    const content = fs.readFileSync(filePath, encoding as BufferEncoding);
    
    // 计算行数
    const lines = content.split(/\r?\n/);
    const lineCount = lines.length;
    
    // 处理行范围
    let startLine = options.startLine || 1;
    let endLine = options.endLine || lineCount;
    
    // 确保行号在有效范围内
    startLine = Math.max(1, Math.min(startLine, lineCount));
    endLine = Math.max(startLine, Math.min(endLine, lineCount));
    
    // 提取指定范围的行
    const selectedLines = lines.slice(startLine - 1, endLine);
    
    // 处理行号显示
    let resultContent: string;
    if (includeLineNumbers) {
      resultContent = selectedLines
        .map((line, index) => `${startLine + index}:${line}`)
        .join('\n');
    } else {
      resultContent = selectedLines.join('\n');
    }
    
    // 获取文件类型
    const fileType = this.getFileExtension(filePath);
    
    // 返回结果
    return {
      content: resultContent,
      info: {
        filePath,
        size: stats.size,
        modifiedTime: stats.mtime,
        fileType,
        lineCount,
        readRange: {
          startLine,
          endLine
        }
      }
    };
  }
}