import { Asset, AssetRepository, AssetType, Persona, PromptTemplate, ActionableTool } from '../../types';
import { AssetFactory } from './asset-factory';
import { AssetLoader, AssetSerializer } from './asset-loader';
import { logger } from '../../infrastructure/logging';

/**
 * 统一资产管理器 - 管理所有类型的资产（人格、提示模板、工具）
 */
export class UnifiedAssetManager {
  private assets: Map<string, Asset> = new Map();
  private assetsByType: Map<AssetType, Map<string, Asset>> = new Map();
  private repository: AssetRepository;
  private changeListeners: Set<(asset: Asset, action: 'added' | 'updated' | 'removed') => void> = new Set();

  constructor(repository: AssetRepository) {
    this.repository = repository;
    this.initializeAssetMaps();
  }

  private initializeAssetMaps() {
    const types: AssetType[] = ['persona', 'prompt', 'tool', 'prompt-template'];
    types.forEach(type => {
      this.assetsByType.set(type, new Map());
    });
  }

  /**
   * 添加变更监听器
   */
  addChangeListener(listener: (asset: Asset, action: 'added' | 'updated' | 'removed') => void): void {
    this.changeListeners.add(listener);
  }

  /**
   * 移除变更监听器
   */
  removeChangeListener(listener: (asset: Asset, action: 'added' | 'updated' | 'removed') => void): void {
    this.changeListeners.delete(listener);
  }

