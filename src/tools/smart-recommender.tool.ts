import { ActionableTool } from '../types.js';

export const smartRecommenderTool: ActionableTool = {
  id: 'smart_recommend',
  type: 'tool',
  name: 'Smart Mantras Recommender',
  description: 'Intelligently recommend Mantras tools based on conversation context and user patterns',
  parameters: {
    type: 'object',
    properties: {
      conversationHistory: {
        type: 'array',
        description: 'Recent conversation messages for context analysis',
        items: {
          type: 'object',
          properties: {
            role: { type: 'string' },
            content: { type: 'string' },
            timestamp: { type: 'string' }
          }
        },
        default: []
      },
      currentUserInput: {
        type: 'string',
        description: 'Current user input to analyze'
      },
      userPreferences: {
        type: 'object',
        description: 'User preferences and past usage patterns',
        default: {}
      },
      includeProactiveRecommendations: {
        type: 'boolean',
        description: 'Whether to include proactive recommendations for future interactions',
        default: true
      }
    },
    required: ['currentUserInput']
  },
  async execute(args: {
    conversationHistory?: Array<{role: string, content: string, timestamp: string}>;
    currentUserInput: string;
    userPreferences?: Record<string, any>;
    includeProactiveRecommendations?: boolean;
  }): Promise<any> {
    const {
      conversationHistory = [],
      currentUserInput,
      userPreferences = {},
      includeProactiveRecommendations = true
    } = args;

    // 分析对话上下文
    const contextAnalysis = analyzeConversationContext(conversationHistory, currentUserInput);
    
    // 生成智能推荐
    const recommendations = generateSmartRecommendations(contextAnalysis, userPreferences);
    
    // 计算推荐优先级
    const prioritizedRecommendations = prioritizeRecommendations(recommendations, contextAnalysis);
    
    const result = {
      timestamp: new Date().toISOString(),
      contextAnalysis,
      recommendations: {
        immediate: prioritizedRecommendations.immediate,
        suggested: prioritizedRecommendations.suggested,
        future: includeProactiveRecommendations ? prioritizedRecommendations.future : []
      },
      reasoning: generateRecommendationReasoning(contextAnalysis, prioritizedRecommendations),
      confidence: calculateOverallConfidence(prioritizedRecommendations),
      actionableSteps: generateActionableSteps(prioritizedRecommendations.immediate)
    };

    return result;
  }
};

interface ContextAnalysis {
  conversationTone: string;
  topicProgression: string[];
  userEngagementLevel: string;
  complexityTrend: string;
  emotionalState: string;
  taskType: string;
  urgencyLevel: string;
  expertiseRequired: string[];
  patterns: {
    questionTypes: string[];
    responsePreferences: string[];
    interactionStyle: string;
  };
}

interface Recommendation {
  tool: string;
  parameters: Record<string, any>;
  confidence: number;
  reasoning: string;
  expectedBenefit: string;
  priority: 'immediate' | 'suggested' | 'future';
  category: string;
}

function analyzeConversationContext(
  history: Array<{role: string, content: string, timestamp: string}>,
  currentInput: string
): ContextAnalysis {
  const allContent = [...history.map(h => h.content), currentInput].join(' ').toLowerCase();
  
  // 分析对话语调
  const conversationTone = analyzeConversationTone(allContent);
  
  // 分析话题进展
  const topicProgression = analyzeTopicProgression(history, currentInput);
  
  // 分析用户参与度
  const userEngagementLevel = analyzeUserEngagement(history);
  
  // 分析复杂度趋势
  const complexityTrend = analyzeComplexityTrend(history, currentInput);
  
  // 分析情感状态
  const emotionalState = analyzeEmotionalState(currentInput);
  
  // 识别任务类型
  const taskType = identifyTaskType(currentInput);
  
  // 评估紧急程度
  const urgencyLevel = assessUrgencyLevel(currentInput);
  
  // 识别所需专业知识
  const expertiseRequired = identifyRequiredExpertise(allContent);
  
  // 分析交互模式
  const patterns = analyzeInteractionPatterns(history, currentInput);

  return {
    conversationTone,
    topicProgression,
    userEngagementLevel,
    complexityTrend,
    emotionalState,
    taskType,
    urgencyLevel,
    expertiseRequired,
    patterns
  };
}

