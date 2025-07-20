import { UnifiedAssetManager } from './unified-asset-manager';
import { Asset, AssetType } from '../../types';
import { logger } from '../../infrastructure/logging';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 增强的资产管理器 - 提供高级维护功能
 */
export class EnhancedAssetManager extends UnifiedAssetManager {
  private assetsDirectory: string;
  private templatesDirectory: string;

  constructor(repository: any, assetsDir = './assets', templatesDir = './templates') {
    super(repository);
    this.assetsDirectory = assetsDir;
    this.templatesDirectory = templatesDir;
  }

  /**
   * 从结构化目录加载资产
   */
  async loadFromStructuredDirectory(): Promise<void> {
    try {
      const assetTypes: AssetType[] = ['persona', 'prompt-template', 'tool'];

      for (const type of assetTypes) {
        const typeDir = path.join(this.assetsDirectory, `${type}s`);

        try {
          const files = await fs.readdir(typeDir);
          const jsonFiles = files.filter(file => file.endsWith('.json'));

          for (const file of jsonFiles) {
            const filePath = path.join(typeDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const asset = JSON.parse(content);

            // 验证并注册资产
            this.registerAsset(asset);
            logger.info(`Loaded ${type}: ${asset.id}`);
          }
        } catch (error) {
          logger.warn(`Directory ${typeDir} not found, skipping...`);
        }
      }
    } catch (error) {
      logger.error(
        'Failed to load from structured directory:',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  /**
   * 保存资产到结构化目录
   */
  async saveToStructuredDirectory(): Promise<void> {
    try {
      const assetTypes: AssetType[] = ['persona', 'prompt-template', 'tool'];

      for (const type of assetTypes) {
        const typeDir = path.join(this.assetsDirectory, `${type}s`);
        await fs.mkdir(typeDir, { recursive: true });

        const assets = this.getAssetsByType(type);

        for (const asset of assets) {
          const filePath = path.join(typeDir, `${asset.id}.json`);
          const content = JSON.stringify(asset, null, 2);
          await fs.writeFile(filePath, content, 'utf-8');
        }

        logger.info(`Saved ${assets.length} ${type}s to ${typeDir}`);
      }
    } catch (error) {
      logger.error(
        'Failed to save to structured directory:',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  /**
   * 从模板创建新资产
   */
  async createFromTemplate(type: AssetType, templateVars: Record<string, any>): Promise<Asset> {
    try {
      const templatePath = path.join(this.templatesDirectory, `${type}.template.json`);
      let templateContent = await fs.readFile(templatePath, 'utf-8');

      // 替换模板变量
      for (const [key, value] of Object.entries(templateVars)) {
        const placeholder = `{{${key}}}`;
        templateContent = templateContent.replace(new RegExp(placeholder, 'g'), String(value));
      }

      const asset = JSON.parse(templateContent);

      // 验证资产
      this.registerAsset(asset);

      // 保存到文件
      const typeDir = path.join(this.assetsDirectory, `${type}s`);
      await fs.mkdir(typeDir, { recursive: true });
      const filePath = path.join(typeDir, `${asset.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(asset, null, 2), 'utf-8');

      logger.info(`Created new ${type}: ${asset.id}`);
      return asset;
    } catch (error) {
      logger.error(
        `Failed to create ${type} from template:`,
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  /**
   * 批量验证资产
   */
  async validateAllAssets(): Promise<{
    valid: Asset[];
    invalid: Array<{ asset: Asset; errors: string[] }>;
  }> {
    const assets = this.getAllAssets();
    const valid: Asset[] = [];
    const invalid: Array<{ asset: Asset; errors: string[] }> = [];

    for (const asset of assets) {
      if (this.validateAsset(asset)) {
        valid.push(asset);
      } else {
        // 获取详细错误信息
        const validation = this.getDetailedValidation(asset);
        invalid.push({ asset, errors: validation.errors });
      }
    }

    return { valid, invalid };
  }

  /**
   * 获取详细验证信息
   */
  private getDetailedValidation(asset: Asset): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!asset.id) errors.push('Missing asset ID');
    if (!asset.name) errors.push('Missing asset name');
    if (!asset.type) errors.push('Missing asset type');
    if (!asset.description) errors.push('Missing asset description');

    // 类型特定验证
    switch (asset.type) {
      case 'persona':
        if (!asset.systemPrompt) errors.push('Missing system prompt');
        if (!asset.personality) errors.push('Missing personality definition');
        if (!asset.capabilities) errors.push('Missing capabilities definition');
        break;

      case 'prompt-template':
        if (!asset.template) errors.push('Missing template content');
        if (!asset.technique) errors.push('Missing technique');
        if (!asset.parameters) errors.push('Missing parameters');
        if (!asset.category) errors.push('Missing category');
        break;
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * 生成资产使用报告
   */
  generateUsageReport(): {
    totalAssets: number;
    byType: Record<AssetType, number>;
    topUsed: Array<{ id: string; name: string; usageCount: number }>;
    unused: Array<{ id: string; name: string; type: AssetType }>;
  } {
    const assets = this.getAllAssets();
    const stats = this.getAssetStats();

    const topUsed = assets
      .filter(asset => asset.metadata?.usageCount > 0)
      .sort((a, b) => (b.metadata?.usageCount || 0) - (a.metadata?.usageCount || 0))
      .slice(0, 10)
      .map(asset => ({
        id: asset.id,
        name: asset.name,
        usageCount: asset.metadata?.usageCount || 0,
      }));

    const unused = assets
      .filter(asset => !asset.metadata?.usageCount || asset.metadata.usageCount === 0)
      .map(asset => ({
        id: asset.id,
        name: asset.name,
        type: asset.type,
      }));

    return {
      totalAssets: assets.length,
      byType: stats,
      topUsed,
      unused,
    };
  }

  /**
   * 清理未使用的资产
   */
  async cleanupUnusedAssets(dryRun = true): Promise<string[]> {
    const report = this.generateUsageReport();
    const toRemove = report.unused.map(asset => asset.id);

    if (!dryRun) {
      for (const assetId of toRemove) {
        this.removeAsset(assetId);

        // 从文件系统删除
        const asset = this.getAssetById(assetId);
        if (asset) {
          const typeDir = path.join(this.assetsDirectory, `${asset.type}s`);
          const filePath = path.join(typeDir, `${asset.id}.json`);

          try {
            await fs.unlink(filePath);
            logger.info(`Deleted unused asset file: ${filePath}`);
          } catch (error) {
            logger.warn(`Failed to delete file ${filePath}:`, error);
          }
        }
      }
    }

    return toRemove;
  }

  /**
   * 备份所有资产
   */
  async createBackup(backupDir: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `assets-backup-${timestamp}`);

    await fs.mkdir(backupPath, { recursive: true });

    // 导出所有资产
    await this.exportByType(backupPath);

    // 创建备份元数据
    const metadata = {
      timestamp,
      totalAssets: this.getAllAssets().length,
      stats: this.getAssetStats(),
      version: '2.0.0',
    };

    await fs.writeFile(
      path.join(backupPath, 'backup-metadata.json'),
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );

    logger.info(`Backup created at: ${backupPath}`);
  }
}
