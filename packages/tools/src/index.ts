// 导出工具接口
export * from './interfaces/tool';

// 导出基础工具类
export * from './base/base-tool';
export * from './base/ide-tool';
export * from './base/code-tool';
export * from './base/file-tool';

// 导出具体工具实现
export * from './code/code-formatter';
export * from './file/file-reader';

// 导出工具类别常量
export const ToolCategories = {
  CODE: 'code',
  FILE: 'file',
  NETWORK: 'network',
  UTILITY: 'utility',
  IDE: 'ide',
  LANGUAGE: 'language',
  DATABASE: 'database',
  SECURITY: 'security',
  TESTING: 'testing',
  DEPLOYMENT: 'deployment',
  AI: 'ai'
};

// 导出工具权限常量
export const ToolPermissions = {
  READ_FILE: 'read_file',
  WRITE_FILE: 'write_file',
  EXECUTE_COMMAND: 'execute_command',
  NETWORK_ACCESS: 'network_access',
  DATABASE_ACCESS: 'database_access',
  SYSTEM_ACCESS: 'system_access',
  IDE_INTEGRATION: 'ide_integration'
};