#!/usr/bin/env node

/**
 * Mantras MCP Server Launcher
 * 
 * 简化的 MCP 服务器启动器，提供友好的用户体验
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Mantras MCP Server...');
console.log('📍 Entry Point: index.js');
console.log('🔧 Server Location: dist/infrastructure/server/server.js');
console.log('');

// 启动服务器
const serverPath = path.join(__dirname, 'index.js');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  cwd: __dirname
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
  console.log('✅ Server stopped gracefully');
});