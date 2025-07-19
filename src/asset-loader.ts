import { Asset, AssetType } from './types';
import { AssetFactory } from './asset-factory';
import { logger } from './logger';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 资产加载器 - 负责从不同来源加载资产
 */
export class AssetLoader {
  /**
   * 解析 Markdown Front Matter
   */
  private static parseFrontMatter(content: string): { metadata: any; body: string } {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);
    
    if (!match) {
      throw new Error('Invalid Markdown format: Front Matter not found');
    }
    
    const [, frontMatter, body] = match;
    const metadata: any = {};
    
    // 简单的 YAML 解析（支持基本格式）
    const lines = frontMatter.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = trimmed.substring(0, colonIndex).trim();
      let value: any = trimmed.substring(colonIndex + 1).trim();
      
      // 处理数组格式 [item1, item2, item3]
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map((item: string) => item.trim().replace(/['"]/g, ''));
      } else {
        // 移除引号
        value = value.replace(/^['"]|['"]$/g, '');
        // 处理布尔值
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        // 处理数字
        else if (!isNaN(Number(value)) && value !== '') value = Number(value);
      }
      
      metadata[key] = value;
    }
    
    return { metadata, body };
  }

  /**
   * 从 Markdown 文件加载单个资产
   */
  static async loadFromMarkdown(filePath: string): Promise<Asset> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { metadata, body } = this.parseFrontMatter(content);
      
      // 从文件名推断 ID（如果 metadata 中没有）
      if (!metadata.id) {
        metadata.id = path.basename(filePath, '.md');
      }
      
      // 解析 Markdown 内容以提取额外信息
      const markdownData = this.parseMarkdownContent(body, metadata);
      
      // 合并 metadata 和从 markdown 解析的数据
      const assetData = { ...metadata, ...markdownData };
      
      return AssetFactory.fromRawData(assetData);
    } catch (error) {
      logger.error(`Failed to load asset from Markdown file ${filePath}:`, 
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 解析 Markdown 内容以提取结构化数据
   */
  private static parseMarkdownContent(body: string, metadata: any): any {
    const result: any = {};
    
    // 根据资产类型解析不同的内容
    if (metadata.type === 'persona') {
      result.personality = this.parsePersonaContent(body);
    } else if (metadata.type === 'prompt-template') {
      result.template = this.parseTemplateContent(body);
      result.examples = this.parseExamples(body);
    }
    
    return result;
  }

  /**
   * 解析 Persona 的 Markdown 内容
   */
  private static parsePersonaContent(body: string): any {
    const personality: any = {
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

  /**
   * 解析模板内容
   */
  private static parseTemplateContent(body: string): string {
    const templateMatch = body.match(/```\s*\n([\s\S]*?)\n```/);
    return templateMatch ? templateMatch[1].trim() : '';
  }

  /**
   * 解析示例
   */
  private static parseExamples(body: string): any[] {
    // 这里可以根据需要实现更复杂的示例解析逻辑
    return [];
  }

  /**
   * 从JSON文件加载资产
   */
  static async loadFromFile(filePath: string): Promise<Asset[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (!Array.isArray(data)) {
        throw new Error('Asset file must contain an array of assets');
      }

      return data.map(item => AssetFactory.fromRawData(item));
    } catch (error) {
      logger.error(`Failed to load assets from file ${filePath}:`, 
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 从目录加载资产（支持 JSON 和 Markdown 文件）
   */
  static async loadFromDirectory(dirPath: string): Promise<Asset[]> {
    try {
      const files = await fs.readdir(dirPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      const markdownFiles = files.filter(file => file.endsWith('.md'));
      
      const allAssets: Asset[] = [];
      
      // 加载 JSON 文件
      for (const file of jsonFiles) {
        const filePath = path.join(dirPath, file);
        try {
          const assets = await this.loadFromFile(filePath);
          allAssets.push(...assets);
          logger.info(`Loaded ${assets.length} assets from JSON file ${file}`);
        } catch (error) {
          logger.warn(`Failed to load assets from JSON file ${file}, skipping...`);
        }
      }

      // 加载 Markdown 文件
      for (const file of markdownFiles) {
        const filePath = path.join(dirPath, file);
        try {
          const asset = await this.loadFromMarkdown(filePath);
          allAssets.push(asset);
          logger.info(`Loaded asset from Markdown file ${file}`);
        } catch (error) {
          logger.warn(`Failed to load asset from Markdown file ${file}, skipping...`);
        }
      }

      return allAssets;
    } catch (error) {
      logger.error(`Failed to load assets from directory ${dirPath}:`,
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 从URL加载资产
   */
  static async loadFromUrl(url: string): Promise<Asset[]> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Remote asset source must return an array of assets');
      }

      return data.map(item => AssetFactory.fromRawData(item));
    } catch (error) {
      logger.error(`Failed to load assets from URL ${url}:`,
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 验证并过滤资产
   */
  static validateAndFilter(assets: Asset[]): Asset[] {
    const validAssets: Asset[] = [];
    const errors: string[] = [];

    for (const asset of assets) {
      const validation = AssetFactory.validateAsset(asset);
      if (validation.valid) {
        validAssets.push(asset);
      } else {
        errors.push(`Asset ${asset.id || 'unknown'}: ${validation.errors.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      logger.warn(`Found ${errors.length} invalid assets:`, errors);
    }

    logger.info(`Validated ${validAssets.length} assets successfully`);
    return validAssets;
  }
}

/**
 * 资产序列化器 - 负责将资产保存到不同格式
 */
export class AssetSerializer {
  /**
   * 将单个资产保存为 Markdown 文件
   */
  static async saveAssetToMarkdown(asset: Asset, filePath: string): Promise<void> {
    try {
      const markdownContent = this.assetToMarkdown(asset);
      await fs.writeFile(filePath, markdownContent, 'utf-8');
      logger.info(`Saved asset ${asset.id} to Markdown file ${filePath}`);
    } catch (error) {
      logger.error(`Failed to save asset to Markdown file ${filePath}:`,
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 将资产转换为 Markdown 格式
   */
  private static assetToMarkdown(asset: Asset): string {
    const frontMatter = this.generateFrontMatter(asset);
    const body = this.generateMarkdownBody(asset);
    
    return `---\n${frontMatter}\n---\n\n${body}`;
  }

  /**
   * 生成 Front Matter
   */
  private static generateFrontMatter(asset: Asset): string {
    const metadata: any = {
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
      const template = asset as any;
      if (template.technique) metadata.technique = template.technique;
      if (template.category) metadata.category = template.category;
      if (template.parameters) metadata.parameters = template.parameters;
    }

    const lines: string[] = [];
    for (const [key, value] of Object.entries(metadata)) {
      if (Array.isArray(value)) {
        lines.push(`${key}: [${value.map(v => `"${v}"`).join(', ')}]`);
      } else {
        lines.push(`${key}: "${value}"`);
      }
    }

    return lines.join('\n');
  }

  /**
   * 生成 Markdown 主体内容
   */
  private static generateMarkdownBody(asset: Asset): string {
    if (asset.type === 'persona') {
      return this.generatePersonaMarkdown(asset as any);
    } else if (asset.type === 'prompt-template') {
      return this.generateTemplateMarkdown(asset as any);
    }
    
    return `# ${asset.name}\n\n${asset.description}`;
  }

  /**
   * 生成 Persona 的 Markdown 内容
   */
  private static generatePersonaMarkdown(persona: any): string {
    const sections: string[] = [];
    
    sections.push(`# ${persona.name}`);
    sections.push(`## 📝 角色描述\n\n${persona.description}`);
    
    if (persona.personality) {
      sections.push('## 🎭 人格特质');
      
      if (persona.personality.role) {
        sections.push(`### 角色定位\n${persona.personality.role}`);
      }
      
      if (persona.personality.traits && persona.personality.traits.length > 0) {
        sections.push(`### 性格特点\n${persona.personality.traits.map((trait: string) => `- ${trait}`).join('\n')}`);
      }
      
      if (persona.personality.communicationStyle) {
        sections.push(`### 沟通风格\n${persona.personality.communicationStyle}`);
      }
      
      if (persona.personality.knowledgeDomains && persona.personality.knowledgeDomains.length > 0) {
        sections.push(`### 知识领域\n${persona.personality.knowledgeDomains.map((domain: string) => `- ${domain}`).join('\n')}`);
      }
    }
    
    if (persona.capabilities) {
      sections.push('## 🔧 能力配置');
      const capabilities = Object.entries(persona.capabilities)
        .map(([key, value]) => `- **${key}**: ${value ? '✅' : '❌'}`)
        .join('\n');
      sections.push(capabilities);
    }
    
    sections.push('## 📊 元数据');
    sections.push(`- **创建时间**: ${new Date().toISOString().split('T')[0]}`);
    sections.push(`- **最后修改**: ${new Date().toISOString().split('T')[0]}`);
    sections.push('- **使用次数**: 0');
    sections.push('- **用户评分**: 5/5.0');
    
    return sections.join('\n\n');
  }

  /**
   * 生成模板的 Markdown 内容
   */
  private static generateTemplateMarkdown(template: any): string {
    const sections: string[] = [];
    
    sections.push(`# ${template.name}`);
    
    if (template.template) {
      sections.push('## 📝 模板内容');
      sections.push('```\n' + template.template + '\n```');
    }
    
    sections.push(`## 💡 使用说明\n\n${template.description}`);
    
    if (template.parameters && template.parameters.length > 0) {
      sections.push('## 🎯 参数说明');
      const paramDocs = template.parameters
        .map((param: string) => `- **{${param}}**: 请描述此参数的用途`)
        .join('\n');
      sections.push(paramDocs);
    }
    
    sections.push('## 📊 元数据');
    sections.push(`- **创建时间**: ${new Date().toISOString().split('T')[0]}`);
    sections.push(`- **最后修改**: ${new Date().toISOString().split('T')[0]}`);
    sections.push('- **使用次数**: 0');
    
    return sections.join('\n\n');
  }

  /**
   * 将资产保存为JSON文件
   */
  static async saveToFile(assets: Asset[], filePath: string): Promise<void> {
    try {
      const content = JSON.stringify(assets, null, 2);
      await fs.writeFile(filePath, content, 'utf-8');
      logger.info(`Saved ${assets.length} assets to ${filePath}`);
    } catch (error) {
      logger.error(`Failed to save assets to file ${filePath}:`,
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 按类型分组保存资产
   */
  static async saveByType(assets: Asset[], outputDir: string): Promise<void> {
    try {
      // 确保输出目录存在
      await fs.mkdir(outputDir, { recursive: true });

      // 按类型分组
      const assetsByType = new Map<AssetType, Asset[]>();
      for (const asset of assets) {
        if (!assetsByType.has(asset.type)) {
          assetsByType.set(asset.type, []);
        }
        assetsByType.get(asset.type)!.push(asset);
      }

      // 保存每个类型到单独文件
      for (const [type, typeAssets] of assetsByType) {
        const fileName = `${type}s.json`;
        const filePath = path.join(outputDir, fileName);
        await this.saveToFile(typeAssets, filePath);
      }

      logger.info(`Saved assets by type to directory ${outputDir}`);
    } catch (error) {
      logger.error(`Failed to save assets by type:`,
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 导出资产为TypeScript定义
   */
  static generateTypeScriptDefinitions(assets: Asset[]): string {
    const lines: string[] = [];
    lines.push('// Auto-generated asset definitions');
    lines.push('import { Asset } from "./types";');
    lines.push('');

    // 按类型分组
    const assetsByType = new Map<AssetType, Asset[]>();
    for (const asset of assets) {
      if (!assetsByType.has(asset.type)) {
        assetsByType.set(asset.type, []);
      }
      assetsByType.get(asset.type)!.push(asset);
    }

    // 为每个类型生成常量
    for (const [type, typeAssets] of assetsByType) {
      const constantName = `${type.toUpperCase().replace('-', '_')}_ASSETS`;
      lines.push(`export const ${constantName}: Asset[] = [`);
      
      for (const asset of typeAssets) {
        lines.push(`  ${JSON.stringify(asset, null, 2).replace(/\n/g, '\n  ')},`);
      }
      
      lines.push('];');
      lines.push('');
    }

    // 生成总的资产数组
    lines.push('export const ALL_ASSETS: Asset[] = [');
    for (const [type] of assetsByType) {
      const constantName = `${type.toUpperCase().replace('-', '_')}_ASSETS`;
      lines.push(`  ...${constantName},`);
    }
    lines.push('];');

    return lines.join('\n');
  }
}