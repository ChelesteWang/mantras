/**
 * 改进的意图分析工具 - 提供数据而非直接决策
 * 核心原则：让 AI 基于分析结果自主决策，而不是 MCP 替代决策
 */

import { ToolDefinition } from '../presentation/mcp/tool-registry';
import { z } from 'zod';

export function createImprovedIntentAnalysisTools(): ToolDefinition[] {
  return [
    {
      name: 'analyze_user_intent',
      description: '深度分析用户意图，提供多维度洞察数据供 AI 自主决策使用',
      schema: z.object({
        userInput: z.string().describe('用户的输入内容'),
        context: z.string().optional().describe('对话上下文'),
        analysisDepth: z
          .enum(['basic', 'detailed', 'comprehensive'])
          .default('detailed')
          .describe('分析深度'),
      }),
      metadata: {
        category: 'intent-analysis',
        version: '1.0.0',
        tags: ['intent', 'analysis', 'ai-decision-support'],
      },
      handler: async ({
        userInput: _userInput,
        context: _context,
        analysisDepth: _analysisDepth,
      }) => {
        const analysis = performIntentAnalysis(_userInput, _context || '', _analysisDepth);

        return {
          // 原始输入
          rawInput: _userInput,
          context: _context || null,
          timestamp: new Date().toISOString(),

          // 意图分析结果
          intentAnalysis: {
            primary: analysis.primaryIntent,
            secondary: analysis.secondaryIntents,
            confidence: analysis.confidence,
            keywords: analysis.keywords,
          },

          // 情感和语调分析
          emotionalContext: {
            tone: analysis.emotionalTone,
            urgency: analysis.urgency,
            sentiment: analysis.sentiment,
          },

          // 复杂度和领域分析
          taskAnalysis: {
            complexity: analysis.complexity,
            domain: analysis.domain,
            estimatedTime: analysis.estimatedTime,
            suggestedApproach: analysis.suggestedApproach,
          },

          // 推荐资源（供参考，不做决策）
          availableResources: {
            personas: getPersonaRecommendations(analysis),
            templates: getTemplateRecommendations(analysis),
            tools: getToolRecommendations(analysis),
          },

          // 决策支持信息
          decisionSupport: {
            recommendedStrategy: analysis.recommendedStrategy,
            alternatives: analysis.alternatives,
            reasoning: analysis.reasoning,
          },
        };
      },
    },

    {
      name: 'get_persona_options',
      description: '获取所有可用人格的详细信息，供 AI 选择使用',
      schema: z.object({
        includeCapabilities: z.boolean().default(true).describe('是否包含能力信息'),
        filterByDomain: z.string().optional().describe('按领域筛选'),
      }),
      metadata: {
        category: 'persona-management',
        version: '1.0.0',
        tags: ['persona', 'options', 'selection'],
      },
      handler: async ({ includeCapabilities, filterByDomain }) => {
        const personas = getAvailablePersonas();

        const filteredPersonas = filterByDomain
          ? personas.filter(p => p.domains.includes(filterByDomain))
          : personas;

        return {
          personas: filteredPersonas.map(persona => ({
            id: persona.id,
            name: persona.name,
            description: persona.description,
            ...(includeCapabilities && {
              capabilities: persona.capabilities,
              traits: persona.traits,
              domains: persona.domains,
              communicationStyle: persona.communicationStyle,
            }),
            suitableFor: persona.suitableFor,
            strengths: persona.strengths,
            limitations: persona.limitations,
          })),

          selectionGuide: {
            byCapability: generateCapabilityGuide(),
            byDomain: generateDomainGuide(),
            byTaskType: generateTaskTypeGuide(),
          },

          metadata: {
            totalPersonas: filteredPersonas.length,
            availableDomains: [...new Set(personas.flatMap(p => p.domains))],
            lastUpdated: new Date().toISOString(),
          },
        };
      },
    },

    {
      name: 'evaluate_persona_match',
      description: '评估特定人格与用户需求的匹配度',
      schema: z.object({
        personaId: z.string().describe('人格ID'),
        userIntent: z.string().describe('用户意图'),
        requirements: z.array(z.string()).optional().describe('特定要求'),
      }),
      metadata: {
        category: 'persona-evaluation',
        version: '1.0.0',
        tags: ['persona', 'evaluation', 'matching'],
      },
      handler: async ({ personaId, userIntent, requirements }) => {
        const persona = findPersonaById(personaId);
        if (!persona) {
          throw new Error(`Persona ${personaId} not found`);
        }

        const intentAnalysis = performIntentAnalysis(userIntent, '', 'detailed');
        const matchScore = calculateMatchScore(persona, intentAnalysis, requirements || []);

        return {
          persona: {
            id: persona.id,
            name: persona.name,
            description: persona.description,
          },

          matchAnalysis: {
            overallScore: matchScore.overall,
            capabilityMatch: matchScore.capability,
            domainMatch: matchScore.domain,
            styleMatch: matchScore.style,

            strengths: matchScore.strengths,
            weaknesses: matchScore.weaknesses,
            recommendation: matchScore.recommendation,
          },

          alternatives: suggestAlternatives(intentAnalysis, personaId),

          reasoning: generateMatchReasoning(persona, intentAnalysis, matchScore),
        };
      },
    },
  ];
}

