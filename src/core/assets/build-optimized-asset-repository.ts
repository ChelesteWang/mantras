import { Asset, AssetRepository } from '../../types';
import { logger } from '../../infrastructure/logging';
import * as fs from 'fs/promises';
import * as path from 'path';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10分钟缓存

/**
 * 构建时优化的资产仓库
 * 优先使用构建时生成的资产数据，提升性能
 */
export class BuildOptimizedAssetRepository implements AssetRepository {
  private cache: Map<string, Asset> = new Map();
  private lastFetch: number = 0;
  private buildAssetsPath: string;
  private fallbackRepository?: AssetRepository;

  constructor(buildAssetsPath = './dist/assets/assets.json', fallbackRepository?: AssetRepository) {
    this.buildAssetsPath = buildAssetsPath;
    this.fallbackRepository = fallbackRepository;
  }

  async getAssets(): Promise<Asset[]> {
    if (this.isCacheValid()) {
      return Array.from(this.cache.values());
    }

    try {
      // 优先尝试加载构建时生成的资产
      const assets = await this.loadBuildTimeAssets();

      // 更新缓存
      this.updateCache(assets);

      logger.info(`Loaded ${assets.length} assets from build-time data`);
      return assets;
    } catch (error) {
      logger.warn(
        'Failed to load build-time assets, trying fallback:',
        error instanceof Error ? error.message : String(error)
      );

      // 回退到备用仓库
      if (this.fallbackRepository) {
        const assets = await this.fallbackRepository.getAssets();
        this.updateCache(assets);
        logger.info(`Loaded ${assets.length} assets from fallback repository`);
        return assets;
      }

      throw new Error('No assets available from build-time or fallback sources');
    }
  }

  async getAssetById(id: string): Promise<Asset | undefined> {
    const assets = await this.getAssets();
    return assets.find(a => a.id === id);
  }

  private async loadBuildTimeAssets(): Promise<Asset[]> {
    // 检查构建时资产文件是否存在
    try {
      await fs.access(this.buildAssetsPath);
    } catch {
      throw new Error(`Build-time assets file not found: ${this.buildAssetsPath}`);
    }

    // 读取构建时生成的资产数据
    const content = await fs.readFile(this.buildAssetsPath, 'utf-8');
    const assets = JSON.parse(content);

    if (!Array.isArray(assets)) {
      throw new Error('Invalid build-time assets format: expected array');
    }

    // 验证资产格式
    for (const asset of assets) {
      this.validateAsset(asset);
    }

    return assets;
  }

  private validateAsset(asset: any): void {
    const requiredFields = ['id', 'type', 'name', 'description'];

    for (const field of requiredFields) {
      if (!asset[field]) {
        throw new Error(`Asset ${asset.id || 'unknown'} missing required field: ${field}`);
      }
    }
  }

  private updateCache(assets: Asset[]): void {
    this.cache.clear();
    for (const asset of assets) {
      this.cache.set(asset.id, asset);
    }
    this.lastFetch = Date.now();
  }

  private isCacheValid(): boolean {
    return this.cache.size > 0 && Date.now() - this.lastFetch < CACHE_TTL_MS;
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
  getCacheStats(): {
    size: number;
    lastFetch: Date | null;
    isValid: boolean;
    source: 'build-time' | 'fallback' | 'none';
  } {
    return {
      size: this.cache.size,
      lastFetch: this.lastFetch > 0 ? new Date(this.lastFetch) : null,
      isValid: this.isCacheValid(),
      source: this.cache.size > 0 ? 'build-time' : 'none',
    };
  }

  /**
   * 检查构建时资产是否可用
   */
  async isBuildTimeAssetsAvailable(): Promise<boolean> {
    try {
      await fs.access(this.buildAssetsPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取构建时资产信息
   */
  async getBuildTimeInfo(): Promise<any> {
    try {
      const indexPath = path.join(path.dirname(this.buildAssetsPath), 'index.json');
      const content = await fs.readFile(indexPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
}
