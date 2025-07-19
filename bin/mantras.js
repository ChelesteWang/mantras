#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the MCP server
const serverPath = join(__dirname, '..', 'dist', 'infrastructure', 'server', 'server.js');

console.log('🎭 Starting Mantras MCP Server...');

try {
  const { default: server } = await import(serverPath);
  console.log('✅ Mantras MCP Server started successfully');
} catch (err) {
  console.error('❌ Failed to start Mantras MCP Server:', err.message);
  console.error('💡 Make sure to run "npm run build" first');
  process.exit(1);
}