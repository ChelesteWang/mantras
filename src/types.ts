// 资产类型
export type AssetType = 'persona' | 'prompt' | 'tool';

// 资产结构
export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  description?: string;
  [key: string]: any; // 允许扩展字段
}

// 资产仓库接口
export interface AssetRepository {
  getAssets(): Promise<Asset[]>;
  getAssetById(id: string): Promise<Asset | undefined>;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
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

export interface SummonedPersona {
  persona: Persona;
  sessionId: string;
  timestamp: string;
  metadata: {
    summonerIntent: string;
    confidence: number;
    customized: boolean;
  };
}