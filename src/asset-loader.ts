import { Asset, AssetType } from './types';
import { AssetFactory } from './asset-factory';
import { logger } from './logger';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 资产加载器 - 负责从不同来源加载资产
 */
export class AssetLoader {
  /**
   * 从JSON文件加载资产
   */
  static async loadFromFile(filePath: string): Promise<Asset[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (!Array.isArray(data)) {
        throw new Error('Asset file must contain an array of assets');
      }

      return data.map(item => AssetFactory.fromRawData(item));
    } catch (error) {
      logger.error(`Failed to load assets from file ${filePath}:`, 
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 从目录加载资产（支持多个文件）
   */
  static async loadFromDirectory(dirPath: string): Promise<Asset[]> {
    try {
      const files = await fs.readdir(dirPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      const allAssets: Asset[] = [];
      
      for (const file of jsonFiles) {
        const filePath = path.join(dirPath, file);
        try {
          const assets = await this.loadFromFile(filePath);
          allAssets.push(...assets);
          logger.info(`Loaded ${assets.length} assets from ${file}`);
        } catch (error) {
          logger.warn(`Failed to load assets from ${file}, skipping...`);
        }
      }

      return allAssets;
    } catch (error) {
      logger.error(`Failed to load assets from directory ${dirPath}:`,
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 从URL加载资产
   */
  static async loadFromUrl(url: string): Promise<Asset[]> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Remote asset source must return an array of assets');
      }

      return data.map(item => AssetFactory.fromRawData(item));
    } catch (error) {
      logger.error(`Failed to load assets from URL ${url}:`,
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 验证并过滤资产
   */
  static validateAndFilter(assets: Asset[]): Asset[] {
    const validAssets: Asset[] = [];
    const errors: string[] = [];

    for (const asset of assets) {
      const validation = AssetFactory.validateAsset(asset);
      if (validation.valid) {
        validAssets.push(asset);
      } else {
        errors.push(`Asset ${asset.id || 'unknown'}: ${validation.errors.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      logger.warn(`Found ${errors.length} invalid assets:`, errors);
    }

    logger.info(`Validated ${validAssets.length} assets successfully`);
    return validAssets;
  }
}

/**
 * 资产序列化器 - 负责将资产保存到不同格式
 */
export class AssetSerializer {
  /**
   * 将资产保存为JSON文件
   */
  static async saveToFile(assets: Asset[], filePath: string): Promise<void> {
    try {
      const content = JSON.stringify(assets, null, 2);
      await fs.writeFile(filePath, content, 'utf-8');
      logger.info(`Saved ${assets.length} assets to ${filePath}`);
    } catch (error) {
      logger.error(`Failed to save assets to file ${filePath}:`,
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 按类型分组保存资产
   */
  static async saveByType(assets: Asset[], outputDir: string): Promise<void> {
    try {
      // 确保输出目录存在
      await fs.mkdir(outputDir, { recursive: true });

      // 按类型分组
      const assetsByType = new Map<AssetType, Asset[]>();
      for (const asset of assets) {
        if (!assetsByType.has(asset.type)) {
          assetsByType.set(asset.type, []);
        }
        assetsByType.get(asset.type)!.push(asset);
      }

      // 保存每个类型到单独文件
      for (const [type, typeAssets] of assetsByType) {
        const fileName = `${type}s.json`;
        const filePath = path.join(outputDir, fileName);
        await this.saveToFile(typeAssets, filePath);
      }

      logger.info(`Saved assets by type to directory ${outputDir}`);
    } catch (error) {
      logger.error(`Failed to save assets by type:`,
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 导出资产为TypeScript定义
   */
  static generateTypeScriptDefinitions(assets: Asset[]): string {
    const lines: string[] = [];
    lines.push('// Auto-generated asset definitions');
    lines.push('import { Asset } from "./types";');
    lines.push('');

    // 按类型分组
    const assetsByType = new Map<AssetType, Asset[]>();
    for (const asset of assets) {
      if (!assetsByType.has(asset.type)) {
        assetsByType.set(asset.type, []);
      }
      assetsByType.get(asset.type)!.push(asset);
    }

    // 为每个类型生成常量
    for (const [type, typeAssets] of assetsByType) {
      const constantName = `${type.toUpperCase().replace('-', '_')}_ASSETS`;
      lines.push(`export const ${constantName}: Asset[] = [`);
      
      for (const asset of typeAssets) {
        lines.push(`  ${JSON.stringify(asset, null, 2).replace(/\n/g, '\n  ')},`);
      }
      
      lines.push('];');
      lines.push('');
    }

    // 生成总的资产数组
    lines.push('export const ALL_ASSETS: Asset[] = [');
    for (const [type] of assetsByType) {
      const constantName = `${type.toUpperCase().replace('-', '_')}_ASSETS`;
      lines.push(`  ...${constantName},`);
    }
    lines.push('];');

    return lines.join('\n');
  }
}