#!/usr/bin/env node

/**
 * Mantras MCP Server - 主入口文件
 * 
 * 这是 Mantras MCP 服务器的主要入口点，提供简洁的启动路径
 */

// 导入并启动服务器
import('./dist/infrastructure/server/server.js')
  .then(() => {
    // 服务器启动成功
  })
  .catch((error) => {
    console.error('Failed to start Mantras MCP Server:', error);
    process.exit(1);
  });