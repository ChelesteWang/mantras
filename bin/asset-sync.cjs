#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * 资产同步工具 - 确保 Markdown 资产的元数据同步
 */
class AssetSyncTool {
  constructor() {
    this.assetsDir = './assets';
    this.metadataFile = './assets/metadata.json';
  }

  async run() {
    console.log('🔄 Mantras 资产同步工具');
    console.log('===================================\n');
    
    try {
      // 扫描所有 Markdown 文件
      const assets = await this.scanAssets();
      
      // 生成元数据索引
      await this.generateMetadataIndex(assets);
      
      // 验证资产完整性
      await this.validateAssets(assets);
      
      // 更新统计信息
      await this.updateStatistics(assets);
      
      console.log('\n✅ 同步完成！');
      console.log(`📊 共处理 ${assets.length} 个资产`);
      
    } catch (error) {
      console.error('❌ 同步失败:', error.message);
      process.exit(1);
    }
  }

  async scanAssets() {
    console.log('🔍 扫描资产文件...');
    
    const assets = [];
    const assetTypes = ['personas', 'prompt-templates', 'prompts'];
    
    for (const assetType of assetTypes) {
      const typeDir = path.join(this.assetsDir, assetType);
      
      try {
        const files = await fs.readdir(typeDir);
        const markdownFiles = files.filter(file => file.endsWith('.md'));
        
        for (const mdFile of markdownFiles) {
          const filePath = path.join(typeDir, mdFile);
          try {
            const asset = await this.parseMarkdownAsset(filePath);
            assets.push({
              ...asset,
              filePath,
              assetType: assetType.slice(0, -1) // 移除复数形式
            });
            console.log(`✅ 解析: ${assetType}/${mdFile}`);
          } catch (error) {
            console.error(`❌ 解析失败 ${mdFile}:`, error.message);
          }
        }
      } catch (error) {
        console.warn(`⚠️  跳过目录 ${assetType}: ${error.message}`);
      }
    }
    
    return assets;
  }

  async parseMarkdownAsset(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const { metadata, body } = this.parseFrontMatter(content);
    
    // 从文件名推断 ID（如果 metadata 中没有）
    if (!metadata.id) {
      metadata.id = path.basename(filePath, '.md');
    }
    
    // 添加文件信息
    const stats = await fs.stat(filePath);
    metadata.fileInfo = {
      size: stats.size,
      created: stats.birthtime.toISOString(),
      modified: stats.mtime.toISOString()
    };
    
    return metadata;
  }

  parseFrontMatter(content) {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);
    
    if (!match) {
      throw new Error('Invalid Markdown format: Front Matter not found');
    }
    
    const [, frontMatter, body] = match;
    const metadata = {};
    
    // 简单的 YAML 解析
    const lines = frontMatter.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = trimmed.substring(0, colonIndex).trim();
      let value = trimmed.substring(colonIndex + 1).trim();
      