  private notifyListeners(asset: Asset, action: 'added' | 'updated' | 'removed'): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(asset, action);
      } catch (error) {
        logger.error('Error in asset change listener:', error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * 加载所有资产
   */
  async loadAssets(): Promise<void> {
    try {
      const assets = await this.repository.getAssets();
      this.assets.clear();
      this.assetsByType.forEach(map => map.clear());

      for (const asset of assets) {
        this.registerAsset(asset);
      }

      logger.info(`Loaded ${assets.length} assets`);
    } catch (error) {
      logger.error('Failed to load assets:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 注册单个资产
   */
  registerAsset(asset: Asset, skipValidation = false): void {
    // 验证资产
    if (!skipValidation) {
      const validation = AssetFactory.validateAsset(asset);
      if (!validation.valid) {
        throw new Error(`Invalid asset ${asset.id}: ${validation.errors.join(', ')}`);
      }
    }

    const isUpdate = this.assets.has(asset.id);
    
    this.assets.set(asset.id, asset);
    
    const typeMap = this.assetsByType.get(asset.type);
    if (typeMap) {
      typeMap.set(asset.id, asset);
    }

    // 通知监听器
    this.notifyListeners(asset, isUpdate ? 'updated' : 'added');

    logger.debug(`${isUpdate ? 'Updated' : 'Registered'} asset: ${asset.type}/${asset.id}`);
  }

  /**
   * 移除资产
   */
  removeAsset(id: string): boolean {
    const asset = this.assets.get(id);
    if (!asset) {
      return false;
    }

    this.assets.delete(id);
    
    const typeMap = this.assetsByType.get(asset.type);
    if (typeMap) {
      typeMap.delete(id);
    }

    // 通知监听器
    this.notifyListeners(asset, 'removed');

    logger.debug(`Removed asset: ${asset.type}/${asset.id}`);
    return true;
  }

  /**
   * 获取所有资产
   */
  getAllAssets(): Asset[] {
    return Array.from(this.assets.values());
  }

  /**
   * 根据ID获取资产
   */
  getAssetById(id: string): Asset | undefined {
    return this.assets.get(id);
  }

  /**
   * 根据类型获取资产
   */
  getAssetsByType<T extends Asset>(type: AssetType): T[] {
    const typeMap = this.assetsByType.get(type);
    return typeMap ? Array.from(typeMap.values()) as T[] : [];
  }

  /**
   * 获取所有人格
   */
  getPersonas(): Persona[] {
    return this.getAssetsByType<Persona>('persona');
  }

  /**
   * 获取所有提示模板
   */
  getPromptTemplates(): PromptTemplate[] {
    return this.getAssetsByType<PromptTemplate>('prompt-template');
  }

  /**
   * 获取所有工具
   */
  getTools(): ActionableTool[] {
    return this.getAssetsByType<ActionableTool>('tool');
  }

  /**
   * 根据类别获取提示模板
   */
  getPromptTemplatesByCategory(category: string): PromptTemplate[] {
    return this.getPromptTemplates().filter(template => template.category === category);
  }

  /**
   * 根据能力获取人格
   */
  getPersonasByCapability(capability: keyof Persona['capabilities']): Persona[] {
    return this.getPersonas().filter(persona => persona.capabilities[capability]);
  }

  /**
   * 搜索资产
   */
  searchAssets(query: string, type?: AssetType): Asset[] {
    const searchIn = type ? this.getAssetsByType(type) : this.getAllAssets();
    const lowerQuery = query.toLowerCase();

    return searchIn.filter(asset => 
      asset.name.toLowerCase().includes(lowerQuery) ||
      asset.description?.toLowerCase().includes(lowerQuery) ||
      asset.id.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 获取资产统计信息
   */
  getAssetStats(): Record<AssetType, number> {
    const stats: Record<AssetType, number> = {
      'persona': 0,
      'prompt': 0,
      'tool': 0,
      'prompt-template': 0
    };

    this.assetsByType.forEach((map, type) => {
      stats[type] = map.size;
    });

    return stats;
  }

  /**
   * 验证资产完整性
   */
  validateAsset(asset: Asset): boolean {
    if (!asset.id || !asset.type || !asset.name) {
      return false;
    }

    switch (asset.type) {
      case 'persona':
        const persona = asset as Persona;
        return !!(persona.systemPrompt && persona.personality && persona.capabilities);
      
      case 'prompt-template':
        const template = asset as PromptTemplate;
        return !!(template.template && template.technique && template.parameters);
      
      case 'tool':
        const tool = asset as ActionableTool;
        return !!(tool.parameters && tool.execute);
      
      default:
        return true;
    }
  }

  /**
   * 刷新资产（重新从仓库加载）
   */
  async refreshAssets(): Promise<void> {
    logger.info('Refreshing assets...');
    await this.loadAssets();
  }

  /**
   * 从文件导入资产
   */
  async importFromFile(filePath: string): Promise<number> {
    try {
      const assets = await AssetLoader.loadFromFile(filePath);
      const validAssets = AssetLoader.validateAndFilter(assets);
      
      for (const asset of validAssets) {
        this.registerAsset(asset, true); // 跳过验证，因为已经验证过了
      }

      logger.info(`Imported ${validAssets.length} assets from ${filePath}`);
      return validAssets.length;
    } catch (error) {
      logger.error(`Failed to import assets from ${filePath}:`, 
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 从目录导入资产
   */
  async importFromDirectory(dirPath: string): Promise<number> {
    try {
      const assets = await AssetLoader.loadFromDirectory(dirPath);
      const validAssets = AssetLoader.validateAndFilter(assets);
      
      for (const asset of validAssets) {
        this.registerAsset(asset, true);
      }

      logger.info(`Imported ${validAssets.length} assets from directory ${dirPath}`);
      return validAssets.length;
    } catch (error) {
      logger.error(`Failed to import assets from directory ${dirPath}:`, 
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 导出资产到文件
   */
  async exportToFile(filePath: string, type?: AssetType): Promise<void> {
    const assets = type ? this.getAssetsByType(type) : this.getAllAssets();
    await AssetSerializer.saveToFile(assets, filePath);
  }

  /**
   * 按类型导出资产到目录
   */
  async exportByType(outputDir: string): Promise<void> {
    await AssetSerializer.saveByType(this.getAllAssets(), outputDir);
  }

  /**
   * 生成TypeScript定义文件
   */
  generateTypeScriptDefinitions(): string {
    return AssetSerializer.generateTypeScriptDefinitions(this.getAllAssets());
  }

  /**
   * 创建资产快照
   */
  createSnapshot(): { timestamp: string; assets: Asset[]; stats: Record<AssetType, number> } {
    return {
      timestamp: new Date().toISOString(),
      assets: this.getAllAssets(),
      stats: this.getAssetStats()
    };
  }

  /**
   * 从快照恢复资产
   */
  restoreFromSnapshot(snapshot: { assets: Asset[] }): void {
    // 清空当前资产
    this.assets.clear();
    this.assetsByType.forEach(map => map.clear());

    // 加载快照中的资产
    for (const asset of snapshot.assets) {
      this.registerAsset(asset, true);
    }

    logger.info(`Restored ${snapshot.assets.length} assets from snapshot`);
  }
}