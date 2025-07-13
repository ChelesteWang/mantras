#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the server directly
const serverPath = join(__dirname, '..', 'dist', 'server.js');

import(serverPath).catch(err => {
  console.error('Failed to load server:', err);
  process.exit(1);
});