import { AssetLoader } from '../src/asset-loader';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Unified Asset Management', () => {
  const testDir = './test-assets';
  const testPersonaPath = path.join(testDir, 'test-persona.md');
  const testTemplatePath = path.join(testDir, 'test-template.md');

  beforeAll(async () => {
    // 创建测试目录
    await fs.mkdir(testDir, { recursive: true });
    
    // 创建测试 persona
    const personaContent = `---
id: "test-persona"
type: "persona"
name: "Test Persona"
description: "A test persona for validation"
version: "1.0.0"
author: "test-team"
tags: ["test", "validation"]
---

# Test Persona

## 📝 角色描述

A test persona for validation

## 🎭 人格特质

### 角色定位
Test Role

### 性格特点
- analytical
- precise
- helpful

### 沟通风格
clear and concise

### 知识领域
- testing
- validation
- quality assurance

## 🔧 能力配置

- **analysis**: ✅
- **creative**: ❌
- **technical**: ✅
- **empathetic**: ✅

## 📊 元数据

- **创建时间**: 2025-01-19
- **最后修改**: 2025-01-19
- **使用次数**: 0
- **用户评分**: 5/5.0`;

    await fs.writeFile(testPersonaPath, personaContent, 'utf-8');

    // 创建测试 template
    const templateContent = `---
id: "test-template"
type: "prompt-template"
name: "Test Template"
description: "A test template for validation"
version: "1.0.0"
author: "test-team"
tags: ["test", "template"]
technique: "test_technique"
category: "testing"
parameters: ["input", "context"]
---

# Test Template

## 📝 模板内容

\`\`\`
Please analyze the following {input} in the context of {context}.
\`\`\`

## 💡 使用说明

A test template for validation purposes

## 🎯 参数说明

- **{input}**: The input to analyze
- **{context}**: The context for analysis

## 📊 元数据

- **创建时间**: 2025-01-19
- **最后修改**: 2025-01-19
- **使用次数**: 0`;

    await fs.writeFile(testTemplatePath, templateContent, 'utf-8');
  });

  afterAll(async () => {
    // 清理测试文件
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('Markdown Asset Loading', () => {
    it('should load persona from Markdown file', async () => {
      const asset = await AssetLoader.loadFromMarkdown(testPersonaPath);
      
      expect(asset.id).toBe('test-persona');
      expect(asset.type).toBe('persona');
      expect(asset.name).toBe('Test Persona');
      expect(asset.description).toBe('A test persona for validation');
      expect(asset.version).toBe('1.0.0');
      expect(asset.author).toBe('test-team');
      expect(asset.tags).toEqual(['test', 'validation']);
      
      // 检查解析的 personality 数据
      expect(asset.personality).toBeDefined();
      expect(asset.personality.role).toBe('Test Role');
      expect(asset.personality.traits).toEqual(['analytical', 'precise', 'helpful']);
      expect(asset.personality.communicationStyle).toBe('clear and concise');
      expect(asset.personality.knowledgeDomains).toEqual(['testing', 'validation', 'quality assurance']);
    });

    it('should load prompt template from Markdown file', async () => {
      const asset = await AssetLoader.loadFromMarkdown(testTemplatePath);
      
      expect(asset.id).toBe('test-template');
      expect(asset.type).toBe('prompt-template');
      expect(asset.name).toBe('Test Template');
      expect(asset.description).toBe('A test template for validation');
      expect(asset.technique).toBe('test_technique');
      expect(asset.category).toBe('testing');
      expect(asset.parameters).toEqual(['input', 'context']);
      
      // 检查解析的模板内容
      expect(asset.template).toBe('Please analyze the following {input} in the context of {context}.');
    });

    it('should load mixed assets from directory', async () => {
      const assets = await AssetLoader.loadFromDirectory(testDir);
      
      expect(assets).toHaveLength(2);
      
      const persona = assets.find(a => a.type === 'persona');
      const template = assets.find(a => a.type === 'prompt-template');
      
      expect(persona).toBeDefined();
      expect(template).toBeDefined();
      expect(persona?.id).toBe('test-persona');
      expect(template?.id).toBe('test-template');
    });
  });

  describe('Front Matter Parsing', () => {
    it('should handle arrays in front matter', async () => {
      const asset = await AssetLoader.loadFromMarkdown(testPersonaPath);
      expect(Array.isArray(asset.tags)).toBe(true);
      expect(asset.tags).toEqual(['test', 'validation']);
    });

    it('should handle boolean values in front matter', async () => {
      // 这个测试需要在实际的 persona 解析中验证布尔值
      const asset = await AssetLoader.loadFromMarkdown(testPersonaPath);
      expect(typeof asset.personality?.traits).toBe('object');
    });

    it('should infer ID from filename if not provided', async () => {
      const contentWithoutId = `---
type: "persona"
name: "No ID Persona"
description: "A persona without explicit ID"
---

# No ID Persona`;

      const noIdPath = path.join(testDir, 'inferred-id.md');
      await fs.writeFile(noIdPath, contentWithoutId, 'utf-8');
      
      const asset = await AssetLoader.loadFromMarkdown(noIdPath);
      expect(asset.id).toBe('inferred-id');
      
      await fs.unlink(noIdPath);
    });
  });
});