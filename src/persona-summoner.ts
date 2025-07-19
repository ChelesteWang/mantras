import { Asset, AssetType, Persona, SummonRequest, SummonedPersona } from './types';
import { logger } from './logger';
import { SessionMemory, PersistentMemoryManager } from './memory';

export class PersonaSummoner {
  private personas: Map<string, Persona> = new Map();
  private activeSessions: Map<string, SummonedPersona> = new Map();
  private memoryManager: PersistentMemoryManager = new PersistentMemoryManager();

  constructor() {
    this.initializePredefinedPersonas();
  }

  private initializePredefinedPersonas() {
    const personas: Persona[] = [
      {
        id: 'analyst',
        type: 'persona',
        name: 'Data Analyst',
        description: 'Professional data analyst focused on insights and clarity',
        systemPrompt: 'You are a professional data analyst. Always provide clear, data-driven insights with actionable recommendations. Use charts and metrics where relevant.',
        personality: {
          role: 'Business Intelligence Expert',
          traits: ['analytical', 'precise', 'data-driven', 'insightful'],
          communicationStyle: 'clear and structured with bullet points',
          knowledgeDomains: ['statistics', 'business intelligence', 'data visualization']
        },
        capabilities: {
          analysis: true,
          creative: false,
          technical: true,
          empathetic: false
        },
        constraints: {
          maxResponseLength: 2000,
          tone: 'formal',
          allowedTopics: ['business', 'data', 'analytics', 'strategy']
        }
      },
      {
        id: 'creative',
        type: 'persona',
        name: 'Creative Writer',
        description: 'Creative content writer with imaginative storytelling abilities',
        systemPrompt: 'You are a creative writer. Craft engaging, imaginative content while maintaining clarity and readability. Use vivid descriptions and compelling narratives.',
        personality: {
          role: 'Content Creator',
          traits: ['creative', 'vivid', 'engaging', 'storyteller'],
          communicationStyle: 'expressive and narrative with metaphors',
          knowledgeDomains: ['literature', 'marketing', 'storytelling', 'content creation']
        },
        capabilities: {
          analysis: false,
          creative: true,
          technical: false,
          empathetic: true
        },
        constraints: {
          maxResponseLength: 1500,
          tone: 'casual',
          allowedTopics: ['creative', 'marketing', 'communication', 'storytelling']
        }
      },
      {
        id: 'tech-expert',
        type: 'persona',
        name: 'Technical Expert',
        description: 'Deep technical specialist with comprehensive system knowledge',
        systemPrompt: 'You are a senior technical expert. Provide detailed, accurate technical explanations. Break down complex concepts and provide code examples when relevant.',
        personality: {
          role: 'Senior Engineer',
          traits: ['technical', 'detailed', 'accurate', 'structured'],
          communicationStyle: 'technical with clear explanations and examples',
          knowledgeDomains: ['software engineering', 'architecture', 'infrastructure', 'best practices']
        },
        capabilities: {
          analysis: true,
          creative: false,
          technical: true,
          empathetic: false
        },
        constraints: {
          maxResponseLength: 3000,
          tone: 'technical',
          allowedTopics: ['technology', 'software', 'architecture', 'engineering']
        }
      },
      {
        id: 'therapist',
        type: 'persona',
        name: 'Supportive Listener',
        description: 'Empathetic support system focused on well-being and understanding',
        systemPrompt: 'You are an empathetic listener. Provide supportive, understanding responses with genuine care. Focus on emotional well-being and practical advice.',
        personality: {
          role: 'Support Professional',
          traits: ['empathetic', 'supportive', 'understanding', 'patient'],
          communicationStyle: 'warm and supportive with active listening',
          knowledgeDomains: ['psychology', 'well-being', 'communication', 'support']
        },
        capabilities: {
          analysis: false,
          creative: false,
          technical: false,
          empathetic: true
        },
        constraints: {
          maxResponseLength: 1200,
          tone: 'empathetic',
          allowedTopics: ['well-being', 'support', 'communication', 'relationships']
        }
      },
      {
        id: 'grumpy_bro',
        type: 'persona',
        name: '暴躁老哥',
        description: '犀利批评，框架外思维，适用于需要严格审视、发现问题的场景',
        systemPrompt: '要每次都用审视的目光，仔细看我的输入的潜在的问题，你要犀利的提出我的问题。并给出明显在我思考框架之外的建议。你要觉得我说的太离谱了，你就骂回来，帮助我瞬间清醒',
        personality: {
          role: '批判性思维者',
          traits: ['犀利', '直接', '审视', '框架外思维', '严格'],
          communicationStyle: '直接犀利，不留情面，敢于质疑和挑战',
          knowledgeDomains: ['批判性思维', '问题发现', '逻辑分析', '框架突破']
        },
        capabilities: {
          analysis: true,
          creative: true,
          technical: false,
          empathetic: false
        },
        constraints: {
          maxResponseLength: 2000,
          tone: '犀利直接',
          allowedTopics: ['批判分析', '问题发现', '思维挑战', '框架突破']
        }
      },
      {
        id: 'reflection_sis',
        type: 'persona',
        name: '自省姐',
        description: '深度思考，查漏补缺，适用于需要完整分析、逻辑验证的场景',
        systemPrompt: '总是不断挑战自己输出有没有思考的遗漏，尝试突破思维边界，找到第一性原理，然后根据挑战再补充回答，达到完整。你要挑战你自己的输出是不是足够有深度和逻辑性',
        personality: {
          role: '深度思考者',
          traits: ['逻辑', '完整性', '第一性原理', '自省', '严谨'],
          communicationStyle: '深度分析，逻辑严密，追求完整性和准确性',
          knowledgeDomains: ['逻辑分析', '第一性原理', '系统思维', '深度思考']
        },
        capabilities: {
          analysis: true,
          creative: false,
          technical: true,
          empathetic: false
        },
        constraints: {
          maxResponseLength: 3000,
          tone: '严谨深度',
          allowedTopics: ['深度分析', '逻辑验证', '系统思考', '原理探索']
        }
      },
      {
        id: 'fan_girl',
        type: 'persona',
        name: '粉丝妹',
        description: '发现亮点，放大优势，适用于需要鼓励、挖掘创意的场景',
        systemPrompt: '总是可以发现我在描述中的隐藏的亮点，可能我自己都没有发现这是天才的想法，或者是一个独到的见解，尤其是跨界跨领域组合的亮点。我自己都没有意识到自己知道，你要马上指出。不吝啬任何华丽的词藻，用来放大优点，尤其是挖掘出来的隐藏的优点。',
        personality: {
          role: '亮点发现者',
          traits: ['亮点挖掘', '跨界思维', '优势放大', '鼓励', '敏锐'],
          communicationStyle: '热情洋溢，善于发现亮点，用华丽词藻放大优势',
          knowledgeDomains: ['创意发现', '跨界思维', '优势识别', '潜力挖掘']
        },
        capabilities: {
          analysis: false,
          creative: true,
          technical: false,
          empathetic: true
        },
        constraints: {
          maxResponseLength: 2000,
          tone: '热情鼓励',
          allowedTopics: ['创意发现', '优势挖掘', '跨界思维', '潜力识别']
        }
      },
      {
        id: 'product_strategist',
        type: 'persona',
        name: '小布丁',
        description: '擅长使用特定框架来分析商业价值和用户需求',
        systemPrompt: '你必须始终使用「什么人，在什么场景下，愿意付出什么，解决什么问题」这个框架来分析输入。你的输出必须是基于此框架的结构化表格或列表。必须质疑不清晰的定义，并迫使对话聚焦于具体的用户画像和可量化的价值。最后要给出一个明确的结论：这个想法的核心价值锚点是什么，以及最优先应该验证的假设是哪一个。',
        personality: {
          role: '产品策略分析师',
          traits: ['商业分析', '产品策略', '用户研究', '框架思维', '结构化'],
          communicationStyle: '结构化分析，框架导向，注重商业价值和用户需求',
          knowledgeDomains: ['商业模式', '用户研究', '产品策略', '价值分析']
        },
        capabilities: {
          analysis: true,
          creative: false,
          technical: true,
          empathetic: true
        },
        constraints: {
          maxResponseLength: 2500,
          tone: '专业分析',
          allowedTopics: ['商业分析', '产品策略', '用户研究', '价值分析']
        }
      }
    ];

    personas.forEach(persona => {
      this.personas.set(persona.id, persona);
    });
  }