      // 处理数组格式
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(item => item.trim().replace(/['"]/g, ''));
      } else {
        value = value.replace(/^['"]|['"]$/g, '');
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(Number(value)) && value !== '') value = Number(value);
      }
      
      metadata[key] = value;
    }
    
    return { metadata, body };
  }

  async generateMetadataIndex(assets) {
    console.log('\n📋 生成元数据索引...');
    
    const index = {
      version: '2.0.0',
      generated: new Date().toISOString(),
      totalAssets: assets.length,
      assetsByType: {},
      assetsByTag: {},
      assets: {}
    };
    
    // 按类型分组
    for (const asset of assets) {
      const type = asset.type || asset.assetType;
      if (!index.assetsByType[type]) {
        index.assetsByType[type] = [];
      }
      index.assetsByType[type].push(asset.id);
      
      // 按标签分组
      if (asset.tags) {
        for (const tag of asset.tags) {
          if (!index.assetsByTag[tag]) {
            index.assetsByTag[tag] = [];
          }
          index.assetsByTag[tag].push(asset.id);
        }
      }
      
      // 添加到总索引
      index.assets[asset.id] = {
        type: type,
        name: asset.name,
        description: asset.description,
        version: asset.version,
        author: asset.author,
        tags: asset.tags || [],
        filePath: path.relative(this.assetsDir, asset.filePath),
        fileInfo: asset.fileInfo
      };
    }
    
    await fs.writeFile(this.metadataFile, JSON.stringify(index, null, 2), 'utf-8');
    console.log(`✅ 元数据索引已保存: ${this.metadataFile}`);
  }

  async validateAssets(assets) {
    console.log('\n🔍 验证资产完整性...');
    
    const errors = [];
    const warnings = [];
    
    for (const asset of assets) {
      // 必需字段检查
      const requiredFields = ['id', 'type', 'name', 'description'];
      for (const field of requiredFields) {
        if (!asset[field]) {
          errors.push(`${asset.id}: 缺少必需字段 '${field}'`);
        }
      }
      
      // ID 唯一性检查
      const duplicates = assets.filter(a => a.id === asset.id);
      if (duplicates.length > 1) {
        errors.push(`${asset.id}: ID 重复`);
      }
      
      // 版本格式检查
      if (asset.version && !/^\d+\.\d+\.\d+$/.test(asset.version)) {
        warnings.push(`${asset.id}: 版本格式不规范 '${asset.version}'`);
      }
      
      // 标签检查
      if (asset.tags && !Array.isArray(asset.tags)) {
        errors.push(`${asset.id}: tags 应该是数组`);
      }
    }
    
    if (errors.length > 0) {
      console.error('❌ 发现错误:');
      errors.forEach(error => console.error(`  - ${error}`));
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️  发现警告:');
      warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ 所有资产验证通过');
    }
    
    return { errors, warnings };
  }

  async updateStatistics(assets) {
    console.log('\n📊 更新统计信息...');
    
    const stats = {
      totalAssets: assets.length,
      assetsByType: {},
      assetsByAuthor: {},
      assetsByTag: {},
      averageDescriptionLength: 0,
      lastUpdated: new Date().toISOString()
    };
    
    let totalDescriptionLength = 0;
    
    for (const asset of assets) {
      // 按类型统计
      const type = asset.type || asset.assetType;
      stats.assetsByType[type] = (stats.assetsByType[type] || 0) + 1;
      
      // 按作者统计
      const author = asset.author || 'unknown';
      stats.assetsByAuthor[author] = (stats.assetsByAuthor[author] || 0) + 1;
      
      // 按标签统计
      if (asset.tags) {
        for (const tag of asset.tags) {
          stats.assetsByTag[tag] = (stats.assetsByTag[tag] || 0) + 1;
        }
      }
      
      // 描述长度统计
      if (asset.description) {
        totalDescriptionLength += asset.description.length;
      }
    }
    
    stats.averageDescriptionLength = Math.round(totalDescriptionLength / assets.length);
    
    const statsFile = path.join(this.assetsDir, 'statistics.json');
    await fs.writeFile(statsFile, JSON.stringify(stats, null, 2), 'utf-8');
    
    console.log(`✅ 统计信息已更新: ${statsFile}`);
    console.log(`📈 资产类型分布:`, stats.assetsByType);
    console.log(`👥 作者分布:`, stats.assetsByAuthor);
    console.log(`📝 平均描述长度: ${stats.averageDescriptionLength} 字符`);
  }

  async fixCommonIssues(assets) {
    console.log('\n🔧 修复常见问题...');
    
    let fixedCount = 0;
    
    for (const asset of assets) {
      let needsUpdate = false;
      const originalContent = await fs.readFile(asset.filePath, 'utf-8');
      let { metadata, body } = this.parseFrontMatter(originalContent);
      
      // 修复缺失的版本号
      if (!metadata.version) {
        metadata.version = '1.0.0';
        needsUpdate = true;
      }
      
      // 修复缺失的作者
      if (!metadata.author) {
        metadata.author = 'mantras-team';
        needsUpdate = true;
      }
      
      // 修复空标签数组
      if (!metadata.tags) {
        metadata.tags = [];
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        const newContent = this.generateMarkdownContent(metadata, body);
        await fs.writeFile(asset.filePath, newContent, 'utf-8');
        fixedCount++;
        console.log(`🔧 修复: ${asset.id}`);
      }
    }
    
    console.log(`✅ 修复了 ${fixedCount} 个资产`);
  }

  generateMarkdownContent(metadata, body) {
    const frontMatter = Object.entries(metadata)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
        } else {
          return `${key}: "${value}"`;
        }
      })
      .join('\n');
    
    return `---\n${frontMatter}\n---\n\n${body}`;
  }
}

// 运行同步工具
if (require.main === module) {
  const syncTool = new AssetSyncTool();
  syncTool.run().catch(console.error);
}

module.exports = AssetSyncTool;