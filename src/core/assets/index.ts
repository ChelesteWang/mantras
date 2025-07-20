/**
 * Assets Module - 资产管理模块
 *
 * 统一导出所有资产管理相关的类和接口
 */

export { AssetFactory } from './asset-factory';
export { AssetLoader, AssetSerializer } from './asset-loader';
export { RemoteAssetRepository } from './asset-repository';
export { ASSET_SOURCES, defaultAssets } from './asset-sources';
export { BuildOptimizedAssetRepository } from './build-optimized-asset-repository';
export { EnhancedAssetManager } from './enhanced-asset-manager';
export { MarkdownAssetRepository } from './markdown-asset-repository';
export { UnifiedAssetManager } from './unified-asset-manager';
