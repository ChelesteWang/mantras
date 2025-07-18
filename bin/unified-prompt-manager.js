#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';
import { createInterface } from 'readline';
import yaml from 'js-yaml';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

class UnifiedPromptManager {
  constructor() {
    this.snippetsPath = './templates/prompt-snippets.md';
    this.templatesDir = './assets/prompt-templates';
  }

  async init() {
    console.log('🎭 Mantras 统一提示模板管理器');
    console.log('===================================\n');
    
    const action = await question(`请选择操作：
1. 📝 创建新模板 (交互式向导)
2. 🧩 从片段组合模板
3. 📄 转换格式 (JSON ↔ Markdown)
4. 🔍 浏览现有模板
5. 🌐 打开Web编辑器
6. 📊 管理片段库

请输入选项 (1-6): `);

    switch (action) {
      case '1': await this.createWithWizard(); break;
      case '2': await this.createFromSnippets(); break;
      case '3': await this.convertFormats(); break;
      case '4': await this.browseTemplates(); break;
      case '5': await this.openWebEditor(); break;
      case '6': await this.manageSnippets(); break;
      default: console.log('❌ 无效选项'); break;
    }
  }

  async createWithWizard() {
    console.log('\n📝 交互式模板创建向导');
    console.log('========================\n');

    const id = await question('模板ID (kebab-case): ');
    const name = await question('模板名称: ');
    const description = await question('模板描述: ');
    const category = await question('分类: ');
    
    // 选择创建方式
    const method = await question(`\n选择创建方式：
1. 手动输入模板内容
2. 从片段库组合
3. 基于现有模板修改

请选择 (1-3): `);

    let template = '';
    
    if (method === '1') {
      template = await this.inputTemplateManually();
    } else if (method === '2') {
      template = await this.composeFromSnippets();
    } else if (method === '3') {
      template = await this.modifyExistingTemplate();
    }

    const asset = await this.buildAssetObject(id, name, description, category, template);
    await this.saveInMultipleFormats(asset);
    
    console.log('\n✅ 模板创建完成！');
    await this.validateAndShow(id);
  }

  async createFromSnippets() {
    console.log('\n🧩 从片段库组合模板');
    console.log('===================\n');

    const snippets = await this.loadSnippets();
    console.log('可用片段：');
    Object.keys(snippets).forEach((key, index) => {
      console.log(`${index + 1}. ${key} - ${snippets[key].description || '无描述'}`);
    });

    const selectedSnippets = [];
    let selection;
    
    while ((selection = await question('\n选择片段编号 (输入0完成选择): ')) !== '0') {
      const index = parseInt(selection) - 1;
      const keys = Object.keys(snippets);
      if (index >= 0 && index < keys.length) {
        selectedSnippets.push(keys[index]);
        console.log(`✅ 已添加: ${keys[index]}`);
      }
    }

    const composedTemplate = selectedSnippets
      .map(key => snippets[key].content || snippets[key])
      .join('\n\n');

    console.log('\n📋 组合后的模板：');
    console.log('```');
    console.log(composedTemplate);
    console.log('```');

    const confirm = await question('\n是否保存此模板？ (y/n): ');
    if (confirm.toLowerCase() === 'y') {
      const id = await question('模板ID: ');
      const name = await question('模板名称: ');
      const description = await question('模板描述: ');
      const category = await question('分类: ');

      const asset = await this.buildAssetObject(id, name, description, category, composedTemplate);
      await this.saveInMultipleFormats(asset);
      console.log('✅ 模板已保存！');
    }
  }