// 辅助函数实现
function performIntentAnalysis(userInput: string, _context: string, _depth: string) {
  const input = userInput.toLowerCase();

  // 扩展的意图识别模式，支持多语言
  const intentPatterns = {
    technical: [
      // 英文
      'code',
      'programming',
      'technical',
      'bug',
      'debug',
      'software',
      'development',
      'architecture',
      // 中文
      '代码',
      '编程',
      '技术',
      '架构',
      '开发',
      '调试',
      '软件',
      '程序',
      '系统',
      // 西班牙语
      'código',
      'programación',
      'técnico',
      'desarrollo',
      'software',
      // 日语
      'コード',
      'プログラミング',
      '技術',
      '開発',
      'ソフトウェア',
    ],
    creative: [
      // 英文
      'creative',
      'writing',
      'content',
      'story',
      'marketing',
      'design',
      'art',
      // 中文
      '创意',
      '写作',
      '文案',
      '故事',
      '营销',
      '设计',
      '艺术',
      '内容',
      // 西班牙语
      'creativo',
      'escritura',
      'contenido',
      'historia',
      'marketing',
      // 日语
      'クリエイティブ',
      '書く',
      'コンテンツ',
      '物語',
      'マーケティング',
    ],
    analytical: [
      // 英文
      'analysis',
      'data',
      'statistics',
      'report',
      'insights',
      'analytics',
      // 中文
      '分析',
      '数据',
      '统计',
      '报告',
      '洞察',
      '分析师',
      // 西班牙语
      'análisis',
      'datos',
      'estadísticas',
      'informe',
      // 日语
      '分析',
      'データ',
      '統計',
      'レポート',
      '洞察',
    ],
    supportive: [
      // 英文
      'help',
      'support',
      'understand',
      'confused',
      'assistance',
      'guide',
      // 中文
      '帮助',
      '支持',
      '理解',
      '困惑',
      '协助',
      '指导',
      '需要',
      // 西班牙语
      'ayuda',
      'apoyo',
      'entender',
      'confundido',
      'asistencia',
      // 日语
      '助け',
      'サポート',
      '理解',
      '困惑',
      'アシスタンス',
      '必要',
    ],
    planning: [
      // 英文
      'plan',
      'planning',
      'steps',
      'process',
      'strategy',
      'organize',
      // 中文
      '计划',
      '规划',
      '步骤',
      '流程',
      '策略',
      '组织',
      // 西班牙语
      'plan',
      'planificación',
      'pasos',
      'proceso',
      'estrategia',
      // 日语
      '計画',
      'プランニング',
      'ステップ',
      'プロセス',
      '戦略',
    ],
  };

  let primaryIntent = 'general';
  let maxScore = 0;
  const secondaryIntents: string[] = [];

  for (const [intent, keywords] of Object.entries(intentPatterns)) {
    const matches = keywords.filter(keyword => input.includes(keyword));
    const score = matches.length / keywords.length;

    if (score > maxScore) {
      if (maxScore > 0.05) secondaryIntents.push(primaryIntent);
      primaryIntent = intent;
      maxScore = score;
    } else if (score > 0.05) {
      secondaryIntents.push(intent);
    }
  }

  // 如果没有匹配到任何关键词，设置最小 confidence
  if (maxScore === 0) {
    maxScore = 0.1; // 设置最小 confidence 为 0.1
  }

  // 情感分析
  const emotionalTone = analyzeEmotionalTone(input);

  // 复杂度分析
  const complexity = assessComplexity(input);

  // 领域分析
  const domain = identifyDomain(input);

  return {
    primaryIntent,
    secondaryIntents,
    confidence: maxScore,
    keywords: extractKeywords(input),
    emotionalTone,
    urgency: assessUrgency(input),
    sentiment: assessSentiment(input),
    complexity,
    domain,
    estimatedTime: getTimeEstimate(complexity),
    suggestedApproach: getSuggestedApproach(complexity),
    recommendedStrategy: getRecommendedStrategy(primaryIntent, complexity),
    alternatives: getAlternativeStrategies(primaryIntent),
    reasoning: generateReasoning(primaryIntent, complexity, emotionalTone),
  };
}

