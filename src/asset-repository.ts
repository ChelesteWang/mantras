import { Asset, AssetRepository } from './types';
import { ASSET_SOURCES, defaultAssets } from './asset-sources';
import * as fs from 'fs/promises';
import { logToFile } from './log-to-file';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5分钟

export class RemoteAssetRepository implements AssetRepository {
  private cache: Map<string, Asset> = new Map();
  private lastFetch: number = 0;
  private localFilePath?: string;

  constructor(localFilePath?: string) {
    this.localFilePath = localFilePath;
  }

  async getAssets(): Promise<Asset[]> {
    if (this.isCacheValid()) {
      return Array.from(this.cache.values());
    }
    let assets: Asset[] = [];
    // 1. 远程拉取
    for (const url of ASSET_SOURCES) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            assets = data;
            break;
          }
        }
      } catch (e) {
        // 跳过失败，尝试下一个
      }
    }
    // 2. 远程失败用默认
    if (assets.length === 0) {
      assets = [...defaultAssets];
    }
    // 3. 合并本地（本地优先覆盖）
    if (this.localFilePath) {
      try {
        const file = await fs.readFile(this.localFilePath, 'utf-8');
        const localAssets = JSON.parse(file);
        if (Array.isArray(localAssets)) {
          // 用本地覆盖同 id
          const map = new Map(assets.map(a => [a.id, a]));
          for (const la of localAssets) {
            map.set(la.id, la);
          }
          assets = Array.from(map.values());
        }
      } catch (e) {
        // 本地文件无效或不存在，忽略
      }
    }
    // 4. 缓存
    this.cache.clear();
    for (const asset of assets) {
      this.cache.set(asset.id, asset);
    }
    this.lastFetch = Date.now();
    return assets;
  }

  async getAssetById(id: string): Promise<Asset | undefined> {
      const assets = await this.getAssets();
      const asset = assets.find(a => a.id === id);
      logToFile(`getAssetById: ${id}
asset: ${JSON.stringify(asset)}`);
      return asset;
  }

  private isCacheValid(): boolean {
    return this.cache.size > 0 && (Date.now() - this.lastFetch < CACHE_TTL_MS);
  }
}