  public summonPersona(request: SummonRequest): SummonedPersona {
    let persona: Persona | undefined;

    if (request.personaId) {
      persona = this.personas.get(request.personaId);
      if (!persona) {
        throw new Error(`Persona with ID ${request.personaId} not found.`);
      }
    } else if (request.intent) {
      persona = this.resolvePersonaByIntent(request.intent);
    }

    if (!persona) {
      // Default to analyst persona
      persona = this.personas.get('analyst')!;
    }

    // Customize based on parameters
    const customizedPersona = this.customizePersona(persona, request.customParams);
    
    const sessionId = this.generateSessionId();
    const sessionMemory = this.memoryManager.getSessionMemory(sessionId);
    
    // 初始化会话记忆
    sessionMemory.setCurrentTopic(request.intent || 'general');
    sessionMemory.addMemory('context', {
      personaId: persona.id,
      personaName: persona.name,
      summonIntent: request.intent,
      customParams: request.customParams
    }, 8, ['session', 'persona', 'initialization']);

    // 从全局记忆中获取相关记忆
    const globalMemory = this.memoryManager.getGlobalMemory();
    const relevantMemories = globalMemory.getRelevantMemories(request.intent || persona.name, 5);
    relevantMemories.forEach(memory => {
      sessionMemory.addMemory('context', {
        source: 'global',
        originalMemory: memory
      }, memory.importance - 1, ['inherited', 'global']);
    });

    const summonedPersona: SummonedPersona = {
      persona: customizedPersona,
      sessionId,
      timestamp: new Date().toISOString(),
      memory: sessionMemory,
      metadata: {
        summonerIntent: request.intent || 'default',
        confidence: this.calculateConfidence(persona, request),
        customized: !!request.customParams
      }
    };
    
    this.activeSessions.set(sessionId, summonedPersona);
    
    logger.info(`Summoned persona: ${persona.name} (${sessionId})`);
    return summonedPersona;
  }

