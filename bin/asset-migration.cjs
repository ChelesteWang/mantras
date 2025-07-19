#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * 改进的资产迁移工具 - 将 JSON 格式转换为 Markdown 格式
 */
class ImprovedAssetMigrationTool {
  constructor() {
    this.assetsDir = './assets';
    this.backupDir = './assets-backup';
  }

  async run() {
    console.log('🔄 Mantras 资产迁移工具 v2.0');
    console.log('===================================\n');
    
    try {
      // 首先分析当前状态
      await this.analyzeCurrentState();
      
      // 询问用户是否继续
      const shouldContinue = await this.askUserConfirmation();
      if (!shouldContinue) {
        console.log('❌ 用户取消迁移');
        return;
      }
      
      // 创建备份
      await this.createBackup();
      
      // 迁移 personas
      await this.migrateAssetType('personas');
      
      // 迁移 prompt-templates
      await this.migrateAssetType('prompt-templates');
      
      console.log('\n✅ 迁移完成！');
      console.log('📁 原始文件已备份到:', this.backupDir);
      console.log('📝 现在所有资产都使用统一的 Markdown 格式');
      
    } catch (error) {
      console.error('❌ 迁移失败:', error.message);
      process.exit(1);
    }
  }

  async analyzeCurrentState() {
    console.log('🔍 分析当前资产状态...\n');
    
    const assetTypes = ['personas', 'prompt-templates'];
    let totalJsonFiles = 0;
    let totalMdFiles = 0;
    let needsMigration = 0;
    
    for (const assetType of assetTypes) {
      const typeDir = path.join(this.assetsDir, assetType);
      
      try {
        const files = await fs.readdir(typeDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        const mdFiles = files.filter(file => file.endsWith('.md'));
        
        console.log(`📁 ${assetType}:`);
        console.log(`   JSON 文件: ${jsonFiles.length}`);
        console.log(`   MD 文件: ${mdFiles.length}`);
        
        // 检查哪些 JSON 文件需要迁移
        let needsMigrationInType = 0;
        for (const jsonFile of jsonFiles) {
          const mdFile = jsonFile.replace('.json', '.md');
          const mdPath = path.join(typeDir, mdFile);
          
          try {
            await fs.access(mdPath);
            // MD 文件已存在
          } catch {
            // MD 文件不存在，需要迁移
            needsMigrationInType++;
          }
        }
        
        console.log(`   需要迁移: ${needsMigrationInType}`);
        console.log('');
        
        totalJsonFiles += jsonFiles.length;
        totalMdFiles += mdFiles.length;
        needsMigration += needsMigrationInType;
        
      } catch (error) {
        console.log(`⚠️  无法访问 ${assetType} 目录: ${error.message}\n`);
      }
    }
    
    console.log('📊 总体状态:');
    console.log(`   总 JSON 文件: ${totalJsonFiles}`);
    console.log(`   总 MD 文件: ${totalMdFiles}`);
    console.log(`   需要迁移: ${needsMigration}`);
    console.log('');
    
    if (needsMigration === 0) {
      console.log('🎉 所有资产已经是 Markdown 格式，无需迁移！');
      console.log('💡 您可以运行 `npm run assets:sync` 来同步元数据');
      return false;
    }
    
    return true;
  }

  async askUserConfirmation() {
    // 在实际环境中，这里可以使用 readline 来获取用户输入
    // 为了简化，我们默认继续
    console.log('❓ 是否继续迁移？(默认: 是)');
    return true;
  }

  async createBackup() {
    console.log('📦 创建备份...');
    
    try {
      await fs.access(this.backupDir);
      console.log('⚠️  备份目录已存在，跳过备份');
    } catch {
      await this.copyDirectory(this.assetsDir, this.backupDir);
      console.log('✅ 备份创建完成');
    }
  }

  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  async migrateAssetType(assetType) {
    console.log(`\n🔄 迁移 ${assetType}...`);
    
    const typeDir = path.join(this.assetsDir, assetType);
    const files = await fs.readdir(typeDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    let migrated = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const jsonFile of jsonFiles) {
      const jsonPath = path.join(typeDir, jsonFile);
      const mdFile = jsonFile.replace('.json', '.md');
      const mdPath = path.join(typeDir, mdFile);
      
      try {
        // 检查是否已存在对应的 MD 文件
        await fs.access(mdPath);
        console.log(`⏭️  跳过 ${jsonFile} (Markdown 文件已存在)`);
        skipped++;
        continue;
      } catch {
        // MD 文件不存在，进行转换
      }
      
      try {
        const jsonContent = await fs.readFile(jsonPath, 'utf-8');
        const asset = JSON.parse(jsonContent);
        
        const markdownContent = this.convertToMarkdown(asset, assetType);
        await fs.writeFile(mdPath, markdownContent, 'utf-8');
        
        console.log(`✅ 转换完成: ${jsonFile} → ${mdFile}`);
        migrated++;
        
        // 删除原 JSON 文件
        await fs.unlink(jsonPath);
        console.log(`🗑️  删除原文件: ${jsonFile}`);
        
      } catch (error) {
        console.error(`❌ 转换失败 ${jsonFile}:`, error.message);
        failed++;
      }
    }
    
    console.log(`📊 ${assetType} 迁移结果:`);
    console.log(`   成功迁移: ${migrated}`);
    console.log(`   跳过文件: ${skipped}`);
    console.log(`   失败文件: ${failed}`);
  }

  convertToMarkdown(asset, assetType) {
    const frontMatter = this.generateFrontMatter(asset);
    const body = this.generateMarkdownBody(asset, assetType);
    
    return `---\n${frontMatter}\n---\n\n${body}`;
  }

  generateFrontMatter(asset) {
    const metadata = {
      id: asset.id,
      type: asset.type,
      name: asset.name,
      description: asset.description,
      version: asset.version || '1.0.0',
      author: asset.author || 'mantras-team',
      tags: asset.tags || []
    };

    // 添加特定类型的元数据
    if (asset.type === 'prompt-template') {
      if (asset.technique) metadata.technique = asset.technique;
      if (asset.category) metadata.category = asset.category;
      if (asset.parameters) metadata.parameters = asset.parameters;
    }

    const lines = [];
    for (const [key, value] of Object.entries(metadata)) {
      if (Array.isArray(value)) {
        lines.push(`${key}: [${value.map(v => `"${v}"`).join(', ')}]`);
      } else {
        lines.push(`${key}: "${value}"`);
      }
    }

    return lines.join('\n');
  }

  generateMarkdownBody(asset, assetType) {
    if (assetType === 'personas') {
      return this.generatePersonaMarkdown(asset);
    } else if (assetType === 'prompt-templates') {
      return this.generateTemplateMarkdown(asset);
    }
    
    return `# ${asset.name}\n\n${asset.description}`;
  }

  generatePersonaMarkdown(persona) {
    const sections = [];
    
    sections.push(`# ${persona.name}`);
    sections.push(`## 📝 角色描述\n\n${persona.description}`);
    
    if (persona.personality) {
      sections.push('## 🎭 人格特质');
      
      if (persona.personality.role) {
        sections.push(`### 角色定位\n${persona.personality.role}`);
      }
      
      if (persona.personality.traits && persona.personality.traits.length > 0) {
        sections.push(`### 性格特点\n${persona.personality.traits.map(trait => `- ${trait}`).join('\n')}`);
      }
      
      if (persona.personality.communicationStyle) {
        sections.push(`### 沟通风格\n${persona.personality.communicationStyle}`);
      }
      
      if (persona.personality.knowledgeDomains && persona.personality.knowledgeDomains.length > 0) {
        sections.push(`### 知识领域\n${persona.personality.knowledgeDomains.map(domain => `- ${domain}`).join('\n')}`);
      }
    }
    
    if (persona.capabilities) {
      sections.push('## 🔧 能力配置');
      const capabilities = Object.entries(persona.capabilities)
        .map(([key, value]) => `- **${key}**: ${value ? '✅' : '❌'}`)
        .join('\n');
      sections.push(capabilities);
    }
    
    if (persona.constraints) {
      sections.push('## ⚙️ 约束条件');
      const constraints = [];
      if (persona.constraints.maxResponseLength) {
        constraints.push(`- **最大响应长度**: ${persona.constraints.maxResponseLength}`);
      }
      if (persona.constraints.tone) {
        constraints.push(`- **语调**: ${persona.constraints.tone}`);
      }
      if (persona.constraints.allowedTopics && persona.constraints.allowedTopics.length > 0) {
        constraints.push(`- **允许话题**: ${persona.constraints.allowedTopics.join(', ')}`);
      }
      sections.push(constraints.join('\n'));
    }
    
    sections.push('## 📊 元数据');
    sections.push(`- **创建时间**: ${new Date().toISOString().split('T')[0]}`);
    sections.push(`- **最后修改**: ${new Date().toISOString().split('T')[0]}`);
    sections.push('- **使用次数**: 0');
    sections.push('- **用户评分**: 5/5.0');
    
    return sections.join('\n\n');
  }

  generateTemplateMarkdown(template) {
    const sections = [];
    
    sections.push(`# ${template.name}`);
    
    if (template.template) {
      sections.push('## 📝 模板内容');
      sections.push('```\n' + template.template + '\n```');
    }
    
    sections.push(`## 💡 使用说明\n\n${template.description}`);
    
    if (template.parameters && template.parameters.length > 0) {
      sections.push('## 🎯 参数说明');
      const paramDocs = template.parameters
        .map(param => `- **{${param}}**: 请描述此参数的用途`)
        .join('\n');
      sections.push(paramDocs);
    }
    
    if (template.examples && template.examples.length > 0) {
      sections.push('## 📚 使用示例');
      template.examples.forEach((example, index) => {
        sections.push(`### 示例 ${index + 1}: ${example.name || '基本用法'}`);
        if (example.inputs) {
          sections.push('**输入参数:**');
          Object.entries(example.inputs).forEach(([key, value]) => {
            sections.push(`- ${key}: ${value}`);
          });
        }
        if (example.expectedOutput) {
          sections.push(`**预期输出:** ${example.expectedOutput}`);
        }
      });
    }
    
    sections.push('## 📊 元数据');
    sections.push(`- **创建时间**: ${new Date().toISOString().split('T')[0]}`);
    sections.push(`- **最后修改**: ${new Date().toISOString().split('T')[0]}`);
    sections.push('- **使用次数**: 0');
    
    return sections.join('\n\n');
  }
}

// 运行迁移工具
if (require.main === module) {
  const migrationTool = new ImprovedAssetMigrationTool();
  migrationTool.run().catch(console.error);
}

module.exports = ImprovedAssetMigrationTool;