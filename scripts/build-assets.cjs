#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * 构建时资产处理器
 * 在构建过程中预处理和验证资产文件
 */
class BuildTimeAssetProcessor {
  constructor() {
    this.assetsDir = './assets';
    this.outputDir = './dist/assets';
    this.indexFile = './dist/assets/index.json';
  }

  async process() {
    console.log('🏗️  构建时资产处理器');
    console.log('===================================\n');

    try {
      // 创建输出目录
      await this.ensureOutputDirectory();
      
      // 处理资产
      const processedAssets = await this.processAssets();
      
      // 生成索引文件
      await this.generateIndex(processedAssets);
      
      // 生成类型定义
      await this.generateTypeDefinitions(processedAssets);
      
      // 验证资产完整性
      await this.validateAssets(processedAssets);
      
      console.log(`\n✅ 构建时资产处理完成！`);
      console.log(`📊 处理了 ${processedAssets.length} 个资产`);
      console.log(`📁 输出目录: ${this.outputDir}`);
      
    } catch (error) {
      console.error('❌ 构建时资产处理失败:', error.message);
      process.exit(1);
    }
  }

  async ensureOutputDirectory() {
    await fs.mkdir(this.outputDir, { recursive: true });
    console.log(`📁 创建输出目录: ${this.outputDir}`);
  }

  async processAssets() {
    console.log('🔄 处理资产文件...');
    
    const allAssets = [];
    const assetTypeDirs = ['personas', 'prompt-templates', 'prompts'];

    for (const typeDir of assetTypeDirs) {
      const dirPath = path.join(this.assetsDir, typeDir);
      
      try {
        const assets = await this.processAssetDirectory(dirPath, typeDir);
        allAssets.push(...assets);
        console.log(`✅ ${typeDir}: 处理了 ${assets.length} 个资产`);
      } catch (error) {
        console.warn(`⚠️  跳过 ${typeDir}: ${error.message}`);
      }
    }

    return allAssets;
  }

  async processAssetDirectory(dirPath, assetType) {
    const files = await fs.readdir(dirPath);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    const processedAssets = [];

    for (const mdFile of markdownFiles) {
      const filePath = path.join(dirPath, mdFile);
      
      try {
        const asset = await this.processMarkdownFile(filePath);
        
        // 添加构建时元数据
        asset.buildInfo = {
          processedAt: new Date().toISOString(),
          sourceFile: path.relative(this.assetsDir, filePath),
          assetType: assetType
        };
        
        processedAssets.push(asset);
        
      } catch (error) {
        console.warn(`⚠️  跳过 ${mdFile}: ${error.message}`);
      }
    }

    return processedAssets;
  }

  async processMarkdownFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const { metadata, body } = this.parseFrontMatter(content);
    
    // 从文件名推断 ID
    if (!metadata.id) {
      metadata.id = path.basename(filePath, '.md');
    }
    
    // 解析 Markdown 内容
    const markdownData = this.parseMarkdownContent(body, metadata);
    
    // 合并数据
    const asset = { ...metadata, ...markdownData };
    
    // 验证必需字段
    this.validateAsset(asset);
    
