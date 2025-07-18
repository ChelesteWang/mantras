#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 资产同步工具 - 确保所有资产都有JSON和Markdown两种格式
 */
class AssetSyncTool {
  constructor() {
    this.templatesDir = './assets/prompt-templates';
    this.personasDir = './assets/personas';
    this.promptsDir = './assets/prompts';
  }

  async syncAllAssets() {
    console.log('🔄 开始同步资产格式...\n');

    // 同步提示模板
    await this.syncPromptTemplates();
    
    // 同步人格资产
    await this.syncPersonas();
    
    // 同步提示资产
    await this.syncPrompts();

    console.log('\n✅ 资产同步完成！');
  }

  async syncPromptTemplates() {
    console.log('📝 同步提示模板...');
    
    const files = await fs.readdir(this.templatesDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    for (const jsonFile of jsonFiles) {
      const baseName = jsonFile.replace('.json', '');
      const mdFile = `${baseName}.md`;
      const jsonPath = path.join(this.templatesDir, jsonFile);
      const mdPath = path.join(this.templatesDir, mdFile);
      
      // 检查是否已有Markdown文件
      try {
        await fs.access(mdPath);
        console.log(`  ✅ ${baseName} - 已有双格式`);
      } catch {
        // 创建Markdown文件
        await this.createMarkdownFromJson(jsonPath, mdPath);
        console.log(`  ➕ ${baseName} - 已创建Markdown`);
      }
    }
  }

  async syncPersonas() {
    console.log('🎭 同步人格资产...');
    
    const files = await fs.readdir(this.personasDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    for (const jsonFile of jsonFiles) {
      const baseName = jsonFile.replace('.json', '');
      const mdFile = `${baseName}.md`;
      const jsonPath = path.join(this.personasDir, jsonFile);
      const mdPath = path.join(this.personasDir, mdFile);
      
      // 检查是否已有Markdown文件
      try {
        await fs.access(mdPath);
        console.log(`  ✅ ${baseName} - 已有双格式`);
      } catch {
        // 创建Markdown文件
        await this.createPersonaMarkdown(jsonPath, mdPath);
        console.log(`  ➕ ${baseName} - 已创建Markdown`);
      }
    }
  }

  async syncPrompts() {
    console.log('💬 同步提示资产...');
    
    const files = await fs.readdir(this.promptsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    for (const jsonFile of jsonFiles) {
      const baseName = jsonFile.replace('.json', '');
      const mdFile = `${baseName}.md`;
      const jsonPath = path.join(this.promptsDir, jsonFile);
      const mdPath = path.join(this.promptsDir, mdFile);
      
      // 检查是否已有Markdown文件
      try {
        await fs.access(mdPath);
        console.log(`  ✅ ${baseName} - 已有双格式`);
      } catch {
        // 创建Markdown文件
        await this.createPromptMarkdown(jsonPath, mdPath);
        console.log(`  ➕ ${baseName} - 已创建Markdown`);
      }
    }
  }

  async createMarkdownFromJson(jsonPath, mdPath) {
    const content = await fs.readFile(jsonPath, 'utf-8');
    const asset = JSON.parse(content);
    
    const markdown = `---
id: ${asset.id}
type: ${asset.type}
name: ${asset.name}
description: ${asset.description}
version: ${asset.version}
author: ${asset.author}
tags: [${asset.tags.join(', ')}]
technique: ${asset.technique}
category: ${asset.category}
parameters: [${asset.parameters.join(', ')}]
difficulty: ${asset.metadata?.difficulty || 'beginner'}
rating: ${asset.metadata?.rating || 0.0}
---

# ${asset.name}

## 📝 模板内容

\`\`\`
${asset.template}
\`\`\`

## 💡 使用说明

${asset.description}

## 🎯 参数说明

${asset.parameters.map(param => `- **{${param}}**: 请描述此参数的用途`).join('\n')}

## 📊 元数据

- **创建时间**: ${asset.metadata?.created || '2025-01-18'}
- **最后修改**: ${asset.metadata?.lastModified || '2025-01-18'}
- **使用次数**: ${asset.metadata?.usageCount || 0}
- **用户评分**: ${asset.metadata?.rating || 0.0}/5.0
- **难度等级**: ${asset.metadata?.difficulty || 'beginner'}`;

    await fs.writeFile(mdPath, markdown, 'utf-8');
  }

  async createPersonaMarkdown(jsonPath, mdPath) {
    const content = await fs.readFile(jsonPath, 'utf-8');
    const asset = JSON.parse(content);
    
    const markdown = `---
id: ${asset.id}
type: ${asset.type}
name: ${asset.name}
description: ${asset.description}
version: ${asset.version}
author: ${asset.author}
tags: [${asset.tags.join(', ')}]
---

# ${asset.name}

## 📝 角色描述

${asset.description}

## 🎭 人格特质

### 角色定位
${asset.personality?.role || '专业角色'}

### 性格特点
${asset.personality?.traits?.map(trait => `- ${trait}`).join('\n') || '- 专业\n- 可靠'}

### 沟通风格
${asset.personality?.communicationStyle || '清晰专业的沟通方式'}

### 知识领域
${asset.personality?.knowledgeDomains?.map(domain => `- ${domain}`).join('\n') || '- 专业领域知识'}

## 🔧 能力配置

${Object.entries(asset.capabilities || {}).map(([key, value]) => 
  `- **${key}**: ${value ? '✅' : '❌'}`
).join('\n')}

## 📊 元数据

- **创建时间**: ${asset.metadata?.created || '2025-01-18'}
- **最后修改**: ${asset.metadata?.lastModified || '2025-01-18'}
- **使用次数**: ${asset.metadata?.usageCount || 0}
- **用户评分**: ${asset.metadata?.rating || 0.0}/5.0`;

    await fs.writeFile(mdPath, markdown, 'utf-8');
  }

  async createPromptMarkdown(jsonPath, mdPath) {
    const content = await fs.readFile(jsonPath, 'utf-8');
    const asset = JSON.parse(content);
    
    const markdown = `---
id: ${asset.id}
type: ${asset.type}
name: ${asset.name}
description: ${asset.description}
version: ${asset.version}
author: ${asset.author}
tags: [${asset.tags.join(', ')}]
---

# ${asset.name}

## 📝 提示内容

\`\`\`
${asset.content || asset.template || '提示内容'}
\`\`\`

## 💡 使用说明

${asset.description}

## 📊 元数据

- **创建时间**: ${asset.metadata?.created || '2025-01-18'}
- **最后修改**: ${asset.metadata?.lastModified || '2025-01-18'}
- **使用次数**: ${asset.metadata?.usageCount || 0}
- **用户评分**: ${asset.metadata?.rating || 0.0}/5.0`;

    await fs.writeFile(mdPath, markdown, 'utf-8');
  }

  async updateMetadata() {
    console.log('\n🔄 更新资产元数据...');
    
    const directories = [
      { dir: this.templatesDir, type: 'prompt-template' },
      { dir: this.personasDir, type: 'persona' },
      { dir: this.promptsDir, type: 'prompt' }
    ];

    for (const { dir, type } of directories) {
      const files = await fs.readdir(dir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      for (const jsonFile of jsonFiles) {
        const filePath = path.join(dir, jsonFile);
        const content = await fs.readFile(filePath, 'utf-8');
        const asset = JSON.parse(content);
        
        // 确保有完整的元数据
        if (!asset.metadata) {
          asset.metadata = {};
        }
        
        if (!asset.metadata.created) {
          asset.metadata.created = '2025-01-18';
        }
        
        if (!asset.metadata.lastModified) {
          asset.metadata.lastModified = '2025-01-18';
        }
        
        if (asset.metadata.usageCount === undefined) {
          asset.metadata.usageCount = 0;
        }
        
        if (asset.metadata.rating === undefined) {
          asset.metadata.rating = 0.0;
        }
        
        if (type === 'prompt-template' && !asset.metadata.difficulty) {
          asset.metadata.difficulty = 'beginner';
        }
        
        // 写回文件
        await fs.writeFile(filePath, JSON.stringify(asset, null, 2), 'utf-8');
      }
    }
    
    console.log('✅ 元数据更新完成');
  }
}

// 运行同步
const syncTool = new AssetSyncTool();
await syncTool.syncAllAssets();
await syncTool.updateMetadata();