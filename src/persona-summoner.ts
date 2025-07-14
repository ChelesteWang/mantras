import { Asset, AssetType, Persona, SummonRequest, SummonedPersona } from './types';
import { logger } from './logger';
import { SessionMemory } from './memory';

export class PersonaSummoner {
  private personas: Map<string, Persona> = new Map();
  private activeSessions: Map<string, SummonedPersona> = new Map();

  constructor() {
    this.initializePredefinedPersonas();
  }

  private initializePredefinedPersonas() {
    const personas: Persona[] = [
      {
        id: 'analyst',
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
    const summonedPersona: SummonedPersona = {
      persona: customizedPersona,
      sessionId,
      timestamp: new Date().toISOString(),
      memory: new SessionMemory(), // Create a new memory instance for the session
      metadata: {
        summonerIntent: request.intent || 'default',
        confidence: this.calculateConfidence(persona, request),
        customized: !!request.customParams
      }
    };
    
    this.activeSessions.set(sessionId, summonedPersona);
    
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
    const released = this.activeSessions.delete(sessionId);
    if (released) {
      logger.info(`Released session: ${sessionId}`);
    }
    return released;
  }

  public getSession(sessionId: string): SummonedPersona | undefined {
    return this.activeSessions.get(sessionId);
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