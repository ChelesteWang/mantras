// 资产类型
export type AssetType = 'persona' | 'prompt' | 'tool';

// 资产结构
export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  description?: string;
  [key: string]: any; // 允许扩展字段
}

// 资产仓库接口
export interface AssetRepository {
  getAssets(): Promise<Asset[]>;
  getAssetById(id: string): Promise<Asset | undefined>;
}