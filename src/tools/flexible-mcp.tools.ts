/**
 * 重新设计的 MCP 工具 - 最大化外部调用灵活性
 * 核心原则：MCP 提供数据和选项，决策权完全交给外部调用者
 */

import { ToolDefinition } from '../presentation/mcp/tool-registry';
import { z } from 'zod';

/**
 * 意图分析工具 - 纯数据提供，无内置决策
 */
export function createFlexibleAnalysisTools(): ToolDefinition[] {
  return [
    {
      name: 'analyze_user_input',
      description: '分析用户输入的多维度信息，提供结构化数据供外部决策使用',
      schema: z.object({
        input: z.string().describe('用户输入内容'),
        context: z.string().optional().describe('上下文信息'),
        analysisOptions: z.object({
          includeKeywords: z.boolean().default(true),
          includeEmotion: z.boolean().default(true),
          includeComplexity: z.boolean().default(true),
          includeDomain: z.boolean().default(true),
          includeIntent: z.boolean().default(true),
          customAnalysis: z.array(z.string()).optional().describe('自定义分析维度')
        }).optional()
      }),
      handler: async ({ input, context, analysisOptions = {} }) => {
        const result: any = {
          rawInput: input,
          context: context || null,
          timestamp: new Date().toISOString()
        };

        // 根据参数决定分析内容
        if (analysisOptions.includeKeywords) {
          result.keywords = extractKeywords(input);
        }

        if (analysisOptions.includeEmotion) {
          result.emotionalTone = analyzeEmotion(input);
        }

        if (analysisOptions.includeComplexity) {
          result.complexity = assessComplexity(input);
        }

        if (analysisOptions.includeDomain) {
          result.domain = identifyDomain(input);
        }

        if (analysisOptions.includeIntent) {
          result.possibleIntents = identifyPossibleIntents(input);
        }

        // 自定义分析
        if (analysisOptions.customAnalysis) {
          result.customAnalysis = {};
          for (const dimension of analysisOptions.customAnalysis) {
            result.customAnalysis[dimension] = performCustomAnalysis(input, dimension);
          }
        }

        return result;
      },
      metadata: {
        category: 'analysis',
        version: '2.0.0',
        tags: ['flexible', 'configurable', 'data_provider']
      }
    },

    {
      name: 'get_resource_catalog',
      description: '获取系统资源目录，支持灵活的过滤和排序参数',
      schema: z.object({
        resourceTypes: z.array(z.enum(['personas', 'mantras', 'tools', 'templates'])).optional(),
        filters: z.object({
          category: z.string().optional(),
          tags: z.array(z.string()).optional(),
          capabilities: z.array(z.string()).optional(),
          complexity: z.enum(['simple', 'moderate', 'complex']).optional(),
          domain: z.string().optional()
        }).optional(),
        sorting: z.object({
          field: z.enum(['name', 'relevance', 'usage', 'rating', 'date']).default('name'),
          order: z.enum(['asc', 'desc']).default('asc')
        }).optional(),
        pagination: z.object({
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0)
        }).optional(),
        includeMetrics: z.boolean().default(false),
        includeDetails: z.boolean().default(true)
      }),
      handler: async ({ resourceTypes, filters, sorting, pagination, includeMetrics, includeDetails }) => {
        // 获取所有资源
        let resources = await getAllResources();

        // 应用类型过滤
        if (resourceTypes && resourceTypes.length > 0) {
          resources = resources.filter(r => resourceTypes.includes(r.type as any));
        }

        // 应用过滤器
        if (filters) {
          resources = applyFilters(resources, filters);
        }

        // 应用排序
        if (sorting) {
          resources = applySorting(resources, sorting);
        }

        // 应用分页
        const total = resources.length;
        if (pagination) {
          resources = resources.slice(pagination.offset, pagination.offset + pagination.limit);
        }

        // 构建响应
        const response: any = {
          resources: resources.map(r => formatResource(r, includeDetails, includeMetrics)),
          pagination: {
            total,
            limit: pagination?.limit || total,
            offset: pagination?.offset || 0,
            hasMore: pagination ? (pagination.offset + pagination.limit) < total : false
          },
          appliedFilters: filters || {},
          appliedSorting: sorting || { field: 'name', order: 'asc' }
        };

        return response;
      },
      metadata: {
        category: 'resource_discovery',
        version: '2.0.0',
        tags: ['flexible', 'filterable', 'paginated']
      }
    },

    {
      name: 'calculate_compatibility_scores',
      description: '计算资源与需求的兼容性分数，支持自定义权重和评分标准',
      schema: z.object({
        requirements: z.object({
          domain: z.string().optional(),
          complexity: z.enum(['simple', 'moderate', 'complex']).optional(),
          style: z.enum(['analytical', 'creative', 'practical', 'empathetic']).optional(),
          capabilities: z.array(z.string()).optional(),
          constraints: z.object({
            maxTime: z.number().optional(),
            preferredLength: z.enum(['brief', 'moderate', 'detailed']).optional(),
            tone: z.enum(['formal', 'casual', 'friendly', 'professional']).optional()
          }).optional()
        }),
        resources: z.array(z.string()).optional().describe('资源ID列表，为空则评估所有资源'),
        scoringWeights: z.object({
          domainMatch: z.number().min(0).max(1).default(0.3),
          capabilityMatch: z.number().min(0).max(1).default(0.3),
          styleMatch: z.number().min(0).max(1).default(0.2),
          constraintMatch: z.number().min(0).max(1).default(0.2)
        }).optional(),
        includeExplanation: z.boolean().default(true),
        minScore: z.number().min(0).max(1).default(0.0).describe('最低分数阈值')
      }),
      handler: async ({ requirements, resources, scoringWeights, includeExplanation, minScore }) => {
        const weights = scoringWeights || {
          domainMatch: 0.3,
          capabilityMatch: 0.3,
          styleMatch: 0.2,
          constraintMatch: 0.2
        };

        // 获取要评估的资源
        const targetResources = resources 
          ? await getResourcesByIds(resources)
          : await getAllResources();

        // 计算兼容性分数
        const scores = targetResources.map(resource => {
          const score = calculateCompatibilityScore(resource, requirements, weights);
          
          const result: any = {
            resourceId: resource.id,
            resourceType: resource.type,
            resourceName: resource.name,
            totalScore: score.total,
            componentScores: score.components
          };

          if (includeExplanation) {
            result.explanation = generateScoreExplanation(resource, requirements, score);
          }

          return result;
        }).filter(score => score.totalScore >= minScore);

        // 按分数排序
        scores.sort((a, b) => b.totalScore - a.totalScore);

        return {
          scores,
          requirements,
          scoringWeights: weights,
          totalEvaluated: targetResources.length,
          qualifiedCount: scores.length,
          evaluationTimestamp: new Date().toISOString()
        };
      },
      metadata: {
        category: 'scoring',
        version: '2.0.0',
        tags: ['flexible', 'weighted', 'configurable']
      }
    },

    {
      name: 'generate_option_matrix',
      description: '生成选项矩阵，支持多维度比较和自定义评估标准',
      schema: z.object({
        options: z.array(z.string()).describe('要比较的选项ID列表'),
        comparisonDimensions: z.array(z.object({
          name: z.string(),
          weight: z.number().min(0).max(1),
          criteria: z.enum(['performance', 'usability', 'flexibility', 'cost', 'time', 'quality', 'custom']),
          customCriteria: z.string().optional()
        })),
        matrixFormat: z.enum(['detailed', 'summary', 'scores_only']).default('detailed'),
        includeRecommendations: z.boolean().default(false),
        customMetrics: z.record(z.string()).optional().describe('自定义评估指标')
      }),
      handler: async ({ options, comparisonDimensions, matrixFormat, includeRecommendations, customMetrics }) => {
        // 获取选项详情
        const optionDetails = await getResourcesByIds(options);

        // 构建比较矩阵
        const matrix = optionDetails.map(option => {
          const optionRow: any = {
            optionId: option.id,
            optionName: option.name,
            optionType: option.type
          };

          // 按维度评估
          const dimensionScores: any = {};
          let totalWeightedScore = 0;

          for (const dimension of comparisonDimensions) {
            const score = evaluateOptionOnDimension(option, dimension, customMetrics);
            dimensionScores[dimension.name] = {
              score,
              weight: dimension.weight,
              weightedScore: score * dimension.weight
            };
            totalWeightedScore += score * dimension.weight;
          }

          optionRow.dimensionScores = dimensionScores;
          optionRow.totalScore = totalWeightedScore;

          if (matrixFormat === 'detailed') {
            optionRow.details = getOptionDetails(option);
          }

          return optionRow;
        });

        // 排序
        matrix.sort((a, b) => b.totalScore - a.totalScore);

        const result: any = {
          matrix,
          comparisonDimensions,
          matrixFormat,
          evaluationTimestamp: new Date().toISOString()
        };

        if (includeRecommendations) {
          result.recommendations = generateMatrixRecommendations(matrix, comparisonDimensions);
        }

        return result;
      },
      metadata: {
        category: 'comparison',
        version: '2.0.0',
        tags: ['matrix', 'multi_dimensional', 'weighted']
      }
    },

    {
      name: 'get_contextual_suggestions',
      description: '基于上下文生成建议，完全由参数控制建议类型和数量',
      schema: z.object({
        context: z.object({
          currentTask: z.string().optional(),
          userProfile: z.object({
            expertiseLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
            preferences: z.array(z.string()).optional(),
            constraints: z.record(z.any()).optional()
          }).optional(),
          sessionHistory: z.array(z.object({
            action: z.string(),
            timestamp: z.string(),
            outcome: z.string().optional()
          })).optional(),
          environment: z.record(z.any()).optional()
        }),
        suggestionTypes: z.array(z.enum([
          'next_actions',
          'alternative_approaches',
          'optimization_opportunities',
          'risk_mitigation',
          'resource_recommendations',
          'workflow_improvements',
          'custom'
        ])),
        suggestionCount: z.object({
          min: z.number().min(1).default(1),
          max: z.number().min(1).default(10),
          preferred: z.number().min(1).default(5)
        }).optional(),
        prioritization: z.object({
          criteria: z.enum(['relevance', 'impact', 'feasibility', 'urgency', 'custom']),
          customCriteria: z.string().optional()
        }).optional(),
        customParameters: z.record(z.any()).optional()
      }),
      handler: async ({ context, suggestionTypes, suggestionCount, prioritization, customParameters }) => {
        const suggestions: any[] = [];

        // 为每种建议类型生成建议
        for (const type of suggestionTypes) {
          const typeSuggestions = await generateSuggestionsByType(
            type, 
            context, 
            suggestionCount, 
            customParameters
          );
          suggestions.push(...typeSuggestions);
        }

        // 应用优先级排序
        if (prioritization) {
          suggestions.sort((a, b) => 
            calculatePriority(b, prioritization, context) - 
            calculatePriority(a, prioritization, context)
          );
        }

        // 限制数量
        const finalCount = suggestionCount?.preferred || 5;
        const finalSuggestions = suggestions.slice(0, finalCount);

        return {
          suggestions: finalSuggestions,
          context,
          appliedTypes: suggestionTypes,
          prioritization: prioritization || null,
          totalGenerated: suggestions.length,
          returned: finalSuggestions.length,
          generationTimestamp: new Date().toISOString()
        };
      },
      metadata: {
        category: 'suggestions',
        version: '2.0.0',
        tags: ['contextual', 'prioritized', 'configurable']
      }
    }
  ];
}

