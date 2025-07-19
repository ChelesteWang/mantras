import { ActionableTool } from '../types';

interface IntentPattern {
  keywords: string[];
  weight: number;
  persona: string;
  tools: string[];
}

interface IntentAnalysis {
  primaryIntent: string;
  confidence: number;
  patterns: string[];
  emotionalTone: string;
  complexity: string;
  primaryRecommendation: {
    tool: string;
    parameters: any;
    persona: string;
  };
  reasoning: string;
  expectedOutcome: string;
  alternatives: Array<{
    intent: string;
    confidence: number;
    tool: string;
    persona: string;
    reason: string;
  }>;
}

export const intentAnalyzerTool: ActionableTool = {
  id: 'analyze_intent',
  type: 'tool',
  name: 'Intent Analyzer',
  description: 'Analyze user input and recommend the most appropriate Mantras tools and personas',
  parameters: {
    type: 'object',
    properties: {
      userInput: {
        type: 'string',
        description: 'The user\'s input or request to analyze'
      },
      context: {
        type: 'string',
        description: 'Additional context about the conversation or task',
        default: ''
      },
      includeAlternatives: {
        type: 'boolean',
        description: 'Whether to include alternative tool suggestions',
        default: true
      }
    },
    required: ['userInput']
  },
  async execute(args: { 
    userInput: string; 
    context?: string; 
    includeAlternatives?: boolean 
  }): Promise<any> {
    const { userInput, context = '', includeAlternatives = true } = args;
    
    // 意图分析逻辑
    const analysis = analyzeUserIntent(userInput, context, includeAlternatives);
    
    const result: any = {
      timestamp: new Date().toISOString(),
      userInput,
      analysis: {
        primaryIntent: analysis.primaryIntent,
        confidence: analysis.confidence,
        detectedPatterns: analysis.patterns,
        emotionalTone: analysis.emotionalTone,
        complexity: analysis.complexity
      },
      recommendations: {
        primary: analysis.primaryRecommendation,
        reasoning: analysis.reasoning,
        expectedOutcome: analysis.expectedOutcome
      }
    };

    if (includeAlternatives && analysis.alternatives.length > 0) {
      result.recommendations.alternatives = analysis.alternatives;
    }

    // 添加立即可执行的建议
    result.immediateActions = generateImmediateActions(analysis);
    
    return result;
  }
};

// 意图分析核心逻辑
function analyzeUserIntent(userInput: string, context: string, includeAlternatives: boolean): IntentAnalysis {
  const input = userInput.toLowerCase();
  const fullContext = `${context} ${userInput}`.toLowerCase();
  
  // 定义意图模式
  const intentPatterns: Record<string, IntentPattern> = {
    technical: {
      keywords: ['代码', '编程', '技术', '架构', '开发', 'code', 'programming', 'technical', 'bug', '调试', 'api', '数据库', '算法'],
      weight: 0.9,
      persona: 'tech-expert',
      tools: ['summon_by_intent', 'create_execution_plan']
    },
    creative: {
      keywords: ['创意', '写作', '文案', '故事', '营销', 'creative', 'writing', '内容', '创作', '想法', '灵感'],
      weight: 0.8,
      persona: 'creative',
      tools: ['summon_by_intent', 'apply_mantra']
    },
    analytical: {
      keywords: ['分析', '数据', '统计', '报告', '洞察', 'analysis', 'data', '趋势', '指标', '评估'],
      weight: 0.85,
      persona: 'analyst',
      tools: ['summon_by_intent', 'create_execution_plan']
    },
    supportive: {
      keywords: ['帮助', '支持', '理解', '困惑', '焦虑', 'help', 'support', '情感', '心理', '建议'],
      weight: 0.7,
      persona: 'therapist',
      tools: ['summon_by_intent']
    },
    planning: {
      keywords: ['计划', '规划', '步骤', '流程', '项目', 'plan', 'planning', '任务', '管理', '组织'],
      weight: 0.8,
      persona: 'analyst',
      tools: ['create_execution_plan', 'summon_by_intent']
    },
    critical: {
      keywords: ['批评', '问题', '挑战', '审视', '质疑', '缺陷', '改进'],
      weight: 0.75,
      persona: 'grumpy-bro',
      tools: ['summon_persona']
    },
    reflective: {
      keywords: ['深度', '思考', '逻辑', '原理', '本质', '完整', '系统'],
      weight: 0.8,
      persona: 'reflection-sis',
      tools: ['summon_persona', 'create_execution_plan']
    },
    encouraging: {
      keywords: ['亮点', '优势', '创新', '鼓励', '赞美', '积极'],
      weight: 0.7,
      persona: 'fan-girl',
      tools: ['summon_persona']
    },
    business: {
      keywords: ['商业', '产品', '用户', '价值', '策略', '市场', '需求'],
      weight: 0.8,
      persona: 'product-strategist',
      tools: ['summon_persona', 'create_execution_plan']
    }
  };

  // 计算每个意图的匹配分数
  const scores: Record<string, number> = {};
  for (const [intent, pattern] of Object.entries(intentPatterns)) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      if (fullContext.includes(keyword)) {
        score += pattern.weight;
      }
    }
    scores[intent] = score;
  }

  // 找到最高分的意图
  const sortedIntents = Object.entries(scores)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .filter(([,score]) => (score as number) > 0);

  if (sortedIntents.length === 0) {
    // 默认推荐
    return {
      primaryIntent: 'general',
      confidence: 0.5,
      patterns: ['general_inquiry'],
      emotionalTone: 'neutral',
      complexity: 'medium',
      primaryRecommendation: {
        tool: 'summon_by_intent',
        parameters: { intent: 'general assistance' },
        persona: 'helper-persona'
      },
      reasoning: 'No specific intent detected, recommending general assistance',
      expectedOutcome: 'Balanced, helpful response suitable for general inquiries',
      alternatives: []
    };
  }

  const [primaryIntent, primaryScore] = sortedIntents[0];
  const pattern = intentPatterns[primaryIntent];
  const confidence = Math.min((primaryScore as number) / 2, 1.0); // 归一化置信度

  // 检测情感色调
  const emotionalTone = detectEmotionalTone(userInput);
  
  // 评估复杂度
  const complexity = assessComplexity(userInput);

  // 生成主要推荐
  const primaryRecommendation = {
    tool: pattern.tools[0],
    parameters: pattern.tools[0] === 'summon_by_intent' 
      ? { intent: primaryIntent }
      : pattern.tools[0] === 'summon_persona'
      ? { personaId: pattern.persona }
      : { userRequest: userInput },
    persona: pattern.persona
  };

  // 生成替代方案
  const alternatives = includeAlternatives ? generateAlternatives(sortedIntents.slice(1, 3), intentPatterns) : [];

  return {
    primaryIntent,
    confidence,
    patterns: [primaryIntent],
    emotionalTone,
    complexity,
    primaryRecommendation,
    reasoning: `Detected ${primaryIntent} intent with ${(confidence * 100).toFixed(1)}% confidence based on keyword analysis`,
    expectedOutcome: generateExpectedOutcome(primaryIntent, pattern.persona),
    alternatives
  };
}