function analyzeEmotionalTone(input: string): string {
  if (input.includes('急') || input.includes('紧急') || input.includes('urgent')) return 'urgent';
  if (input.includes('困惑') || input.includes('不懂') || input.includes('confused'))
    return 'confused';
  if (input.includes('问题') || input.includes('错误') || input.includes('problem'))
    return 'concerned';
  if (input.includes('好') || input.includes('棒') || input.includes('great')) return 'positive';
  return 'neutral';
}

function assessComplexity(input: string): string {
  const complexIndicators = [
    '架构',
    '系统',
    '复杂',
    '多个',
    '整体',
    'architecture',
    'system',
    'complex',
  ];
  const simpleIndicators = ['简单', '快速', '小', '修复', 'simple', 'quick', 'fix'];

  const complexCount = complexIndicators.filter(indicator => input.includes(indicator)).length;
  const simpleCount = simpleIndicators.filter(indicator => input.includes(indicator)).length;

  if (complexCount > simpleCount) return 'high';
  if (simpleCount > complexCount) return 'low';
  return 'medium';
}

function identifyDomain(input: string): string {
  const domains = {
    software_development: ['代码', '编程', '开发', 'code', 'programming'],
    data_analysis: ['数据', '分析', '统计', 'data', 'analysis'],
    content_creation: ['写作', '内容', '文案', 'writing', 'content'],
    business: ['商业', '策略', '产品', 'business', 'strategy'],
    support: ['帮助', '支持', '问题', 'help', 'support'],
  };

  for (const [domain, keywords] of Object.entries(domains)) {
    if (keywords.some(keyword => input.includes(keyword))) {
      return domain;
    }
  }

  return 'general';
}

function extractKeywords(input: string): string[] {
  const words = input.toLowerCase().split(/\s+/);
  const stopWords = [
    '的',
    '是',
    '在',
    '有',
    '和',
    '了',
    '我',
    '你',
    'the',
    'is',
    'in',
    'and',
    'to',
  ];

  return words.filter(word => word.length > 2 && !stopWords.includes(word)).slice(0, 8);
}

function assessUrgency(input: string): string {
  if (
    input.includes('急') ||
    input.includes('紧急') ||
    input.includes('urgent') ||
    input.includes('asap')
  )
    return 'high';
  if (input.includes('快') || input.includes('soon') || input.includes('quickly')) return 'medium';
  return 'low';
}

