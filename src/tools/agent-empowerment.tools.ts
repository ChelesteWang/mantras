/**
 * 增强 Agent 主观能动性的工具设计
 * 重新设计 MCP 工具，让 Agent 自主决策而非被动接受
 */

import { ToolDefinition } from '../presentation/mcp/tool-registry';
import { z } from 'zod';

/**
 * 意图分析工具 - 提供分析结果而非直接决策
 */
export function createIntentAnalysisTools(): ToolDefinition[] {
  return [
    {
      name: 'analyze_intent',
      description: '分析用户意图并提供多维度洞察，让 Agent 自主决策如何响应',
      schema: z.object({
        userInput: z.string().describe('用户的输入内容'),
        context: z.string().optional().describe('对话上下文'),
        analysisDepth: z
          .enum(['basic', 'detailed', 'comprehensive'])
          .default('detailed')
          .describe('分析深度'),
      }),
      handler: async ({
        userInput: _userInput,
        context: _context,
        analysisDepth: _analysisDepth,
      }) => {
        return {
          // 意图分析结果
          intentAnalysis: {
            primaryIntent: {
              category: 'technical_assistance',
              confidence: 0.85,
              keywords: ['架构', '设计', 'Agent', '能力'],
              emotionalTone: 'constructive_criticism',
            },
            secondaryIntents: [
              { category: 'system_improvement', confidence: 0.7 },
              { category: 'user_experience_enhancement', confidence: 0.6 },
            ],
            complexity: 'high',
            urgency: 'medium',
            domain: 'software_architecture',
          },

          // 推荐的响应策略（供 Agent 参考）
          responseStrategies: [
            {
              strategy: 'technical_deep_dive',
              suitability: 0.9,
              description: '深入技术分析和解决方案设计',
              expectedOutcome: '提供具体的技术改进方案',
            },
            {
              strategy: 'collaborative_exploration',
              suitability: 0.8,
              description: '与用户协作探索最佳解决方案',
              expectedOutcome: '通过对话逐步完善方案',
            },
            {
              strategy: 'prototype_demonstration',
              suitability: 0.7,
              description: '通过代码示例展示改进思路',
              expectedOutcome: '直观展示技术实现',
            },
          ],

          // 相关资源建议
          relevantResources: {
            personas: [
              {
                id: 'tech-expert',
                relevance: 0.95,
                reason: '技术架构设计专长',
                capabilities: ['system_design', 'code_architecture', 'best_practices'],
              },
              {
                id: 'product-strategist',
                relevance: 0.7,
                reason: '用户体验和产品策略视角',
                capabilities: ['user_experience', 'product_strategy', 'requirement_analysis'],
              },
            ],
            mantras: [
              {
                id: 'feature-blueprinting',
                relevance: 0.9,
                reason: '适合系统功能设计',
                useCase: '结构化地设计新功能',
              },
              {
                id: 'refactor-guidance',
                relevance: 0.85,
                reason: '适合代码重构指导',
                useCase: '系统性地改进现有代码',
              },
            ],
            tools: ['create_execution_plan', 'get_project_context', 'list_personas'],
          },

          // Agent 决策支持信息
          decisionSupport: {
            keyConsiderations: [
              '用户强调 Agent 主观能动性的重要性',
              '需要平衡 MCP 功能性和 Agent 自主性',
              '技术改进应该增强而非替代 Agent 能力',
            ],
            riskFactors: ['过度自动化可能降低 Agent 创造性', '需要保持用户体验的流畅性'],
            successCriteria: [
              'Agent 能够基于 MCP 信息自主决策',
              '用户感受到 Agent 的智能和主动性',
              'MCP 工具提供价值而不越俎代庖',
            ],
          },
        };
      },
      metadata: {
        category: 'intelligence_enhancement',
        version: '2.0.0',
        tags: ['intent_analysis', 'decision_support', 'agent_empowerment'],
      },
    },

    {
      name: 'explore_response_options',
      description: '探索多种响应选项，让 Agent 选择最合适的方式',
      schema: z.object({
        intent: z.string().describe('已识别的用户意图'),
        constraints: z
          .object({
            timeLimit: z.number().optional().describe('时间限制（分钟）'),
            complexityLevel: z.enum(['simple', 'moderate', 'complex']).optional(),
            preferredStyle: z.enum(['analytical', 'creative', 'practical']).optional(),
          })
          .optional(),
      }),
      handler: async ({ intent: _intent, constraints: _constraints }) => {
        return {
          responseOptions: [
            {
              approach: 'immediate_solution',
              description: '直接提供解决方案和代码实现',
              pros: ['快速解决问题', '立即可用'],
              cons: ['可能缺乏深度思考', '用户参与度低'],
              estimatedTime: '15-30分钟',
              complexity: 'moderate',
              agentAutonomy: 'medium',
            },
            {
              approach: 'collaborative_design',
              description: '与用户协作设计解决方案',
              pros: ['深度理解需求', '用户参与度高', '方案更贴合实际'],
              cons: ['耗时较长', '需要多轮交互'],
              estimatedTime: '45-60分钟',
              complexity: 'high',
              agentAutonomy: 'high',
            },
            {
              approach: 'guided_exploration',
              description: '引导用户自主发现解决方案',
              pros: ['用户学习效果好', 'Agent 展现引导能力'],
              cons: ['可能效率较低', '需要高超的引导技巧'],
              estimatedTime: '30-45分钟',
              complexity: 'high',
              agentAutonomy: 'very_high',
            },
          ],

          // 混合策略建议
          hybridStrategies: [
            {
              name: 'progressive_revelation',
              description: '逐步展示解决方案，同时收集用户反馈',
              steps: [
                '分析问题并提出初步思路',
                '征求用户意见和偏好',
                '基于反馈调整方案',
                '实现并验证解决方案',
              ],
            },
          ],

          // 上下文适应建议
          contextualAdaptations: {
            userExpertiseLevel: 'high',
            suggestedApproach: 'collaborative_design',
            reasoning: '用户展现了深度技术理解，适合协作式设计',
          },
        };
      },
      metadata: {
        category: 'strategy_planning',
        version: '2.0.0',
        tags: ['response_planning', 'strategy_selection', 'agent_empowerment'],
      },
    },

    {
      name: 'get_capability_matrix',
      description: '获取当前可用能力的全景视图，让 Agent 了解所有选项',
      schema: z.object({
        domain: z.string().optional().describe('特定领域过滤'),
        includeMetrics: z.boolean().default(true).describe('是否包含性能指标'),
      }),
      handler: async ({ domain: _domain, includeMetrics: _includeMetrics }) => {
        return {
          availableCapabilities: {
            personas: {
              technical: [
                {
                  id: 'tech-expert',
                  strengths: ['system_architecture', 'code_optimization', 'best_practices'],
                  weaknesses: ['user_experience_design', 'business_strategy'],
                  bestUseCases: ['technical_problem_solving', 'code_review', 'architecture_design'],
                  currentLoad: 'low',
                  averageResponseQuality: 0.92,
                },
              ],
              creative: [
                {
                  id: 'creative',
                  strengths: ['ideation', 'storytelling', 'user_experience'],
                  weaknesses: ['technical_implementation', 'data_analysis'],
                  bestUseCases: ['content_creation', 'brainstorming', 'user_journey_design'],
                  currentLoad: 'medium',
                  averageResponseQuality: 0.88,
                },
              ],
            },

            mantras: {
              planning: [
                {
                  id: 'feature-blueprinting',
                  effectiveness: 0.9,
                  usageCount: 156,
                  averageCompletionTime: '12 minutes',
                  userSatisfaction: 0.94,
                },
              ],
              optimization: [
                {
                  id: 'refactor-guidance',
                  effectiveness: 0.87,
                  usageCount: 89,
                  averageCompletionTime: '18 minutes',
                  userSatisfaction: 0.91,
                },
              ],
            },

            tools: {
              analysis: ['analyze_intent', 'get_project_context'],
              execution: ['create_execution_plan', 'apply_mantra'],
              management: ['manage_memory', 'list_active_sessions'],
            },
          },

          // 能力组合建议
          capabilityCombinations: [
            {
              name: 'technical_deep_dive',
              components: ['tech-expert', 'feature-blueprinting', 'get_project_context'],
              synergy: 0.95,
              description: '深度技术分析和解决方案设计',
            },
            {
              name: 'user_centric_design',
              components: ['creative', 'product-strategist', 'constraint-anchoring'],
              synergy: 0.88,
              description: '以用户为中心的产品设计',
            },
          ],

          // 实时状态
          systemStatus: {
            totalActivePersonas: 2,
            averageResponseTime: '1.2s',
            memoryUtilization: '34%',
            cacheHitRate: '87%',
          },
        };
      },
      metadata: {
        category: 'system_intelligence',
        version: '2.0.0',
        tags: ['capability_discovery', 'system_overview', 'decision_support'],
      },
    },

    {
      name: 'suggest_next_actions',
      description: '基于当前上下文建议可能的下一步行动，但不强制执行',
      schema: z.object({
        currentContext: z.string().describe('当前对话或任务上下文'),
        userGoals: z.array(z.string()).optional().describe('用户的目标列表'),
        timeConstraints: z.string().optional().describe('时间约束'),
      }),
      handler: async ({
        currentContext: _currentContext,
        userGoals: _userGoals,
        timeConstraints: _timeConstraints,
      }) => {
        return {
          actionSuggestions: [
            {
              action: 'deep_technical_analysis',
              priority: 'high',
              reasoning: '用户提出了具体的技术改进需求',
              estimatedImpact: 'high',
              prerequisites: ['获取项目详细信息', '理解当前架构限制'],
              nextSteps: [
                '分析当前 summon_by_intent 实现',
                '设计新的 Agent 决策支持系统',
                '创建原型验证概念',
              ],
            },
            {
              action: 'collaborative_requirement_gathering',
              priority: 'medium',
              reasoning: '可以更好地理解用户的具体需求',
              estimatedImpact: 'medium',
              prerequisites: ['建立对话框架'],
              nextSteps: ['询问具体的使用场景', '了解期望的 Agent 行为', '收集性能和体验要求'],
            },
          ],

          // 决策树
          decisionTree: {
            rootQuestion: '用户希望立即看到改进还是参与设计过程？',
            branches: [
              {
                condition: '立即改进',
                action: 'implement_quick_solution',
                confidence: 0.7,
              },
              {
                condition: '参与设计',
                action: 'collaborative_design_session',
                confidence: 0.9,
              },
            ],
          },

          // 风险评估
          riskAssessment: {
            lowRisk: ['收集更多需求信息', '创建设计文档'],
            mediumRisk: ['修改现有代码', '改变 API 接口'],
            highRisk: ['重构核心架构', '改变用户体验流程'],
          },
        };
      },
      metadata: {
        category: 'action_planning',
        version: '2.0.0',
        tags: ['next_steps', 'action_suggestions', 'decision_support'],
      },
    },
  ];
}