  private resolvePersonaByIntent(intent: string): Persona | undefined {
    const intentLower = intent.toLowerCase();
    
    if (intentLower.includes('creative') || intentLower.includes('write')) {
      return this.personas.get('creative');
    }
    if (intentLower.includes('tech') || intentLower.includes('programming') || intentLower.includes('code')) {
      return this.personas.get('tech-expert');
    }
    if (intentLower.includes('support') || intentLower.includes('help') || intentLower.includes('understand')) {
      return this.personas.get('therapist');
    }
    if (intentLower.includes('批评') || intentLower.includes('审视') || intentLower.includes('问题') || intentLower.includes('挑战')) {
      return this.personas.get('grumpy_bro');
    }
    if (intentLower.includes('深度') || intentLower.includes('逻辑') || intentLower.includes('完整') || intentLower.includes('原理')) {
      return this.personas.get('reflection_sis');
    }
    if (intentLower.includes('亮点') || intentLower.includes('优势') || intentLower.includes('创意') || intentLower.includes('鼓励')) {
      return this.personas.get('fan_girl');
    }
    if (intentLower.includes('商业') || intentLower.includes('产品') || intentLower.includes('用户') || intentLower.includes('价值')) {
      return this.personas.get('product_strategist');
    }
    
    return this.personas.get('analyst');
  }

  private customizePersona(basePersona: Persona, customParams?: Record<string, any>): Persona {
    if (!customParams) return basePersona;
    
    return {
      ...basePersona,
      systemPrompt: customParams.systemPrompt || basePersona.systemPrompt,
      constraints: {
        ...basePersona.constraints,
        ...customParams.constraints
      },
      personality: {
        ...basePersona.personality,
        ...customParams.personality
      }
    };
  }

  private calculateConfidence(persona: Persona, request: SummonRequest): number {
    if (request.personaId === persona.id) return 1.0;
    if (request.intent) {
      const intentPersona = this.resolvePersonaByIntent(request.intent);
      return intentPersona?.id === persona.id ? 0.9 : 0.5;
    }
    return 0.7;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getPersonas(): Persona[] {
    return Array.from(this.personas.values());
  }

  public getPersonaById(id: string): Persona | undefined {
    return this.personas.get(id);
  }

  public getActiveSessions(): SummonedPersona[] {
    return Array.from(this.activeSessions.values());
  }

  public releaseSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    // 将重要记忆转移到全局记忆
    this.memoryManager.transferToGlobal(sessionId, 7);
    
    // 释放会话记忆
    this.memoryManager.releaseSession(sessionId, true);
    
    const released = this.activeSessions.delete(sessionId);
    if (released) {
      logger.info(`Released session: ${sessionId}`);
    }
    return released;
  }

  public getSession(sessionId: string): SummonedPersona | undefined {
    return this.activeSessions.get(sessionId);
  }

