#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createPromptTemplate() {
  console.log('🎭 Mantras 提示模板创建向导');
  console.log('================================\n');

  try {
    // 基础信息
    const id = await question('📝 模板ID (kebab-case): ');
    const name = await question('📝 模板名称: ');
    const description = await question('📝 模板描述: ');
    const category = await question('📝 分类 (debugging/refactoring/architecture/etc): ');
    const technique = await question('📝 技术名称 (snake_case): ');
    
    console.log('\n📋 现在输入模板内容 (使用 {参数名} 表示参数，输入 END 结束):');
    let template = '';
    let line;
    while ((line = await question('> ')) !== 'END') {
      template += line + '\n';
    }
    
    // 提取参数
    const paramMatches = template.match(/\{(\w+)\}/g) || [];
    const parameters = [...new Set(paramMatches.map(match => match.slice(1, -1)))];
    
    console.log(`\n🔧 检测到参数: ${parameters.join(', ')}`);
    
    // 添加示例
    const examples = [];
    const addExample = await question('\n💡 是否添加使用示例? (y/n): ');
    
    if (addExample.toLowerCase() === 'y') {
      const exampleName = await question('示例名称: ');
      const inputs = {};
      
      for (const param of parameters) {
        inputs[param] = await question(`${param} 的示例值: `);
      }
      
      const expectedOutput = await question('期望输出描述: ');
      
      examples.push({
        name: exampleName,
        inputs,
        expectedOutput
      });
    }
    
    // 元数据
    const tags = (await question('🏷️  标签 (逗号分隔): ')).split(',').map(tag => tag.trim());
    const difficulty = await question('🎯 难度 (beginner/intermediate/advanced): ') || 'beginner';
    
    // 生成资产对象
    const asset = {
      id,
      type: 'prompt-template',
      name,
      description,
      version: '1.0.0',
      author: 'mantras-team',
      tags,
      technique,
      template: template.trim(),
      parameters,
      category,
      examples,
      metadata: {
        created: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        usageCount: 0,
        rating: 0.0,
        difficulty
      }
    };
    
    // 保存文件
    const jsonPath = `./assets/prompt-templates/${id}.json`;
    const mdPath = `./assets/prompt-templates/${id}.md`;
    
    await fs.writeFile(jsonPath, JSON.stringify(asset, null, 2), 'utf-8');
    
    // 生成Markdown版本
    const markdown = generateMarkdown(asset);
    await fs.writeFile(mdPath, markdown, 'utf-8');
    
    console.log(`\n✅ 模板创建成功!`);
    console.log(`📄 JSON: ${jsonPath}`);
    console.log(`📝 Markdown: ${mdPath}`);
    
    // 验证
    console.log('\n🔍 正在验证...');
    const { execSync } = await import('child_process');
    try {
      execSync('npm run assets:validate', { stdio: 'inherit' });
      console.log('✅ 验证通过!');
    } catch (error) {
      console.log('❌ 验证失败，请检查格式');
    }
    
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
  } finally {
    rl.close();
  }
}

function generateMarkdown(asset) {
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

## 🎯 使用示例

${asset.examples.map((example, index) => `
### 示例${index + 1}：${example.name}
**输入参数**：
${Object.entries(example.inputs).map(([key, value]) => `- \`${key}\`: "${value}"`).join('\n')}

**期望输出**：
${example.expectedOutput}
`).join('\n')}

## 📊 元数据

- **创建时间**：${asset.metadata.created}
- **最后修改**：${asset.metadata.lastModified}
- **使用次数**：${asset.metadata.usageCount}
- **用户评分**：${asset.metadata.rating}/5.0
- **难度等级**：${asset.metadata.difficulty}`;
}

// 运行创建向导
createPromptTemplate();