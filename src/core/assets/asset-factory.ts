import { Asset, AssetType, Persona, PromptTemplate, ActionableTool } from '../../types';

/**
 * 资产工厂 - 负责创建和验证不同类型的资产
 */
export class AssetFactory {
  /**
   * 创建人格资产
   */
  static createPersona(config: Omit<Persona, 'type'>): Persona {
    return {
      type: 'persona' as const,
      ...config
    } as Persona;
  }

  /**
   * 创建提示模板资产
   */
  static createPromptTemplate(config: Omit<PromptTemplate, 'type'>): PromptTemplate {
    return {
      type: 'prompt-template' as const,
      ...config
    } as PromptTemplate;
  }

  /**
   * 创建工具资产
   */
  static createTool(config: Omit<ActionableTool, 'type'>): ActionableTool {
    return {
      type: 'tool' as const,
      ...config
    } as ActionableTool;
  }

  /**
   * 从原始数据创建资产
   */
  static fromRawData(data: any): Asset {
    if (!data.type) {
      throw new Error('Asset type is required');
    }

    switch (data.type) {
      case 'persona':
        return this.createPersona(data);
      case 'prompt-template':
        return this.createPromptTemplate(data);
      case 'tool':
        return this.createTool(data);
      default:
        throw new Error(`Unknown asset type: ${data.type}`);
    }
  }

  /**
   * 验证资产数据完整性
   */
  static validateAsset(asset: Asset): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 基础验证
    if (!asset.id) errors.push('Asset ID is required');
    if (!asset.name) errors.push('Asset name is required');
    if (!asset.type) errors.push('Asset type is required');

    // 类型特定验证
    switch (asset.type) {
      case 'persona':
        const persona = asset as Persona;
        if (!persona.systemPrompt) errors.push('Persona system prompt is required');
        if (!persona.personality) errors.push('Persona personality is required');
        if (!persona.capabilities) errors.push('Persona capabilities are required');
        if (!persona.constraints) errors.push('Persona constraints are required');
        break;

      case 'prompt-template':
        const template = asset as PromptTemplate;
        if (!template.template) errors.push('Template content is required');
        if (!template.technique) errors.push('Template technique is required');
        if (!template.parameters || !Array.isArray(template.parameters)) {
          errors.push('Template parameters must be an array');
        }
        if (!template.category) errors.push('Template category is required');
        break;

      case 'tool':
        const tool = asset as ActionableTool;
        if (!tool.parameters) errors.push('Tool parameters are required');
        if (typeof tool.execute !== 'function') errors.push('Tool execute function is required');
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 克隆资产（深拷贝）
   */
  static cloneAsset<T extends Asset>(asset: T): T {
    return JSON.parse(JSON.stringify(asset));
  }

  /**
   * 合并资产属性
   */
  static mergeAssets<T extends Asset>(base: T, override: Partial<T>): T {
    return {
      ...base,
      ...override,
      // 确保ID和类型不被覆盖
      id: base.id,
      type: base.type
    };
  }
}