// 辅助函数 - 这些应该是纯函数，不包含决策逻辑
function extractKeywords(input: string): string[] {
  // 简单的关键词提取逻辑
  return input.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 10);
}

function analyzeEmotion(input: string): { tone: string; confidence: number; indicators: string[] } {
  // 简单的情感分析
  const positiveWords = ['好', '优秀', '棒', '喜欢', '满意'];
  const negativeWords = ['差', '糟糕', '问题', '困难', '失望'];
  
  const positive = positiveWords.some(word => input.includes(word));
  const negative = negativeWords.some(word => input.includes(word));
  
  if (positive && !negative) return { tone: 'positive', confidence: 0.7, indicators: ['positive_keywords'] };
  if (negative && !positive) return { tone: 'negative', confidence: 0.7, indicators: ['negative_keywords'] };
  return { tone: 'neutral', confidence: 0.8, indicators: ['balanced_tone'] };
}

function assessComplexity(input: string): { level: string; factors: string[]; score: number } {
  const factors = [];
  let score = 0;
  
  if (input.length > 100) { factors.push('long_input'); score += 0.3; }
  if (input.includes('架构') || input.includes('系统')) { factors.push('technical_terms'); score += 0.4; }
  if (input.includes('优化') || input.includes('改进')) { factors.push('improvement_request'); score += 0.3; }
  
  const level = score > 0.6 ? 'complex' : score > 0.3 ? 'moderate' : 'simple';
  return { level, factors, score };
}

