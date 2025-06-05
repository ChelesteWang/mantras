import { z } from 'zod';
import { BaseCodeTool } from '../base/code-tool';
import { ToolCategories, ToolPermissions } from '../index';
import { ToolContext } from '../interfaces/tool';

/**
 * 代码格式化工具输入接口
 */
export interface CodeFormatterInput {
  /**
   * 要格式化的代码
   */
  code: string;
  
  /**
   * 格式化选项
   */
  options?: {
    /**
     * 缩进类型
     */
    indentType?: 'space' | 'tab';
    
    /**
     * 缩进大小
     */
    indentSize?: number;
    
    /**
     * 行结束符
     */
    lineEnding?: 'lf' | 'crlf';
    
    /**
     * 是否添加分号
     */
    semicolons?: boolean;
    
    /**
     * 是否添加尾随逗号
     */
    trailingComma?: boolean;
    
    /**
     * 是否使用单引号
     */
    singleQuote?: boolean;
  };
}

/**
 * 代码格式化工具输出接口
 */
export interface CodeFormatterOutput {
  /**
   * 格式化后的代码
   */
  formattedCode: string;
  
  /**
   * 格式化信息
   */
  info?: {
    /**
     * 原始代码长度
     */
    originalLength: number;
    
    /**
     * 格式化后代码长度
     */
    formattedLength: number;
    
    /**
     * 应用的格式化规则
     */
    appliedRules: string[];
  };
}

/**
 * 代码格式化工具
 * 格式化代码的工具实现
 */
export class CodeFormatterTool extends BaseCodeTool<CodeFormatterInput, CodeFormatterOutput> {
  /**
   * 工具模式定义
   */
  public readonly schema = {
    input: z.object({
      code: z.string().min(1, '代码不能为空'),
      options: z.object({
        indentType: z.enum(['space', 'tab']).optional(),
        indentSize: z.number().min(1).max(8).optional(),
        lineEnding: z.enum(['lf', 'crlf']).optional(),
        semicolons: z.boolean().optional(),
        trailingComma: z.boolean().optional(),
        singleQuote: z.boolean().optional()
      }).optional()
    }),
    output: z.object({
      formattedCode: z.string(),
      info: z.object({
        originalLength: z.number(),
        formattedLength: z.number(),
        appliedRules: z.array(z.string())
      }).optional()
    })
  };
  
  /**
   * 构造函数
   */
  constructor() {
    super({
      id: 'code-formatter',
      name: '代码格式化工具',
      description: '格式化代码，使其符合指定的风格规范',
      category: ToolCategories.CODE,
      requiredPermissions: [ToolPermissions.READ_FILE],
      language: 'typescript',
      supportedLanguages: ['typescript', 'javascript', 'json'],
      supportedFrameworks: []
    });
  }
  
  /**
   * 执行代码格式化
   * @param input 输入数据
   * @param context 工具上下文
   * @returns 格式化后的代码
   */
  protected async execute(input: CodeFormatterInput, context: ToolContext): Promise<CodeFormatterOutput> {
    // 验证代码上下文
    this.validateCodeContext(context);
    
    // 获取代码和选项
    const { code, options = {} } = input;
    const {
      indentType = 'space',
      indentSize = 2,
      lineEnding = 'lf',
      semicolons = true,
      trailingComma = true,
      singleQuote = true
    } = options;
    
    // 应用的规则列表
    const appliedRules: string[] = [];
    
    // 格式化代码
    let formattedCode = code.trim();
    
    // 简单的格式化规则实现
    
    // 1. 处理缩进
    if (indentType === 'space') {
      const indentStr = ' '.repeat(indentSize);
      formattedCode = this.formatIndentation(formattedCode, indentStr);
      appliedRules.push(`使用${indentSize}个空格缩进`);
    } else {
      formattedCode = this.formatIndentation(formattedCode, '\t');
      appliedRules.push('使用制表符缩进');
    }
    
    // 2. 处理行结束符
    if (lineEnding === 'lf') {
      formattedCode = formattedCode.replace(/\r\n/g, '\n');
      appliedRules.push('使用LF行结束符');
    } else {
      formattedCode = formattedCode.replace(/(?:\r\n|\r|\n)/g, '\r\n');
      appliedRules.push('使用CRLF行结束符');
    }
    
    // 3. 处理分号
    if (semicolons) {
      formattedCode = this.ensureSemicolons(formattedCode);
      appliedRules.push('添加分号');
    } else {
      formattedCode = this.removeSemicolons(formattedCode);
      appliedRules.push('移除分号');
    }
    
    // 4. 处理引号
    if (singleQuote) {
      formattedCode = this.convertToSingleQuotes(formattedCode);
      appliedRules.push('使用单引号');
    } else {
      formattedCode = this.convertToDoubleQuotes(formattedCode);
      appliedRules.push('使用双引号');
    }
    
    // 5. 处理尾随逗号
    if (trailingComma) {
      formattedCode = this.addTrailingCommas(formattedCode);
      appliedRules.push('添加尾随逗号');
    } else {
      formattedCode = this.removeTrailingCommas(formattedCode);
      appliedRules.push('移除尾随逗号');
    }
    
    // 添加格式化信息
    const info = {
      originalLength: code.length,
      formattedLength: formattedCode.length,
      appliedRules
    };
    
    // 返回结果
    return {
      formattedCode,
      info
    };
  }
  
