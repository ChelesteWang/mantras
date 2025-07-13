import { Asset } from './types.js';

// 远程资产源 URL 列表
export const ASSET_SOURCES: string[] = [
  // 暂时清空，避免无效URL导致超时
  // 'https://example.com/assets.json'
];

// 默认资产数组
export const defaultAssets: Asset[] = [
  {
    id: 'default-persona-1',
    type: 'persona',
    name: 'Default Persona',
    description: 'A default persona asset.'
  },
  {
    id: 'default-prompt-1',
    type: 'prompt',
    name: 'Default Prompt',
    description: 'A default prompt asset.'
  },
  {
    id: 'default-tool-1',
    type: 'tool',
    name: 'Default Tool',
    description: 'A default tool asset.'
  }
];