function identifyDomain(input: string): { primary: string; secondary: string[]; confidence: number } {
  const domains = {
    'technical': ['架构', '代码', '系统', '技术', '开发'],
    'business': ['业务', '商业', '策略', '管理', '运营'],
    'creative': ['创意', '设计', '艺术', '创新', '想法'],
    'analytical': ['分析', '数据', '统计', '研究', '评估']
  };
  
  const scores: Record<string, number> = {};
  
  for (const [domain, keywords] of Object.entries(domains)) {
    scores[domain] = keywords.filter(keyword => input.includes(keyword)).length;
  }
  
  const primary = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
  const secondary = Object.entries(scores)
    .filter(([domain, score]) => domain !== primary && score > 0)
    .map(([domain]) => domain);
  
  return { primary, secondary, confidence: scores[primary] > 0 ? 0.8 : 0.3 };
}

function identifyPossibleIntents(input: string): Array<{ intent: string; confidence: number; indicators: string[] }> {
  const intentPatterns = {
    'help_request': ['帮助', '协助', '支持', '指导'],
    'information_seeking': ['什么', '如何', '为什么', '哪里'],
    'problem_solving': ['问题', '解决', '修复', '改进'],
    'optimization': ['优化', '提升', '改善', '增强'],
    'creation': ['创建', '制作', '设计', '开发']
  };
  
  return Object.entries(intentPatterns).map(([intent, patterns]) => {
    const indicators = patterns.filter(pattern => input.includes(pattern));
    const confidence = indicators.length > 0 ? Math.min(indicators.length * 0.3, 0.9) : 0.1;
    return { intent, confidence, indicators };
  }).filter(item => item.confidence > 0.2);
}