    return asset;
  }

  parseFrontMatter(content) {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);
    
    if (!match) {
      throw new Error('缺少 Front Matter');
    }
    
    const [, frontMatter, body] = match;
    const metadata = {};
    
    // 解析 YAML
    const lines = frontMatter.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = trimmed.substring(0, colonIndex).trim();
      let value = trimmed.substring(colonIndex + 1).trim();
      
      // 处理数组
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

  parseMarkdownContent(body, metadata) {
    const result = {};
    
    if (metadata.type === 'persona') {
      result.personality = this.parsePersonaContent(body);
    } else if (metadata.type === 'prompt-template') {
      result.template = this.parseTemplateContent(body);
      result.examples = this.parseExamples(body);
    }
    
    return result;
  }

  parsePersonaContent(body) {
    const personality = {
      role: '',
      traits: [],
      communicationStyle: '',
      knowledgeDomains: []
    };
    
    // 提取角色定位
    const roleMatch = body.match(/### 角色定位\s*\n([^\n]+)/);
    if (roleMatch) personality.role = roleMatch[1].trim();
    
    // 提取性格特点
    const traitsMatch = body.match(/### 性格特点\s*\n((?:- [^\n]+\n?)+)/);
    if (traitsMatch) {
      personality.traits = traitsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim());
    }
    
    // 提取沟通风格
    const styleMatch = body.match(/### 沟通风格\s*\n([^\n]+)/);
    if (styleMatch) personality.communicationStyle = styleMatch[1].trim();
    
    // 提取知识领域
    const domainsMatch = body.match(/### 知识领域\s*\n((?:- [^\n]+\n?)+)/);
    if (domainsMatch) {
      personality.knowledgeDomains = domainsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim());
    }
    
    return personality;
  }

  parseTemplateContent(body) {
    const templateMatch = body.match(/```\s*\n([\s\S]*?)\n```/);
    return templateMatch ? templateMatch[1].trim() : '';
  }

  parseExamples(body) {
    // 简化的示例解析
    return [];
  }

  validateAsset(asset) {
    const requiredFields = ['id', 'type', 'name', 'description'];
    
    for (const field of requiredFields) {
      if (!asset[field]) {
        throw new Error(`缺少必需字段: ${field}`);
      }
    }
    
    // 验证资产类型
    const validTypes = ['persona', 'prompt-template', 'prompt', 'tool'];
    if (!validTypes.includes(asset.type)) {
      throw new Error(`无效的资产类型: ${asset.type}`);
    }
  }

  async generateIndex(assets) {
    console.log('\n📋 生成资产索引...');
    
    const index = {
      version: '2.0.0',
      generatedAt: new Date().toISOString(),
      buildInfo: {
        totalAssets: assets.length,
        assetsByType: {},
        assetsByTag: {}
      },
      assets: {}
    };
    
    // 统计和索引
    for (const asset of assets) {
      // 按类型统计
      index.buildInfo.assetsByType[asset.type] = 
        (index.buildInfo.assetsByType[asset.type] || 0) + 1;
      
      // 按标签统计
      if (asset.tags) {
        for (const tag of asset.tags) {
          index.buildInfo.assetsByTag[tag] = 
            (index.buildInfo.assetsByTag[tag] || 0) + 1;
        }
      }
      
      // 添加到索引
      index.assets[asset.id] = {
        type: asset.type,
        name: asset.name,
        description: asset.description,
        version: asset.version,
        author: asset.author,
        tags: asset.tags || [],
        buildInfo: asset.buildInfo
      };
    }
    
    // 保存索引文件
    await fs.writeFile(this.indexFile, JSON.stringify(index, null, 2), 'utf-8');
    console.log(`✅ 索引文件已生成: ${this.indexFile}`);
    
    // 保存完整资产数据
    const assetsFile = path.join(this.outputDir, 'assets.json');
    await fs.writeFile(assetsFile, JSON.stringify(assets, null, 2), 'utf-8');
    console.log(`✅ 资产数据已生成: ${assetsFile}`);
  }

  async generateTypeDefinitions(assets) {
    console.log('📝 生成类型定义...');
    
    const typesByCategory = {};
    assets.forEach(asset => {
      if (!typesByCategory[asset.type]) {
        typesByCategory[asset.type] = [];
      }
      typesByCategory[asset.type].push(asset.id);
    });
    
    const typeDefinitions = `// 自动生成的资产类型定义
// 生成时间: ${new Date().toISOString()}

export interface BuildTimeAssetIndex {
  version: string;
  generatedAt: string;
  buildInfo: {
    totalAssets: number;
    assetsByType: Record<string, number>;
    assetsByTag: Record<string, number>;
  };
  assets: Record<string, {
    type: string;
    name: string;
    description: string;
    version?: string;
    author?: string;
    tags: string[];
    buildInfo: {
      processedAt: string;
      sourceFile: string;
      assetType: string;
    };
  }>;
}

// 资产 ID 常量
export const ASSET_IDS = {
${Object.entries(typesByCategory).map(([type, ids]) => 
  `  ${type.toUpperCase().replace('-', '_')}: {\n${ids.map(id => 
    `    ${id.toUpperCase().replace('-', '_')}: '${id}'`
  ).join(',\n')}\n  }`
).join(',\n')}
} as const;

// 资产类型常量
export const ASSET_TYPES = {
${Object.keys(typesByCategory).map(type => 
  `  ${type.toUpperCase().replace('-', '_')}: '${type}'`
).join(',\n')}
} as const;
`;
    
    const typeDefsFile = path.join(this.outputDir, 'types.ts');
    await fs.writeFile(typeDefsFile, typeDefinitions, 'utf-8');
    console.log(`✅ 类型定义已生成: ${typeDefsFile}`);
  }

  async validateAssets(assets) {
    console.log('🔍 验证资产完整性...');
    
    const errors = [];
    const warnings = [];
    const idSet = new Set();
    
    for (const asset of assets) {
      // ID 唯一性检查
      if (idSet.has(asset.id)) {
        errors.push(`重复的资产 ID: ${asset.id}`);
      }
      idSet.add(asset.id);
      
      // 版本格式检查
      if (asset.version && !/^\d+\.\d+\.\d+$/.test(asset.version)) {
        warnings.push(`${asset.id}: 版本格式不规范 '${asset.version}'`);
      }
      
      // 描述长度检查
      if (asset.description && asset.description.length < 10) {
        warnings.push(`${asset.id}: 描述过短`);
      }
    }
    
    if (errors.length > 0) {
      console.error('❌ 发现错误:');
      errors.forEach(error => console.error(`  - ${error}`));
      throw new Error(`资产验证失败: ${errors.length} 个错误`);
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️  发现警告:');
      warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
    
    console.log(`✅ 资产验证通过 (${warnings.length} 个警告)`);
  }
}

// 运行处理器
if (require.main === module) {
  const processor = new BuildTimeAssetProcessor();
  processor.process().catch(console.error);
}

module.exports = BuildTimeAssetProcessor;