  async convertFormats() {
    console.log('\n📄 格式转换工具');
    console.log('================\n');

    const files = await fs.readdir(this.templatesDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    const mdFiles = files.filter(f => f.endsWith('.md'));

    console.log('JSON文件：', jsonFiles.join(', '));
    console.log('Markdown文件：', mdFiles.join(', '));

    const direction = await question(`\n转换方向：
1. JSON → Markdown
2. Markdown → JSON
3. 批量转换所有JSON → Markdown
4. 批量转换所有Markdown → JSON

请选择 (1-4): `);

    switch (direction) {
      case '1':
        const jsonFile = await question('输入JSON文件名: ');
        await this.convertJsonToMarkdown(jsonFile);
        break;
      case '2':
        const mdFile = await question('输入Markdown文件名: ');
        await this.convertMarkdownToJson(mdFile);
        break;
      case '3':
        await this.batchConvertJsonToMarkdown();
        break;
      case '4':
        await this.batchConvertMarkdownToJson();
        break;
    }
  }

  async browseTemplates() {
    console.log('\n🔍 浏览现有模板');
    console.log('================\n');

    const files = await fs.readdir(this.templatesDir);
    const templates = files.filter(f => f.endsWith('.json') || f.endsWith('.md'));

    templates.forEach((file, index) => {
      console.log(`${index + 1}. ${file}`);
    });

    const selection = await question('\n选择要查看的模板编号: ');
    const index = parseInt(selection) - 1;
    
    if (index >= 0 && index < templates.length) {
      const filePath = path.join(this.templatesDir, templates[index]);
      const content = await fs.readFile(filePath, 'utf-8');
      
      console.log(`\n📄 ${templates[index]}:`);
      console.log('='.repeat(50));
      console.log(content);
      console.log('='.repeat(50));

      const action = await question(`\n操作选项：
1. 编辑此模板
2. 复制为新模板
3. 转换格式
4. 返回

请选择 (1-4): `);

      switch (action) {
        case '1': await this.editTemplate(templates[index]); break;
        case '2': await this.duplicateTemplate(templates[index]); break;
        case '3': await this.convertSingleFile(templates[index]); break;
      }
    }
  }

  async openWebEditor() {
    console.log('\n🌐 启动Web编辑器');
    console.log('================\n');
    
    const { execSync } = await import('child_process');
    try {
      console.log('正在打开Web编辑器...');
      execSync('open tools/prompt-editor.html', { stdio: 'inherit' });
      console.log('✅ Web编辑器已在浏览器中打开');
    } catch (error) {
      console.log('❌ 无法自动打开，请手动访问: tools/prompt-editor.html');
    }
  }

  async manageSnippets() {
    console.log('\n📊 片段库管理');
    console.log('==============\n');

    const action = await question(`片段库操作：
1. 查看所有片段
2. 添加新片段
3. 编辑片段
4. 删除片段
5. 导出片段库

请选择 (1-5): `);

    switch (action) {
      case '1': await this.viewSnippets(); break;
      case '2': await this.addSnippet(); break;
      case '3': await this.editSnippet(); break;
      case '4': await this.deleteSnippet(); break;
      case '5': await this.exportSnippets(); break;
    }
  }

  async loadSnippets() {
    try {
      const content = await fs.readFile(this.snippetsPath, 'utf-8');
      // 简单解析Markdown中的代码块
      const snippets = {};
      const lines = content.split('\n');
      let currentSnippet = null;
      let inCodeBlock = false;
      let snippetContent = '';

      for (const line of lines) {
        if (line.startsWith('### ') && line.includes('片段')) {
          if (currentSnippet && snippetContent) {
            snippets[currentSnippet] = snippetContent.trim();
          }
          currentSnippet = line.replace('### ', '').replace('片段', '').trim();
          snippetContent = '';
          inCodeBlock = false;
        } else if (line.startsWith('```') && currentSnippet) {
          inCodeBlock = !inCodeBlock;
        } else if (inCodeBlock && currentSnippet) {
          snippetContent += line + '\n';
        }
      }

      if (currentSnippet && snippetContent) {
        snippets[currentSnippet] = snippetContent.trim();
      }

      return snippets;
    } catch (error) {
      console.log('⚠️ 无法加载片段库，使用默认片段');
      return {
        '角色设定': '你是一位资深的 {role} 专家，拥有 {experience} 年的经验。',
        '任务描述': '请帮我 {action} 这段代码：\n\n{code}\n\n重点关注：{focus_areas}',
        '输出格式': '请按以下格式输出：\n1. 问题分析\n2. 解决方案\n3. 代码示例\n4. 注意事项'
      };
    }
  }

  async inputTemplateManually() {
    console.log('\n请输入模板内容 (使用 {参数名} 表示参数，输入 END 结束):');
    let template = '';
    let line;
    while ((line = await question('> ')) !== 'END') {
      template += line + '\n';
    }
    return template.trim();
  }

  async composeFromSnippets() {
    const snippets = await this.loadSnippets();
    const keys = Object.keys(snippets);
    
    console.log('\n可用片段：');
    keys.forEach((key, index) => {
      console.log(`${index + 1}. ${key}`);
    });

    const selected = [];
    let selection;
    
    while ((selection = await question('选择片段编号 (输入0完成): ')) !== '0') {
      const index = parseInt(selection) - 1;
      if (index >= 0 && index < keys.length) {
        selected.push(snippets[keys[index]]);
        console.log(`✅ 已添加: ${keys[index]}`);
      }
    }

    return selected.join('\n\n');
  }

  async buildAssetObject(id, name, description, category, template) {
    const paramMatches = template.match(/\{(\w+)\}/g) || [];
    const parameters = [...new Set(paramMatches.map(match => match.slice(1, -1)))];
    
    const tags = await question('标签 (逗号分隔): ');
    const difficulty = await question('难度 (beginner/intermediate/advanced): ') || 'beginner';
    const technique = id.replace(/-/g, '_');

    return {
      id,
      type: 'prompt-template',
      name,
      description,
      version: '1.0.0',
      author: 'mantras-team',
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      technique,
      template,
      parameters,
      category,
      examples: [],
      metadata: {
        created: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        usageCount: 0,
        rating: 0.0,
        difficulty
      }
    };
  }

  async saveInMultipleFormats(asset) {
    // 保存JSON格式
    const jsonPath = path.join(this.templatesDir, `${asset.id}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(asset, null, 2), 'utf-8');
    console.log(`✅ JSON已保存: ${jsonPath}`);

    // 保存Markdown格式
    const markdown = this.generateMarkdown(asset);
    const mdPath = path.join(this.templatesDir, `${asset.id}.md`);
    await fs.writeFile(mdPath, markdown, 'utf-8');
    console.log(`✅ Markdown已保存: ${mdPath}`);
  }

  generateMarkdown(asset) {
    return `---
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
difficulty: ${asset.metadata.difficulty}
rating: ${asset.metadata.rating}
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

- **创建时间**: ${asset.metadata.created}
- **最后修改**: ${asset.metadata.lastModified}
- **使用次数**: ${asset.metadata.usageCount}
- **用户评分**: ${asset.metadata.rating}/5.0
- **难度等级**: ${asset.metadata.difficulty}`;
  }

  async validateAndShow(id) {
    console.log('\n🔍 验证模板...');
    const { execSync } = await import('child_process');
    try {
      execSync('npm run assets:validate', { stdio: 'inherit' });
      console.log('✅ 验证通过！');
      
      // 显示创建的文件
      console.log('\n📁 创建的文件：');
      console.log(`- JSON: assets/prompt-templates/${id}.json`);
      console.log(`- Markdown: assets/prompt-templates/${id}.md`);
    } catch (error) {
      console.log('❌ 验证失败，请检查模板格式');
    }
  }

  async convertJsonToMarkdown(filename) {
    try {
      const jsonPath = path.join(this.templatesDir, filename);
      const content = await fs.readFile(jsonPath, 'utf-8');
      const asset = JSON.parse(content);
      
      const markdown = this.generateMarkdown(asset);
      const mdPath = path.join(this.templatesDir, filename.replace('.json', '.md'));
      await fs.writeFile(mdPath, markdown, 'utf-8');
      
      console.log(`✅ 已转换: ${filename} → ${filename.replace('.json', '.md')}`);
    } catch (error) {
      console.log(`❌ 转换失败: ${error.message}`);
    }
  }

  async batchConvertJsonToMarkdown() {
    const files = await fs.readdir(this.templatesDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    for (const file of jsonFiles) {
      await this.convertJsonToMarkdown(file);
    }
    
    console.log(`✅ 批量转换完成，共处理 ${jsonFiles.length} 个文件`);
  }
}

// 运行管理器
const manager = new UnifiedPromptManager();
manager.init().finally(() => {
  rl.close();
});