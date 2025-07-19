import { Asset, AssetRepository } from '../../types';
import { AssetLoader } from './asset-loader';
import { defaultAssets } from './asset-sources';
import { logger } from '../../infrastructure/logging';
import * as path from 'path';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5分钟

/**
 * 基于 Markdown 文件的资产仓库
 * 优先从 assets/ 目录的 Markdown 文件加载，回退到硬编码资产
 */
export class MarkdownAssetRepository implements AssetRepository {
  private cache: Map<string, Asset> = new Map();
  private lastFetch: number = 0;
  private assetsDir: string;

  constructor(assetsDir = './assets') {
    this.assetsDir = assetsDir;
  }

  async getAssets(): Promise<Asset[]> {
    if (this.isCacheValid()) {
      return Array.from(this.cache.values());
    }

    try {
      const assets = await this.loadFromMarkdownFiles();
      
      // 更新缓存
      this.cache.clear();
      for (const asset of assets) {
        this.cache.set(asset.id, asset);
      }
      this.lastFetch = Date.now();
      
      logger.info(`Loaded ${assets.length} assets from Markdown files`);
      return assets;
    } catch (error) {
      logger.error('Failed to load assets from Markdown files, falling back to default assets:', 
        error instanceof Error ? error : new Error(String(error)));
      
      // 回退到硬编码资产
      this.cache.clear();
      for (const asset of defaultAssets) {
        this.cache.set(asset.id, asset);
      }
      this.lastFetch = Date.now();
      
      return defaultAssets;
    }
  }

  async getAssetById(id: string): Promise<Asset | undefined> {
    const assets = await this.getAssets();
    return assets.find(a => a.id === id);
  }

  private async loadFromMarkdownFiles(): Promise<Asset[]> {
    const allAssets: Asset[] = [];
    
    // 定义要扫描的资产类型目录
    const assetTypeDirs = [
      'personas',
      'prompt-templates', 
      'prompts'
    ];

    for (const typeDir of assetTypeDirs) {
      const dirPath = path.join(this.assetsDir, typeDir);
      
      try {
        const assets = await AssetLoader.loadFromDirectory(dirPath);
        allAssets.push(...assets);
        logger.info(`Loaded ${assets.length} assets from ${typeDir}`);
      } catch (error) {
        logger.warn(`Failed to load assets from ${typeDir}:`, error);
        // 继续处理其他目录，不中断整个加载过程
      }
    }

    // 如果没有加载到任何资产，抛出错误以触发回退
    if (allAssets.length === 0) {
      throw new Error('No assets loaded from Markdown files');
    }

    return allAssets;
  }

  private isCacheValid(): boolean {
    return this.cache.size > 0 && (Date.now() - this.lastFetch < CACHE_TTL_MS);
  }

  /**
   * 强制刷新缓存
   */
  async refreshCache(): Promise<void> {
    this.cache.clear();
    this.lastFetch = 0;
    await this.getAssets();
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { size: number; lastFetch: Date | null; isValid: boolean } {
    return {
      size: this.cache.size,
      lastFetch: this.lastFetch > 0 ? new Date(this.lastFetch) : null,
      isValid: this.isCacheValid()
    };
  }
}