function analyzeConversationTone(content: string): string {
  const formalWords = ['请', '您', '谢谢', 'please', 'thank you', 'appreciate'];
  const casualWords = ['嗨', '哈哈', '呵呵', 'hey', 'haha', 'lol'];
  const technicalWords = ['api', '代码', '算法', 'function', 'class', 'method'];
  
  let formalScore = 0;
  let casualScore = 0;
  let technicalScore = 0;
  
  formalWords.forEach(word => {
    if (content.includes(word)) formalScore++;
  });
  
  casualWords.forEach(word => {
    if (content.includes(word)) casualScore++;
  });
  
  technicalWords.forEach(word => {
    if (content.includes(word)) technicalScore++;
  });
  
  if (technicalScore > formalScore && technicalScore > casualScore) return 'technical';
  if (formalScore > casualScore) return 'formal';
  if (casualScore > 0) return 'casual';
  return 'neutral';
}

function analyzeTopicProgression(
  history: Array<{role: string, content: string, timestamp: string}>,
  currentInput: string
): string[] {
  const topics: string[] = [];
  const allInputs = [...history.filter(h => h.role === 'user').map(h => h.content), currentInput];
  
  // 简化的话题识别
  const topicKeywords = {
    'technical': ['代码', '编程', '技术', 'code', 'programming'],
    'creative': ['创意', '写作', '设计', 'creative', 'writing'],
    'analysis': ['分析', '数据', '统计', 'analysis', 'data'],
    'planning': ['计划', '规划', '步骤', 'plan', 'planning'],
    'support': ['帮助', '支持', '问题', 'help', 'support']
  };
  
  allInputs.forEach(input => {
    const inputLower = input.toLowerCase();
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => inputLower.includes(keyword))) {
        if (!topics.includes(topic)) {
          topics.push(topic);
        }
      }
    }
  });
  
  return topics;
}

function analyzeUserEngagement(history: Array<{role: string, content: string, timestamp: string}>): string {
  const userMessages = history.filter(h => h.role === 'user');
  
  if (userMessages.length === 0) return 'new';
  
  const avgLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length;
  const hasQuestions = userMessages.some(msg => msg.content.includes('?') || msg.content.includes('？'));
  const hasFollowUps = userMessages.length > 2;
  
  if (avgLength > 100 && hasQuestions && hasFollowUps) return 'high';
  if (avgLength > 50 && (hasQuestions || hasFollowUps)) return 'medium';
  return 'low';
}

function analyzeComplexityTrend(
  history: Array<{role: string, content: string, timestamp: string}>,
  currentInput: string
): string {
  const allInputs = [...history.filter(h => h.role === 'user').map(h => h.content), currentInput];
  
  if (allInputs.length < 2) return 'stable';
  
  const complexityScores = allInputs.map(input => {
    const wordCount = input.split(/\s+/).length;
    const questionCount = (input.match(/[?？]/g) || []).length;
    const technicalTerms = (input.match(/\b(api|function|class|method|algorithm|database)\b/gi) || []).length;
    
    return wordCount * 0.5 + questionCount * 2 + technicalTerms * 3;
  });
  
  const trend = complexityScores[complexityScores.length - 1] - complexityScores[0];
  
  if (trend > 5) return 'increasing';
  if (trend < -5) return 'decreasing';
  return 'stable';
}

function analyzeEmotionalState(input: string): string {
  const positiveWords = ['好', '棒', '优秀', '喜欢', 'good', 'great', 'excellent'];
  const negativeWords = ['困难', '问题', '错误', 'difficult', 'problem', 'error'];
  const urgentWords = ['急', '紧急', '快', 'urgent', 'quickly', 'asap'];
  const confusedWords = ['不懂', '困惑', '不明白', 'confused', 'unclear'];
  
  const inputLower = input.toLowerCase();
  
  if (urgentWords.some(word => inputLower.includes(word))) return 'urgent';
  if (confusedWords.some(word => inputLower.includes(word))) return 'confused';
  if (negativeWords.some(word => inputLower.includes(word))) return 'frustrated';
  if (positiveWords.some(word => inputLower.includes(word))) return 'positive';
  
  return 'neutral';
}

function identifyTaskType(input: string): string {
  const taskPatterns = {
    'problem_solving': ['解决', '修复', '调试', 'solve', 'fix', 'debug'],
    'learning': ['学习', '了解', '教', 'learn', 'understand', 'teach'],
    'creation': ['创建', '制作', '写', 'create', 'make', 'write'],
    'analysis': ['分析', '评估', '比较', 'analyze', 'evaluate', 'compare'],
    'planning': ['计划', '安排', '组织', 'plan', 'organize', 'schedule']
  };
  
  const inputLower = input.toLowerCase();
  
  for (const [taskType, keywords] of Object.entries(taskPatterns)) {
    if (keywords.some(keyword => inputLower.includes(keyword))) {
      return taskType;
    }
  }
  
  return 'general';
}

