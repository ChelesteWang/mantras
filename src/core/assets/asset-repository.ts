import { Asset, AssetRepository } from '../../types';
import { ASSET_SOURCES, defaultAssets } from './asset-sources';
import * as fs from 'fs/promises';

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

    let remoteAssets: Asset[] = [];
    let fetchSuccess = false;
    if (ASSET_SOURCES.length > 0) {
      for (const url of ASSET_SOURCES) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              remoteAssets = data;
              fetchSuccess = true;
              break;
            }
          }
        } catch (e) {
          if (e instanceof Error) {
            // eslint-disable-next-line no-console
            console.error(`Failed to fetch remote assets from ${url}: ${e.message}`);
          } else {
            // eslint-disable-next-line no-console
            console.error(`An unknown error occurred while fetching remote assets from ${url}`);
          }
        }
      }
    }

    const baseAssets = fetchSuccess ? remoteAssets : defaultAssets;
    const assetMap = new Map(baseAssets.map(a => [a.id, a]));

    if (this.localFilePath) {
      try {
        const file = await fs.readFile(this.localFilePath, 'utf-8');
        const localAssets = JSON.parse(file);
        if (Array.isArray(localAssets)) {
          for (const localAsset of localAssets) {
            assetMap.set(localAsset.id, localAsset);
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`Failed to read or parse local assets from ${this.localFilePath}:`, e);
      }
    }

    const finalAssets = Array.from(assetMap.values());

    this.cache.clear();
    for (const asset of finalAssets) {
      this.cache.set(asset.id, asset);
    }
    this.lastFetch = Date.now();
    return finalAssets;
  }

  async getAssetById(id: string): Promise<Asset | undefined> {
    const assets = await this.getAssets();
    const asset = assets.find(a => a.id === id);
    return asset;
  }

  private isCacheValid(): boolean {
    return this.cache.size > 0 && Date.now() - this.lastFetch < CACHE_TTL_MS;
  }
}
