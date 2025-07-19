/**
 * 重新设计的人格系统 - 增强 Agent 主观能动性
 * 从"自动选择"转向"信息提供 + Agent 决策"
 */

import { ToolDefinition } from '../presentation/mcp/tool-registry';
import { z } from 'zod';

export function createPersonaDiscoveryTools(): ToolDefinition[] {
  return [
    {
      name: 'explore_personas',
      description: '探索可用人格，提供详细信息让 Agent 自主选择最合适的协作方式',
      schema: z.object({
        context: z.string().optional().describe('当前任务或对话上下文'),
        requirements: z.object({
          expertise: z.array(z.string()).optional().describe('需要的专业领域'),
          style: z.enum(['analytical', 'creative', 'practical', 'empathetic']).optional(),
          complexity: z.enum(['simple', 'moderate', 'complex']).optional()
        }).optional(),
        includeMetrics: z.boolean().default(true).describe('是否包含性能指标')
      }),
      handler: async ({ context, requirements, includeMetrics }) => {
        return {
          // 可用人格的全景视图
          availablePersonas: [
            {
              id: 'tech-expert',
              profile: {
                name: 'Technical Expert',
                description: '深度技术专家，擅长系统架构和代码优化',
                expertise: ['system_architecture', 'performance_optimization', 'code_review', 'best_practices'],
                communicationStyle: 'precise_and_detailed',
                thinkingPattern: 'systematic_and_logical',
                strengths: ['technical_depth', 'problem_solving', 'implementation_guidance'],
                limitations: ['may_be_too_technical', 'less_focus_on_user_experience']
              },
              contextualFit: {
                relevanceScore: 0.95,
                reasoning: '当前讨论涉及系统架构重设计，高度匹配技术专家能力',
                expectedContribution: '提供深度技术分析和具体实现方案',
                potentialChallenges: '可能过于关注技术细节而忽略用户体验'
              },
              performanceMetrics: includeMetrics ? {
                averageResponseQuality: 0.92,
                userSatisfactionRate: 0.89,
                problemSolvingSuccess: 0.94,
                collaborationEffectiveness: 0.87,
                recentUsageCount: 156,
                averageSessionDuration: '18 minutes'
              } : undefined,
              collaborationStyle: {
                preferredInteractionMode: 'deep_technical_discussion',
                questioningApproach: 'systematic_inquiry',
                solutionPresentation: 'structured_with_examples',
                feedbackStyle: 'constructive_and_specific'
              }
            },
            {
              id: 'creative',
              profile: {
                name: 'Creative Strategist',
                description: '创意思维专家，擅长用户体验和创新解决方案',
                expertise: ['user_experience', 'creative_problem_solving', 'storytelling', 'innovation'],
                communicationStyle: 'engaging_and_inspirational',
                thinkingPattern: 'divergent_and_holistic',
                strengths: ['out_of_box_thinking', 'user_empathy', 'visual_communication'],
                limitations: ['less_technical_depth', 'may_lack_implementation_details']
              },
              contextualFit: {
                relevanceScore: 0.72,
                reasoning: '虽然当前是技术讨论，但用户强调 Agent 主观能动性，需要创新思维',
                expectedContribution: '从用户体验角度重新思考 Agent 交互模式',
                potentialChallenges: '可能缺乏深度技术实现细节'
              },
              performanceMetrics: includeMetrics ? {
                averageResponseQuality: 0.88,
                userSatisfactionRate: 0.91,
                problemSolvingSuccess: 0.83,
                collaborationEffectiveness: 0.92,
                recentUsageCount: 89,
                averageSessionDuration: '22 minutes'
              } : undefined,
              collaborationStyle: {
                preferredInteractionMode: 'brainstorming_and_exploration',
                questioningApproach: 'open_ended_inquiry',
                solutionPresentation: 'narrative_with_scenarios',
                feedbackStyle: 'encouraging_and_expansive'
              }
            },
            {
              id: 'product-strategist',
              profile: {
                name: 'Product Strategist',
                description: '产品策略专家，平衡技术可行性和用户需求',
                expertise: ['product_strategy', 'user_research', 'requirement_analysis', 'roadmap_planning'],
                communicationStyle: 'balanced_and_strategic',
                thinkingPattern: 'user_centric_and_goal_oriented',
                strengths: ['stakeholder_alignment', 'priority_setting', 'user_advocacy'],
                limitations: ['may_compromise_technical_excellence', 'less_hands_on_implementation']
              },
              contextualFit: {
                relevanceScore: 0.85,
                reasoning: '用户关注 Agent 能动性体现了产品思维，需要平衡技术和体验',
                expectedContribution: '从产品角度分析 Agent 交互设计的用户价值',
                potentialChallenges: '可能在技术实现细节上不够深入'
              },
              performanceMetrics: includeMetrics ? {
                averageResponseQuality: 0.90,
                userSatisfactionRate: 0.93,
                problemSolvingSuccess: 0.88,
                collaborationEffectiveness: 0.95,
                recentUsageCount: 67,
                averageSessionDuration: '25 minutes'
              } : undefined,
              collaborationStyle: {
                preferredInteractionMode: 'strategic_discussion',
                questioningApproach: 'goal_oriented_inquiry',
                solutionPresentation: 'framework_based_analysis',
                feedbackStyle: 'strategic_and_actionable'
              }
            }
          ],
          
          // 组合协作建议
          collaborationOptions: [
            {
              type: 'single_persona',
              recommendation: 'tech-expert',
              reasoning: '技术问题为主，单一专家可以提供深度分析',
              pros: ['专业深度', '实现细节', '技术最佳实践'],
              cons: ['可能缺乏用户视角', '解决方案可能过于技术化']
            },
            {
              type: 'sequential_collaboration',
              sequence: ['product-strategist', 'tech-expert'],
              reasoning: '先从产品角度分析需求，再深入技术实现',
              pros: ['全面分析', '平衡技术和用户需求', '结构化方法'],
              cons: ['耗时较长', '需要协调不同观点']
            },
            {
              type: 'parallel_perspectives',
              personas: ['tech-expert', 'creative'],
              reasoning: '同时获得技术深度和创新思维',
              pros: ['多角度分析', '创新解决方案', '技术可行性验证'],
              cons: ['可能产生冲突观点', '需要 Agent 整合不同建议']
            }
          ],
          
          // Agent 决策支持框架
          decisionFramework: {
            selectionCriteria: [
              {
                factor: 'problem_complexity',
                weight: 0.3,
                guidance: '复杂技术问题优选技术专家，用户体验问题优选创意或产品专家'
              },
              {
                factor: 'user_expertise_level',
                weight: 0.25,
                guidance: '高技术水平用户可以直接与技术专家对话，普通用户需要更多解释'
              },
              {
                factor: 'time_constraints',
                weight: 0.2,
                guidance: '紧急问题选择单一专家，充足时间可以考虑多人格协作'
              },
              {
                factor: 'innovation_requirements',
                weight: 0.25,
                guidance: '需要创新突破时优选创意专家，标准实现选择技术专家'
              }
            ],
            
            decisionQuestions: [
              '这个问题主要是技术实现还是概念设计？',
              '用户更希望看到具体代码还是设计思路？',
              '是否需要考虑多个利益相关者的观点？',
              '解决方案的创新性有多重要？'
            ]
          },
          
          // 实时状态和建议
          systemRecommendation: {
            suggestedApproach: 'sequential_collaboration',
            primaryPersona: 'product-strategist',
            reasoning: '用户提出的是系统设计哲学问题，建议先从产品角度分析 Agent 能动性的价值，再深入技术实现',
            confidence: 0.82,
            alternativeOptions: [
              {
                approach: 'tech-expert_only',
                confidence: 0.75,
                reasoning: '如果用户主要关注技术实现细节'
              }
            ]
          }
        };
      },
      metadata: {
        category: 'persona_discovery',
        version: '2.0.0',
        tags: ['persona_exploration', 'decision_support', 'collaboration_planning']
      }
    },

    {
      name: 'preview_persona_interaction',
      description: '预览与特定人格的交互模式，让 Agent 了解协作效果',
      schema: z.object({
        personaId: z.string().describe('要预览的人格 ID'),
        sampleQuery: z.string().describe('示例查询或任务'),
        interactionStyle: z.enum(['brief', 'detailed', 'interactive']).default('detailed')
      }),
      handler: async ({ personaId, sampleQuery, interactionStyle }) => {
        return {
          interactionPreview: {
            personaResponse: {
              approach: '系统性分析当前 summon_by_intent 的设计问题',
              keyPoints: [
                '分析当前实现的决策逻辑',
                '识别限制 Agent 自主性的具体环节',
                '设计新的信息提供模式',
                '保持 MCP 工具的价值同时增强 Agent 控制权'
              ],
              communicationStyle: 'structured_technical_analysis',
              expectedQuestions: [
                '您希望 Agent 在什么程度上参与人格选择决策？',
                '当前的自动选择机制中哪些部分最需要改进？',
                '新设计应该如何平衡便利性和控制权？'
              ],
              deliverables: [
                '问题分析报告',
                '重新设计的架构方案',
                '具体的代码实现示例',
                '迁移和测试计划'
              ]
            },
            
            collaborationDynamics: {
              agentRole: 'strategic_coordinator',
              personaRole: 'technical_advisor',
              interactionPattern: 'agent_led_with_expert_input',
              decisionMaking: 'agent_decides_based_on_expert_analysis',
              informationFlow: 'bidirectional_with_agent_synthesis'
            },
            
            expectedOutcomes: {
              shortTerm: '清晰的问题理解和解决方案框架',
              mediumTerm: '可实施的技术改进方案',
              longTerm: '增强的 Agent-MCP 协作模式',
              userSatisfaction: 'high',
              agentLearning: 'significant_architecture_insights'
            },
            
            potentialChallenges: [
              '技术复杂性可能需要多轮迭代',
              '需要平衡多个设计目标',
              '可能需要重构现有代码'
            ],
            
            mitigationStrategies: [
              '分阶段实施，先验证核心概念',
              '保持向后兼容性',
              '充分的测试和用户反馈收集'
            ]
          }
        };
      },
      metadata: {
        category: 'interaction_preview',
        version: '2.0.0',
        tags: ['collaboration_preview', 'interaction_modeling', 'decision_support']
      }
    },

    {
      name: 'customize_collaboration',
      description: '让 Agent 自定义与人格的协作方式和参数',
      schema: z.object({
        personaId: z.string().describe('选择的人格 ID'),
        collaborationPreferences: z.object({
          communicationStyle: z.enum(['concise', 'detailed', 'interactive']).optional(),
          focusAreas: z.array(z.string()).optional(),
          outputFormat: z.enum(['analysis', 'recommendations', 'implementation', 'discussion']).optional(),
          interactionMode: z.enum(['advisory', 'collaborative', 'consultative']).optional()
        }),
        sessionGoals: z.array(z.string()).optional().describe('本次协作的具体目标')
      }),
      handler: async ({ personaId, collaborationPreferences, sessionGoals }) => {
        return {
          customizedSession: {
            sessionId: `session_${Date.now()}`,
            personaConfiguration: {
              id: personaId,
              adaptedPersonality: {
                communicationStyle: collaborationPreferences.communicationStyle || 'detailed',
                focusAreas: collaborationPreferences.focusAreas || ['technical_analysis', 'solution_design'],
                responseFormat: collaborationPreferences.outputFormat || 'analysis'
              },
              roleDefinition: {
                primary: 'technical_advisor',
                secondary: 'implementation_guide',
                boundaries: ['不替代 Agent 决策', '提供分析而非结论', '支持而非主导']
              }
            },
            
            collaborationProtocol: {
              initiationPhase: {
                agentActions: ['设定会话目标', '明确期望输出', '定义成功标准'],
                personaActions: ['确认理解', '提出澄清问题', '建议分析框架']
              },
              workingPhase: {
                agentActions: ['引导讨论方向', '综合不同观点', '做出关键决策'],
                personaActions: ['提供专业分析', '提出多个选项', '解释利弊权衡']
              },
              conclusionPhase: {
                agentActions: ['总结关键洞察', '制定行动计划', '评估协作效果'],
                personaActions: ['确认理解准确性', '提供实施建议', '标识风险点']
              }
            },
            
            qualityAssurance: {
              checkpoints: [
                '目标对齐确认',
                '中期进展评估',
                '最终输出验证'
              ],
              successMetrics: [
                'Agent 保持决策主导权',
                '人格提供有价值的专业输入',
                '协作产生高质量输出'
              ]
            }
          }
        };
      },
      metadata: {
        category: 'collaboration_customization',
        version: '2.0.0',
        tags: ['session_management', 'collaboration_design', 'agent_empowerment']
      }
    }
  ];
}