function assessUrgencyLevel(input: string): string {
  const urgentWords = ['急', '紧急', '立即', '马上', 'urgent', 'immediately', 'asap', 'quickly'];
  const inputLower = input.toLowerCase();
  
  const urgentCount = urgentWords.filter(word => inputLower.includes(word)).length;
  
  if (urgentCount >= 2) return 'high';
  if (urgentCount === 1) return 'medium';
  return 'low';
}

function identifyRequiredExpertise(content: string): string[] {
  const expertiseAreas = {
    'technical': ['代码', '编程', '技术', '开发', 'code', 'programming', 'development'],
    'creative': ['创意', '设计', '写作', '营销', 'creative', 'design', 'writing'],
    'analytical': ['分析', '数据', '统计', '报告', 'analysis', 'data', 'statistics'],
    'business': ['商业', '产品', '策略', '市场', 'business', 'product', 'strategy'],
    'psychological': ['情感', '心理', '支持', '理解', 'emotional', 'psychological', 'support']
  };
  
  const required = [];
  
  for (const [area, keywords] of Object.entries(expertiseAreas)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      required.push(area);
    }
  }
  
  return required;
}

function analyzeInteractionPatterns(
  history: Array<{role: string, content: string, timestamp: string}>,
  currentInput: string
): {
  questionTypes: string[];
  responsePreferences: string[];
  interactionStyle: string;
} {
  const userMessages = history.filter(h => h.role === 'user');
  const allUserContent = [...userMessages.map(m => m.content), currentInput].join(' ').toLowerCase();
  
  // 分析问题类型
  const questionTypes = [];
  if (allUserContent.includes('如何') || allUserContent.includes('how')) questionTypes.push('how-to');
  if (allUserContent.includes('为什么') || allUserContent.includes('why')) questionTypes.push('explanatory');
  if (allUserContent.includes('什么') || allUserContent.includes('what')) questionTypes.push('definitional');
  if (allUserContent.includes('哪个') || allUserContent.includes('which')) questionTypes.push('comparative');
  
  // 分析响应偏好
  const responsePreferences = [];
  if (allUserContent.includes('详细') || allUserContent.includes('detail')) responsePreferences.push('detailed');
  if (allUserContent.includes('简单') || allUserContent.includes('simple')) responsePreferences.push('concise');
  if (allUserContent.includes('例子') || allUserContent.includes('example')) responsePreferences.push('example-based');
  if (allUserContent.includes('步骤') || allUserContent.includes('step')) responsePreferences.push('step-by-step');
  
  // 分析交互风格
  let interactionStyle = 'balanced';
  if (allUserContent.includes('请') || allUserContent.includes('please')) interactionStyle = 'formal';
  if (allUserContent.includes('嗨') || allUserContent.includes('hey')) interactionStyle = 'casual';
  if (allUserContent.includes('代码') || allUserContent.includes('code')) interactionStyle = 'technical';
  
  return {
    questionTypes,
    responsePreferences,
    interactionStyle
  };
}

