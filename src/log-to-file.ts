import * as fsSync from 'fs';
import { resolve } from 'path';

export function logToFile(message: string) {
  try {
    const logPath = resolve(process.cwd(), 'debug.log');
    fsSync.appendFileSync(logPath, message + '\n');
  } catch (e) {
    try {
      fsSync.appendFileSync('/tmp/debug.log', message + '\n');
    } catch {}
  }
} 