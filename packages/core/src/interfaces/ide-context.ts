/**
 * IDE上下文接口
 * 定义IDE环境提供的上下文信息，包括项目、文件、用户等信息
 */
export interface IDEContext {
  /**
   * 工作区信息
   */
  workspace?: {
    /**
     * 工作区根路径
     */
    rootPath: string;
    
    /**
     * 工作区名称
     */
    name?: string;
    
    /**
     * 工作区中的文件列表
     */
    files?: string[];
  };
  
  /**
   * 当前文件信息
   */
  currentFile?: {
    /**
     * 文件路径
     */
    path: string;
    
    /**
     * 文件语言
     */
    language: string;
    
    /**
     * 文件内容
     */
    content?: string;
    
    /**
     * 文件大小（字节）
     */
    size?: number;
    
    /**
     * 文件修改时间
     */
    modifiedTime?: Date;
  };
  
  /**
   * 选择区域信息
   */
  selection?: {
    /**
     * 选中的文本内容
     */
    text: string;
    
    /**
     * 起始行号（从1开始）
     */
    startLine: number;
    
    /**
     * 起始列号（从1开始）
     */
    startColumn: number;
    
    /**
     * 结束行号
     */
    endLine: number;
    
    /**
     * 结束列号
     */
    endColumn: number;
  };
  
  /**
   * 项目信息
   */
  project?: {
    /**
     * 项目根路径
     */
    rootPath: string;
    
    /**
     * 项目名称
     */
    name: string;
    
    /**
     * 项目依赖
     */
    dependencies?: Record<string, string>;
    
    /**
     * 项目开发依赖
     */
    devDependencies?: Record<string, string>;
    
    /**
     * 项目主要语言
     */
    language?: string;
    
    /**
     * 项目使用的框架
     */
    framework?: string;
  };
  
  /**
   * 用户信息
   */
  user?: {
    /**
     * 用户ID
     */
    id: string;
    
    /**
     * 用户名称
     */
    name: string;
    
    /**
     * 用户偏好设置
     */
    preferences?: Record<string, any>;
  };
  
  /**
   * 扩展点：允许IDE插件提供额外上下文
   * 使用索引签名允许添加任意属性
   */
  [key: string]: any;
}