function assessSentiment(input: string): string {
  const positiveWords = ['好', '棒', '优秀', 'good', 'great', 'excellent'];
  const negativeWords = ['问题', '错误', '困难', 'problem', 'error', 'difficult'];

  const positiveCount = positiveWords.filter(word => input.includes(word)).length;
  const negativeCount = negativeWords.filter(word => input.includes(word)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function getTimeEstimate(complexity: string): string {
  const estimates: Record<string, string> = {
    high: '1-3小时',
    medium: '30分钟-1小时',
    low: '5-30分钟',
  };
  return estimates[complexity] || '未知';
}

function getSuggestedApproach(complexity: string): string {
  const approaches: Record<string, string> = {
    high: '分步骤处理，使用执行计划',
    medium: '结构化分析，可能需要专业人格',
    low: '直接解决，通用助手即可',
  };
  return approaches[complexity] || '根据具体情况决定';
}

function getRecommendedStrategy(intent: string, complexity: string): string {
  if (complexity === 'high') return 'collaborative_planning';
  if (intent === 'technical') return 'expert_consultation';
  if (intent === 'creative') return 'creative_exploration';
  return 'direct_assistance';
}

function getAlternativeStrategies(intent: string): string[] {
  const strategies: Record<string, string[]> = {
    technical: ['expert_consultation', 'step_by_step_guidance', 'code_review'],
    creative: ['creative_exploration', 'brainstorming', 'iterative_refinement'],
    analytical: ['data_driven_analysis', 'structured_investigation', 'comparative_study'],
    supportive: ['empathetic_listening', 'guided_problem_solving', 'resource_recommendation'],
  };
  return strategies[intent] || ['direct_assistance', 'collaborative_exploration'];
}

function generateReasoning(intent: string, complexity: string, tone: string): string {
  return `基于意图类型(${intent})、复杂度(${complexity})和情感语调(${tone})的综合分析，建议采用相应的响应策略。`;
}

function getPersonaRecommendations(analysis: any) {
  const recommendations = [];

  if (analysis.primaryIntent === 'technical') {
    recommendations.push({ id: 'tech-expert', relevance: 0.9, reason: '技术专长匹配' });
  }
  if (analysis.primaryIntent === 'creative') {
    recommendations.push({ id: 'creative', relevance: 0.9, reason: '创意能力匹配' });
  }
  if (analysis.primaryIntent === 'analytical') {
    recommendations.push({ id: 'analyst', relevance: 0.9, reason: '分析能力匹配' });
  }
  if (analysis.primaryIntent === 'supportive') {
    recommendations.push({ id: 'therapist', relevance: 0.9, reason: '支持能力匹配' });
  }

  // 添加通用助手作为备选
  recommendations.push({ id: 'helper-persona', relevance: 0.6, reason: '通用备选方案' });

  return recommendations.sort((a, b) => b.relevance - a.relevance);
}

function getTemplateRecommendations(analysis: any) {
  const templates = [];

  if (analysis.complexity === 'high') {
    templates.push({ id: 'feature-blueprinting', relevance: 0.8, reason: '适合复杂功能设计' });
  }
  if (analysis.primaryIntent === 'technical') {
    templates.push({ id: 'debug-simulation', relevance: 0.7, reason: '适合技术问题诊断' });
  }

  templates.push({ id: 'role-prompting', relevance: 0.6, reason: '通用角色设定' });

  return templates;
}

function getToolRecommendations(analysis: any) {
  const tools = ['summon_persona'];

  if (analysis.complexity === 'high') {
    tools.push('create_execution_plan');
  }

  tools.push('apply_mantra', 'get_project_context');

  return tools;
}

function getAvailablePersonas() {
  return [
    {
      id: 'analyst',
      name: 'Data Analyst',
      description: 'Professional data analyst focused on insights and clarity',
      capabilities: { analysis: true, technical: true, creative: false, empathetic: false },
      traits: ['analytical', 'precise', 'data-driven'],
      domains: ['data_analysis', 'business_intelligence'],
      communicationStyle: 'clear and structured',
      suitableFor: ['数据分析', '商业报告', '趋势识别'],
      strengths: ['数据处理', '逻辑分析', '结构化思维'],
      limitations: ['创意能力有限', '情感支持较弱'],
    },
    {
      id: 'tech-expert',
      name: 'Technical Expert',
      description: 'Deep technical specialist with comprehensive system knowledge',
      capabilities: { analysis: true, technical: true, creative: false, empathetic: false },
      traits: ['technical', 'detailed', 'accurate'],
      domains: ['software_development', 'architecture'],
      communicationStyle: 'technical with examples',
      suitableFor: ['代码审查', '架构设计', '技术诊断'],
      strengths: ['技术深度', '系统思维', '最佳实践'],
      limitations: ['创意表达有限', '非技术领域较弱'],
    },
    {
      id: 'creative',
      name: 'Creative Writer',
      description: 'Creative content writer with imaginative storytelling abilities',
      capabilities: { analysis: false, technical: false, creative: true, empathetic: true },
      traits: ['creative', 'vivid', 'engaging'],
      domains: ['content_creation', 'marketing'],
      communicationStyle: 'expressive and narrative',
      suitableFor: ['创意写作', '营销文案', '故事构建'],
      strengths: ['创意思维', '表达能力', '情感共鸣'],
      limitations: ['技术能力有限', '数据分析较弱'],
    },
    {
      id: 'therapist',
      name: 'Supportive Listener',
      description: 'Empathetic support system focused on well-being',
      capabilities: { analysis: false, technical: false, creative: false, empathetic: true },
      traits: ['empathetic', 'supportive', 'understanding'],
      domains: ['support', 'communication'],
      communicationStyle: 'warm and supportive',
      suitableFor: ['情感支持', '沟通指导', '冲突调解'],
      strengths: ['同理心', '倾听能力', '情感理解'],
      limitations: ['技术能力有限', '分析深度不足'],
    },
  ];
}

function findPersonaById(id: string) {
  return getAvailablePersonas().find(p => p.id === id);
}

function calculateMatchScore(persona: any, analysis: any, _requirements: string[]) {
  let capabilityScore = 0;
  let domainScore = 0;
  const styleScore = 0.5; // 基础分数

  // 能力匹配
  if (analysis.primaryIntent === 'technical' && persona.capabilities.technical)
    capabilityScore = 0.9;
  else if (analysis.primaryIntent === 'creative' && persona.capabilities.creative)
    capabilityScore = 0.9;
  else if (analysis.primaryIntent === 'analytical' && persona.capabilities.analysis)
    capabilityScore = 0.9;
  else if (analysis.primaryIntent === 'supportive' && persona.capabilities.empathetic)
    capabilityScore = 0.9;
  else capabilityScore = 0.3;

  // 领域匹配
  if (persona.domains.includes(analysis.domain)) domainScore = 0.8;
  else domainScore = 0.2;

  const overall = capabilityScore * 0.5 + domainScore * 0.3 + styleScore * 0.2;

  return {
    overall,
    capability: capabilityScore,
    domain: domainScore,
    style: styleScore,
    strengths: persona.strengths,
    weaknesses: persona.limitations,
    recommendation:
      overall > 0.7
        ? 'highly_recommended'
        : overall > 0.5
          ? 'recommended'
          : 'consider_alternatives',
  };
}

function suggestAlternatives(analysis: any, excludeId: string) {
  return getAvailablePersonas()
    .filter(p => p.id !== excludeId)
    .slice(0, 2)
    .map(p => ({ id: p.id, name: p.name, reason: '备选方案' }));
}

function generateMatchReasoning(persona: any, analysis: any, score: any): string {
  return `${persona.name} 与用户需求的匹配度为 ${(score.overall * 100).toFixed(0)}%，主要基于能力匹配(${(score.capability * 100).toFixed(0)}%)和领域匹配(${(score.domain * 100).toFixed(0)}%)。`;
}

function generateCapabilityGuide() {
  return {
    technical: ['tech-expert'],
    creative: ['creative'],
    analytical: ['analyst'],
    empathetic: ['therapist'],
  };
}

function generateDomainGuide() {
  return {
    software_development: ['tech-expert'],
    data_analysis: ['analyst'],
    content_creation: ['creative'],
    support: ['therapist'],
  };
}

function generateTaskTypeGuide() {
  return {
    problem_solving: ['tech-expert', 'analyst'],
    content_creation: ['creative'],
    emotional_support: ['therapist'],
    data_analysis: ['analyst'],
  };
}