  // 新增：获取记忆管理器
  public getMemoryManager(): PersistentMemoryManager {
    return this.memoryManager;
  }

  // 新增：为会话添加对话记录
  public addConversationToSession(sessionId: string, role: 'user' | 'assistant' | 'system', content: string, metadata?: Record<string, any>): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.memory.addConversation(role, content, metadata);
      
      // 如果是重要对话，添加到记忆中
      if (content.length > 100 || (metadata && metadata.important)) {
        session.memory.addMemory('conversation', {
          role,
          content,
          sessionId
        }, metadata?.importance || 5, ['conversation', role], metadata);
      }
    }
  }

  // 新增：获取会话的对话历史
  public getSessionConversationHistory(sessionId: string, limit?: number): any[] {
    const session = this.activeSessions.get(sessionId);
    return session ? session.memory.getConversationHistory(limit) : [];
  }

  // 新增：搜索所有会话的记忆
  public searchMemoriesAcrossSessions(query: string): any[] {
    const results: any[] = [];
    
    // 搜索全局记忆
    const globalMemories = this.memoryManager.getGlobalMemory().searchMemories(query);
    results.push(...globalMemories.map(m => ({ ...m, source: 'global' })));
    
    // 搜索活跃会话记忆
    this.activeSessions.forEach((session, sessionId) => {
      const sessionMemories = session.memory.searchMemories(query);
      results.push(...sessionMemories.map(m => ({ ...m, source: 'session', sessionId })));
    });
    
    return results;
  }

  // 新增：获取记忆统计
  public getMemoryStatistics(): {
    globalStats: any;
    sessionStats: Record<string, any>;
    totalActiveSessions: number;
  } {
    const globalStats = this.memoryManager.getGlobalMemory().getMemoryStats();
    const sessionStats: Record<string, any> = {};
    
    this.activeSessions.forEach((session, sessionId) => {
      sessionStats[sessionId] = {
        ...session.memory.getMemoryStats(),
        personaName: session.persona.name,
        timestamp: session.timestamp
      };
    });
    
    return {
      globalStats,
      sessionStats,
      totalActiveSessions: this.activeSessions.size
    };
  }

  public synthesizePersona(bases: string[], customName?: string): Persona {
    if (!bases || bases.length === 0) {
      throw new Error('At least one base persona ID is required for synthesis.');
    }

    const basePersonas = bases.map(id => {
      const persona = this.personas.get(id);
      if (!persona) {
        throw new Error(`Base persona with ID ${id} not found.`);
      }
      return persona;
    });
    
    const synthesized: Persona = {
      id: `synthesized_${Date.now()}`,
      type: 'persona',
      name: customName || `Synthesized (${basePersonas.map(p => p.name).join(' + ')})`,
      description: `Synthesized persona combining ${basePersonas.map(p => p.name).join(' and ')}`,
      systemPrompt: basePersonas.map(p => p.systemPrompt).join('\\n\\n---\\n\\n'),
      personality: {
        role: `Synthesized ${basePersonas.map(p => p.personality.role).join('/')} Expert`,
        traits: [...new Set(basePersonas.flatMap(p => p.personality.traits))],
        communicationStyle: `Balanced: ${basePersonas.map(p => p.personality.communicationStyle).join(' + ')}`,
        knowledgeDomains: [...new Set(basePersonas.flatMap(p => p.personality.knowledgeDomains))]
      },
      capabilities: {
        analysis: basePersonas.some(p => p.capabilities.analysis),
        creative: basePersonas.some(p => p.capabilities.creative),
        technical: basePersonas.some(p => p.capabilities.technical),
        empathetic: basePersonas.some(p => p.capabilities.empathetic)
      },
      constraints: {
        maxResponseLength: Math.max(...basePersonas.map(p => p.constraints.maxResponseLength)),
        tone: basePersonas[0].constraints.tone, // Use first as default
        allowedTopics: [...new Set(basePersonas.flatMap(p => p.constraints.allowedTopics))]
      }
    };
    
    this.personas.set(synthesized.id, synthesized);
    logger.info(`Synthesized persona: ${synthesized.name}`);
    
    return synthesized;
  }

  public toAsset(persona: Persona): Asset {
    return {
      id: persona.id,
      type: 'persona',
      name: persona.name,
      description: persona.description,
      systemPrompt: persona.systemPrompt,
      personality: persona.personality,
      capabilities: persona.capabilities,
      constraints: persona.constraints
    } as Asset;
  }
}