/**
 * Agent 增强工具集 - 提升 Agent 的感知和决策能力
 */
export function createAgentEnhancementTools(): ToolDefinition[] {
  return [
    {
      name: 'reflect_on_conversation',
      description: 'Agent 反思当前对话，识别模式和改进机会',
      schema: z.object({
        conversationHistory: z
          .array(
            z.object({
              role: z.enum(['user', 'assistant']),
              content: z.string(),
              timestamp: z.string(),
            })
          )
          .optional(),
        focusAreas: z.array(z.string()).optional().describe('重点关注的方面'),
      }),
      handler: async ({ conversationHistory: _conversationHistory, focusAreas: _focusAreas }) => {
        return {
          conversationInsights: {
            userCommunicationStyle: 'direct_and_technical',
            userExpertiseLevel: 'high',
            userPreferences: [
              'detailed_explanations',
              'code_examples',
              'architectural_discussions',
            ],
            conversationFlow:
              'problem_identification -> solution_exploration -> implementation_planning',
            emotionalTone: 'constructive_and_collaborative',
          },

          agentPerformanceReflection: {
            strengths: ['technical_accuracy', 'comprehensive_analysis'],
            improvementAreas: ['user_autonomy_preservation', 'decision_transparency'],
            missedOpportunities: ['asking_clarifying_questions', 'offering_multiple_approaches'],
            successfulStrategies: ['structured_responses', 'code_examples'],
          },

          adaptationSuggestions: [
            '增加更多开放式问题来了解用户偏好',
            '提供多个解决方案选项而非单一答案',
            '在实施前征求用户的意见和反馈',
          ],
        };
      },
      metadata: {
        category: 'self_improvement',
        version: '2.0.0',
        tags: ['reflection', 'conversation_analysis', 'agent_learning'],
      },
    },
  ];
}