  /**
   * 格式化代码缩进
   * @param code 代码
   * @param indentStr 缩进字符串
   * @returns 格式化后的代码
   */
  private formatIndentation(code: string, indentStr: string): string {
    const lines = code.split(/\r?\n/);
    const formattedLines = [];
    let indentLevel = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 减少缩进级别的行
      if (trimmedLine.startsWith('}') || trimmedLine.startsWith(')') || trimmedLine.startsWith(']')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // 添加缩进后的行
      if (trimmedLine.length > 0) {
        formattedLines.push(indentStr.repeat(indentLevel) + trimmedLine);
      } else {
        formattedLines.push('');
      }
      
      // 增加缩进级别的行
      if (
        trimmedLine.endsWith('{') || 
        trimmedLine.endsWith('(') || 
        trimmedLine.endsWith('[') ||
        trimmedLine.endsWith('=>') ||
        trimmedLine.endsWith('=> {')
      ) {
        indentLevel++;
      }
    }
    
    return formattedLines.join('\n');
  }
  
  /**
   * 确保代码中的语句有分号
   * @param code 代码
   * @returns 格式化后的代码
   */
  private ensureSemicolons(code: string): string {
    // 简单实现，实际应用中需要更复杂的解析
    const lines = code.split(/\r?\n/);
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      if (
        trimmedLine.length > 0 && 
        !trimmedLine.endsWith(';') && 
        !trimmedLine.endsWith('{') && 
        !trimmedLine.endsWith('}') && 
        !trimmedLine.endsWith('(') && 
        !trimmedLine.endsWith(')') &&
        !trimmedLine.endsWith(',') &&
        !trimmedLine.endsWith('[') &&
        !trimmedLine.endsWith(']') &&
        !trimmedLine.startsWith('//') &&
        !trimmedLine.startsWith('/*') &&
        !trimmedLine.endsWith('*/') &&
        !trimmedLine.startsWith('import ') &&
        !trimmedLine.startsWith('export ')
      ) {
        return line + ';';
      }
      return line;
    });
    
    return formattedLines.join('\n');
  }
  
  /**
   * 移除代码中的分号
   * @param code 代码
   * @returns 格式化后的代码
   */
  private removeSemicolons(code: string): string {
    // 简单实现，实际应用中需要更复杂的解析
    return code.replace(/;(\s*$)/gm, '$1');
  }
  
  /**
   * 将代码中的双引号转换为单引号
   * @param code 代码
   * @returns 格式化后的代码
   */
  private convertToSingleQuotes(code: string): string {
    // 简单实现，实际应用中需要处理转义字符
    return code.replace(/(?<!\\)"/g, "'");
  }
  
  /**
   * 将代码中的单引号转换为双引号
   * @param code 代码
   * @returns 格式化后的代码
   */
  private convertToDoubleQuotes(code: string): string {
    // 简单实现，实际应用中需要处理转义字符
    return code.replace(/(?<!\\)'/g, '"');
  }
  
  /**
   * 添加尾随逗号
   * @param code 代码
   * @returns 格式化后的代码
   */
  private addTrailingCommas(code: string): string {
    // 简单实现，实际应用中需要更复杂的解析
    return code.replace(/(\s*)([\]}])(\s*)/g, ',$1$2$3');
  }
  
  /**
   * 移除尾随逗号
   * @param code 代码
   * @returns 格式化后的代码
   */
  private removeTrailingCommas(code: string): string {
    // 简单实现，实际应用中需要更复杂的解析
    return code.replace(/,(\s*)([\]}])/g, '$1$2');
  }
}