function detectEmotionalTone(input: string): string {
  const positiveWords = ['好', '棒', '优秀', '喜欢', '开心', 'good', 'great', 'excellent', 'happy'];
  const negativeWords = ['坏', '糟糕', '困难', '问题', '焦虑', 'bad', 'terrible', 'difficult', 'problem', 'anxious'];
  const urgentWords = ['急', '紧急', '快', '立即', 'urgent', 'quickly', 'immediately', 'asap'];

  const inputLower = input.toLowerCase();
  
  if (urgentWords.some(word => inputLower.includes(word))) return 'urgent';
  if (negativeWords.some(word => inputLower.includes(word))) return 'negative';
  if (positiveWords.some(word => inputLower.includes(word))) return 'positive';
  
  return 'neutral';
}

function assessComplexity(input: string): string {
  const wordCount = input.split(/\s+/).length;
  const hasMultipleQuestions = (input.match(/[?？]/g) || []).length > 1;
  const hasMultipleTasks = input.includes('和') || input.includes('以及') || input.includes('还有') || input.includes('and') || input.includes('also');
  
  if (wordCount > 50 || hasMultipleQuestions || hasMultipleTasks) return 'high';
  if (wordCount > 20) return 'medium';
  return 'low';
}

function generateExpectedOutcome(intent: string, persona: string): string {
  const outcomes: Record<string, string> = {
    technical: 'Detailed technical explanation with code examples and best practices',
    creative: 'Engaging, imaginative content with vivid descriptions and compelling narratives',
    analytical: 'Data-driven insights with clear structure and actionable recommendations',
    supportive: 'Empathetic understanding with practical emotional support and guidance',
    planning: 'Systematic breakdown of tasks with clear steps and timelines',
    critical: 'Sharp, direct feedback highlighting potential issues and improvements',
    reflective: 'Deep, thoughtful analysis exploring underlying principles and connections',
    encouraging: 'Positive reinforcement highlighting strengths and creative potential',
    business: 'Strategic insights focused on user value and market opportunities'
  };
  
  return outcomes[intent] || 'Balanced, helpful response tailored to your specific needs';
}

function generateAlternatives(sortedIntents: [string, unknown][], intentPatterns: Record<string, IntentPattern>): Array<{
  intent: string;
  confidence: number;
  tool: string;
  persona: string;
  reason: string;
}> {
  return sortedIntents.map(([intent, score]) => {
    const pattern = intentPatterns[intent];
    return {
      intent,
      confidence: Math.min((score as number) / 2, 1.0),
      tool: pattern.tools[0],
      persona: pattern.persona,
      reason: `Alternative approach focusing on ${intent} aspects`
    };
  });
}

function generateImmediateActions(analysis: IntentAnalysis): any[] {
  const actions = [];
  
  // 主要推荐的立即行动
  actions.push({
    priority: 'high',
    action: `Call ${analysis.primaryRecommendation.tool}`,
    parameters: analysis.primaryRecommendation.parameters,
    description: `Immediately activate ${analysis.primaryRecommendation.persona} persona for specialized assistance`
  });

  // 根据复杂度添加额外建议
  if (analysis.complexity === 'high') {
    actions.push({
      priority: 'medium',
      action: 'Call create_execution_plan',
      parameters: { userRequest: 'Break down this complex task into manageable steps' },
      description: 'Consider creating a structured execution plan for this complex request'
    });
  }

  // 根据情感色调添加建议
  if (analysis.emotionalTone === 'negative' || analysis.emotionalTone === 'urgent') {
    actions.push({
      priority: 'medium',
      action: 'Call summon_by_intent',
      parameters: { intent: 'support' },
      description: 'Consider activating supportive assistance for emotional context'
    });
  }

  return actions;
}