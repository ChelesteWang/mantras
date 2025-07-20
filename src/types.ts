// 资产类型
export type AssetType = 'persona' | 'prompt' | 'tool' | 'prompt-template';

// 资产结构
export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  description?: string;
  [key: string]: any; // 允许扩展字段
}

// 提示模板接口
export interface PromptTemplate extends Asset {
  type: 'prompt-template';
  technique: string; // 对应手册中的技巧
  template: string; // 模板内容
  parameters: string[]; // 参数列表
  category: string; // 分类
}

// 资产仓库接口
export interface AssetRepository {
  getAssets(): Promise<Asset[]>;
  getAssetById(id: string): Promise<Asset | undefined>;
}

export interface Persona extends Asset {
  type: 'persona';
  systemPrompt: string;
  personality: {
    role: string;
    traits: string[];
    communicationStyle: string;
    knowledgeDomains: string[];
  };
  capabilities: {
    analysis: boolean;
    creative: boolean;
    technical: boolean;
    empathetic: boolean;
  };
  constraints: {
    maxResponseLength: number;
    tone: string;
    allowedTopics: string[];
  };
}

export interface SummonRequest {
  personaId?: string;
  intent?: string;
  customParams?: Record<string, any>;
}

import { SessionMemory } from './core/memory/memory';

export interface SummonedPersona {
  persona: Persona;
  sessionId: string;
  timestamp: string;
  memory: SessionMemory; // Add memory to the session
  metadata: {
    summonerIntent: string;
    confidence: number;
    customized: boolean;
  };
}

export interface ActionableTool extends Asset {
  type: 'tool';
  parameters: object; // JSON Schema
  execute(args: any): Promise<any>;
}