function performCustomAnalysis(input: string, dimension: string): any {
  // 可扩展的自定义分析框架
  return {
    dimension,
    result: `Custom analysis for ${dimension}`,
    confidence: 0.5,
    metadata: { analyzed_at: new Date().toISOString() }
  };
}

// 其他辅助函数的占位符实现
async function getAllResources(): Promise<any[]> {
  return []; // 实际实现应该从数据源获取
}

function applyFilters(resources: any[], filters: any): any[] {
  return resources; // 实际实现应该应用过滤逻辑
}

function applySorting(resources: any[], sorting: any): any[] {
  return resources; // 实际实现应该应用排序逻辑
}

function formatResource(resource: any, includeDetails: boolean, includeMetrics: boolean): any {
  return resource; // 实际实现应该格式化资源
}

async function getResourcesByIds(ids: string[]): Promise<any[]> {
  return []; // 实际实现应该根据ID获取资源
}

function calculateCompatibilityScore(resource: any, requirements: any, weights: any): any {
  return { total: 0.5, components: {} }; // 实际实现应该计算兼容性分数
}

function generateScoreExplanation(resource: any, requirements: any, score: any): string {
  return "Score explanation"; // 实际实现应该生成解释
}

function evaluateOptionOnDimension(option: any, dimension: any, customMetrics: any): number {
  return 0.5; // 实际实现应该评估选项
}

function getOptionDetails(option: any): any {
  return {}; // 实际实现应该获取选项详情
}

function generateMatrixRecommendations(matrix: any[], dimensions: any[]): any[] {
  return []; // 实际实现应该生成推荐
}

async function generateSuggestionsByType(type: string, context: any, count: any, params: any): Promise<any[]> {
  return []; // 实际实现应该生成建议
}

function calculatePriority(suggestion: any, prioritization: any, context: any): number {
  return 0.5; // 实际实现应该计算优先级
}