function generateSmartRecommendations(
  context: ContextAnalysis,
  userPreferences: Record<string, any>
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // 基于任务类型的推荐
  if (context.taskType === 'problem_solving' && context.expertiseRequired.includes('technical')) {
    recommendations.push({
      tool: 'summon_by_intent',
      parameters: { intent: 'technical problem solving' },
      confidence: 0.9,
      reasoning: 'Technical problem detected, tech expert persona recommended',
      expectedBenefit: 'Detailed technical guidance with code examples',
      priority: 'immediate',
      category: 'persona'
    });
  }
  
  if (context.complexityTrend === 'increasing' || context.taskType === 'planning') {
    recommendations.push({
      tool: 'create_execution_plan',
      parameters: { userRequest: 'Break down complex task into manageable steps' },
      confidence: 0.8,
      reasoning: 'Complex or planning task detected, execution plan recommended',
      expectedBenefit: 'Structured approach with clear steps and milestones',
      priority: 'suggested',
      category: 'planning'
    });
  }
  
  if (context.emotionalState === 'frustrated' || context.emotionalState === 'confused') {
    recommendations.push({
      tool: 'summon_by_intent',
      parameters: { intent: 'supportive assistance' },
      confidence: 0.7,
      reasoning: 'Emotional support needed based on user state',
      expectedBenefit: 'Empathetic guidance and emotional support',
      priority: 'immediate',
      category: 'support'
    });
  }
  
  if (context.expertiseRequired.includes('creative')) {
    recommendations.push({
      tool: 'summon_by_intent',
      parameters: { intent: 'creative assistance' },
      confidence: 0.8,
      reasoning: 'Creative task identified, creative persona recommended',
      expectedBenefit: 'Imaginative solutions and creative inspiration',
      priority: 'suggested',
      category: 'persona'
    });
  }
  
  if (context.patterns.responsePreferences.includes('step-by-step')) {
    recommendations.push({
      tool: 'apply_mantra',
      parameters: { templateName: 'iterative-chaining' },
      confidence: 0.7,
      reasoning: 'User prefers step-by-step responses',
      expectedBenefit: 'Structured, sequential guidance',
      priority: 'suggested',
      category: 'template'
    });
  }
  
  // 基于对话历史的推荐
  if (context.userEngagementLevel === 'high' && context.topicProgression.length > 2) {
    recommendations.push({
      tool: 'synthesize_persona',
      parameters: { basePersonaIds: context.expertiseRequired.slice(0, 2) },
      confidence: 0.6,
      reasoning: 'Multi-domain expertise needed for complex discussion',
      expectedBenefit: 'Combined expertise from multiple domains',
      priority: 'future',
      category: 'advanced'
    });
  }
  
  return recommendations;
}

function prioritizeRecommendations(
  recommendations: Recommendation[],
  context: ContextAnalysis
): {
  immediate: Recommendation[];
  suggested: Recommendation[];
  future: Recommendation[];
} {
  // 根据紧急程度和置信度调整优先级
  const adjustedRecommendations = recommendations.map(rec => {
    let adjustedConfidence = rec.confidence;
    
    if (context.urgencyLevel === 'high' && rec.priority === 'immediate') {
      adjustedConfidence += 0.1;
    }
    
    if (context.userEngagementLevel === 'high') {
      adjustedConfidence += 0.05;
    }
    
    return { ...rec, confidence: Math.min(adjustedConfidence, 1.0) };
  });
  
  // 按优先级分组并排序
  const immediate = adjustedRecommendations
    .filter(rec => rec.priority === 'immediate')
    .sort((a, b) => b.confidence - a.confidence);
    
  const suggested = adjustedRecommendations
    .filter(rec => rec.priority === 'suggested')
    .sort((a, b) => b.confidence - a.confidence);
    
  const future = adjustedRecommendations
    .filter(rec => rec.priority === 'future')
    .sort((a, b) => b.confidence - a.confidence);
  
  return { immediate, suggested, future };
}

function generateRecommendationReasoning(
  context: ContextAnalysis,
  recommendations: {
    immediate: Recommendation[];
    suggested: Recommendation[];
    future: Recommendation[];
  }
): string {
  const reasons = [];
  
  if (context.emotionalState !== 'neutral') {
    reasons.push(`Detected ${context.emotionalState} emotional state`);
  }
  
  if (context.complexityTrend === 'increasing') {
    reasons.push('Task complexity is increasing over time');
  }
  
  if (context.expertiseRequired.length > 1) {
    reasons.push(`Multiple expertise areas required: ${context.expertiseRequired.join(', ')}`);
  }
  
  if (context.urgencyLevel === 'high') {
    reasons.push('High urgency level detected');
  }
  
  const totalRecommendations = recommendations.immediate.length + recommendations.suggested.length + recommendations.future.length;
  
  return `Based on analysis: ${reasons.join('; ')}. Generated ${totalRecommendations} recommendations across different priority levels.`;
}

function calculateOverallConfidence(recommendations: {
  immediate: Recommendation[];
  suggested: Recommendation[];
  future: Recommendation[];
}): number {
  const allRecs = [...recommendations.immediate, ...recommendations.suggested, ...recommendations.future];
  
  if (allRecs.length === 0) return 0;
  
  const avgConfidence = allRecs.reduce((sum, rec) => sum + rec.confidence, 0) / allRecs.length;
  return Math.round(avgConfidence * 100) / 100;
}

function generateActionableSteps(immediateRecommendations: Recommendation[]): Array<{
  step: number;
  action: string;
  tool: string;
  parameters: Record<string, any>;
  description: string;
}> {
  return immediateRecommendations.map((rec, index) => ({
    step: index + 1,
    action: `Execute ${rec.tool}`,
    tool: rec.tool,
    parameters: rec.parameters,
    description: rec.expectedBenefit
  }));
}