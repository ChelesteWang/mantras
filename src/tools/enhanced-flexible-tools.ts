/**
 * 使用标准化工具基类重构现有工具的示例
 */

import { z } from 'zod';
import { StandardMCPTool, ToolMetadata, EnhancedToolRegistry } from '../shared/tools/standard-mcp-tool';

// 重构后的意图分析工具
export class FlexibleIntentAnalyzer extends StandardMCPTool<
  {
    input: string;
    context?: string;
    analysisOptions: {
      includeKeywords?: boolean;
      includeEmotion?: boolean;
      includeComplexity?: boolean;
      includeDomain?: boolean;
      customDimensions?: string[];
    };
  },
  {
    rawInput: string;
    context: string | null;
    keywords?: string[];
    emotion?: { tone: string; confidence: number; indicators: string[] };
    complexity?: { level: string; factors: string[]; score: number };
    domain?: { primary: string; secondary: string[]; confidence: number };
    customAnalysis?: Record<string, any>;
    timestamp: string;
  }
> {
  readonly name = 'flexible_intent_analyzer';
  readonly description = '灵活的意图分析工具，支持完全可配置的分析维度';
  readonly schema = z.object({
    input: z.string().min(1).describe('用户输入内容'),
    context: z.string().optional().describe('上下文信息'),
    analysisOptions: z.object({
      includeKeywords: z.boolean().default(true).describe('是否提取关键词'),
      includeEmotion: z.boolean().default(true).describe('是否分析情感'),
      includeComplexity: z.boolean().default(true).describe('是否评估复杂度'),
      includeDomain: z.boolean().default(true).describe('是否识别领域'),
      customDimensions: z.array(z.string()).optional().describe('自定义分析维度')
    })
  });
  readonly metadata: ToolMetadata = {
    category: 'analysis',
    version: '2.0.0',
    tags: ['intent', 'analysis', 'flexible', 'configurable'],
    rateLimit: {
      maxRequests: 200,
      windowMs: 60000
    }
  };

  protected async executeCore(input: {
    input: string;
    context?: string;
    analysisOptions: {
      includeKeywords?: boolean;
      includeEmotion?: boolean;
      includeComplexity?: boolean;
      includeDomain?: boolean;
      customDimensions?: string[];
    };
  }) {
    const result: any = {
      rawInput: input.input,
      context: input.context || null,
      timestamp: new Date().toISOString()
    };

    // 根据配置执行不同的分析
    if (input.analysisOptions.includeKeywords) {
      result.keywords = this.extractKeywords(input.input);
    }

    if (input.analysisOptions.includeEmotion) {
      result.emotion = this.analyzeEmotion(input.input);
    }

    if (input.analysisOptions.includeComplexity) {
      result.complexity = this.assessComplexity(input.input);
    }

    if (input.analysisOptions.includeDomain) {
      result.domain = this.identifyDomain(input.input);
    }

    // 自定义分析
    if (input.analysisOptions.customDimensions?.length) {
      result.customAnalysis = {};
      for (const dimension of input.analysisOptions.customDimensions) {
        result.customAnalysis[dimension] = await this.performCustomAnalysis(input.input, dimension);
      }
    }

    return result;
  }

  private extractKeywords(input: string): string[] {
    return input.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 10);
  }

  private analyzeEmotion(input: string): { tone: string; confidence: number; indicators: string[] } {
    const positiveWords = ['好', '优秀', '棒', '喜欢', '满意', '完美', '出色'];
    const negativeWords = ['差', '糟糕', '问题', '困难', '失望', '错误', '失败'];
    
    const positive = positiveWords.filter(word => input.includes(word));
    const negative = negativeWords.filter(word => input.includes(word));
    
    if (positive.length > negative.length) {
      return { tone: 'positive', confidence: 0.7 + (positive.length * 0.1), indicators: positive };
    }
    if (negative.length > positive.length) {
      return { tone: 'negative', confidence: 0.7 + (negative.length * 0.1), indicators: negative };
    }
    return { tone: 'neutral', confidence: 0.8, indicators: ['balanced_tone'] };
  }

  private assessComplexity(input: string): { level: string; factors: string[]; score: number } {
    const factors = [];
    let score = 0;
    
    if (input.length > 100) { factors.push('long_input'); score += 0.3; }
    if (input.includes('架构') || input.includes('系统') || input.includes('设计')) { 
      factors.push('technical_terms'); score += 0.4; 
    }
    if (input.includes('优化') || input.includes('改进') || input.includes('提升')) { 
      factors.push('improvement_request'); score += 0.3; 
    }
    if (input.includes('如何') || input.includes('为什么') || input.includes('怎么')) { 
      factors.push('question_complexity'); score += 0.2; 
    }
    
    const level = score > 0.6 ? 'complex' : score > 0.3 ? 'moderate' : 'simple';
    return { level, factors, score: Math.min(score, 1.0) };
  }

  private identifyDomain(input: string): { primary: string; secondary: string[]; confidence: number } {
    const domains = {
      'technical': ['架构', '代码', '系统', '技术', '开发', '编程', '算法', '数据库'],
      'business': ['业务', '商业', '策略', '管理', '运营', '市场', '销售', '客户'],
      'creative': ['创意', '设计', '艺术', '创新', '想法', '美学', '视觉', '品牌'],
      'analytical': ['分析', '数据', '统计', '研究', '评估', '指标', '报告', '洞察']
    };
    
    const scores: Record<string, number> = {};
    
    for (const [domain, keywords] of Object.entries(domains)) {
      scores[domain] = keywords.filter(keyword => input.includes(keyword)).length;
    }
    
    const entries = Object.entries(scores);
    const primary = entries.reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    const secondary = entries
      .filter(([domain, score]) => domain !== primary && score > 0)
      .map(([domain]) => domain);
    
    const maxScore = Math.max(...Object.values(scores));
    const confidence = maxScore > 0 ? Math.min(0.5 + (maxScore * 0.2), 0.95) : 0.3;
    
    return { primary, secondary, confidence };
  }

  private async performCustomAnalysis(input: string, dimension: string): Promise<any> {
    // 可扩展的自定义分析框架
    const analysisMap: Record<string, (input: string) => any> = {
      'urgency': (text) => ({
        level: text.includes('紧急') || text.includes('立即') ? 'high' : 'normal',
        indicators: ['紧急', '立即', '马上'].filter(word => text.includes(word))
      }),
      'sentiment': (text) => ({
        score: this.calculateSentimentScore(text),
        classification: this.classifySentiment(text)
      }),
      'technical_depth': (text) => ({
        score: this.assessTechnicalDepth(text),
        indicators: this.getTechnicalIndicators(text)
      })
    };

    const analyzer = analysisMap[dimension];
    if (analyzer) {
      return analyzer(input);
    }

    return {
      dimension,
      result: `Custom analysis for ${dimension}`,
      confidence: 0.5,
      metadata: { analyzed_at: new Date().toISOString() }
    };
  }

  private calculateSentimentScore(text: string): number {
    // 简化的情感分数计算
    const positiveWords = ['好', '优秀', '棒', '喜欢', '满意'];
    const negativeWords = ['差', '糟糕', '问题', '困难', '失望'];
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    return (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1);
  }

  private classifySentiment(text: string): string {
    const score = this.calculateSentimentScore(text);
    if (score > 0.3) return 'positive';
    if (score < -0.3) return 'negative';
    return 'neutral';
  }

  private assessTechnicalDepth(text: string): number {
    const technicalTerms = ['架构', '算法', '数据结构', '设计模式', '性能优化', '并发', '分布式'];
    const matches = technicalTerms.filter(term => text.includes(term)).length;
    return Math.min(matches / technicalTerms.length, 1.0);
  }

  private getTechnicalIndicators(text: string): string[] {
    const technicalTerms = ['架构', '算法', '数据结构', '设计模式', '性能优化', '并发', '分布式'];
    return technicalTerms.filter(term => text.includes(term));
  }
}

// 重构后的资源发现工具
export class FlexibleResourceDiscovery extends StandardMCPTool<any, any> {
  readonly name = 'flexible_resource_discovery';
  readonly description = '灵活的资源发现工具，支持多维度过滤、排序和分页';
  readonly schema = z.object({
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
  });
  readonly metadata: ToolMetadata = {
    category: 'resource_discovery',
    version: '2.0.0',
    tags: ['resources', 'discovery', 'flexible', 'filterable'],
    rateLimit: {
      maxRequests: 500,
      windowMs: 60000
    }
  };

  protected async executeCore(input: {
    resourceTypes?: ('personas' | 'mantras' | 'tools' | 'templates')[];
    filters?: any;
    sorting?: any;
    pagination?: any;
    includeMetrics?: boolean;
    includeDetails?: boolean;
  }) {
    const startTime = Date.now();
    
    // 模拟资源获取
    let resources = await this.getAllResources();
    const totalAvailable = resources.length;

    // 应用类型过滤
    if (input.resourceTypes && input.resourceTypes.length > 0) {
      resources = resources.filter(r => input.resourceTypes!.includes(r.type));
    }

    // 应用过滤器
    if (input.filters) {
      resources = this.applyFilters(resources, input.filters);
    }

    // 应用排序
    const sorting = input.sorting || { field: 'name', order: 'asc' };
    resources = this.applySorting(resources, sorting);

    // 应用分页
    const pagination = input.pagination || { limit: 20, offset: 0 };
    const total = resources.length;
    const paginatedResources = resources.slice(pagination.offset, pagination.offset + pagination.limit);

    // 格式化资源
    const formattedResources = paginatedResources.map(r => 
      this.formatResource(r, input.includeDetails || true, input.includeMetrics || false)
    );

    return {
      resources: formattedResources,
      pagination: {
        total,
        limit: pagination.limit,
        offset: pagination.offset,
        hasMore: (pagination.offset + pagination.limit) < total
      },
      appliedFilters: input.filters || {},
      appliedSorting: sorting,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalAvailable,
        filteringTime: Date.now() - startTime
      }
    };
  }

  private async getAllResources(): Promise<any[]> {
    // 模拟资源数据
    return [
      { id: 'tech-expert', type: 'personas', name: 'Technical Expert', category: 'technical', tags: ['programming', 'architecture'] },
      { id: 'creative', type: 'personas', name: 'Creative Writer', category: 'creative', tags: ['writing', 'design'] },
      { id: 'feature-blueprinting', type: 'mantras', name: 'Feature Blueprinting', category: 'planning', tags: ['architecture', 'planning'] }
    ];
  }

  private applyFilters(resources: any[], filters: any): any[] {
    return resources.filter(resource => {
      if (filters.category && resource.category !== filters.category) return false;
      if (filters.tags && !filters.tags.some((tag: string) => resource.tags?.includes(tag))) return false;
      if (filters.domain && resource.domain !== filters.domain) return false;
      return true;
    });
  }

  private applySorting(resources: any[], sorting: any): any[] {
    return resources.sort((a, b) => {
      const aValue = a[sorting.field] || '';
      const bValue = b[sorting.field] || '';
      
      const comparison = aValue.localeCompare(bValue);
      return sorting.order === 'desc' ? -comparison : comparison;
    });
  }

  private formatResource(resource: any, includeDetails: boolean, includeMetrics: boolean): any {
    const formatted: any = {
      id: resource.id,
      type: resource.type,
      name: resource.name
    };

    if (includeDetails) {
      formatted.category = resource.category;
      formatted.tags = resource.tags;
      formatted.description = resource.description;
    }

    if (includeMetrics) {
      formatted.metrics = {
        usageCount: Math.floor(Math.random() * 1000),
        rating: Math.random() * 5,
        lastUsed: new Date().toISOString()
      };
    }

    return formatted;
  }
}

// 使用示例和测试
export async function demonstrateEnhancedTools() {
  console.log('🚀 演示增强的 MCP 工具');
  
  // 创建工具注册表
  const registry = new EnhancedToolRegistry();
  
  // 注册工具
  const intentAnalyzer = new FlexibleIntentAnalyzer();
  const resourceDiscovery = new FlexibleResourceDiscovery();
  
  registry.register(intentAnalyzer);
  registry.register(resourceDiscovery);
  
  console.log('✅ 工具注册完成');
  
  // 测试意图分析工具
  console.log('\n📊 测试意图分析工具:');
  const analysisResult = await registry.executeTool('flexible_intent_analyzer', {
    input: '我希望优化这个项目的工程架构，提升性能和可维护性',
    analysisOptions: {
      includeKeywords: true,
      includeEmotion: true,
      includeComplexity: true,
      includeDomain: true,
      customDimensions: ['urgency', 'technical_depth']
    }
  });
  
  console.log('分析结果:', JSON.stringify(analysisResult, null, 2));
  
  // 测试资源发现工具
  console.log('\n🔍 测试资源发现工具:');
  const discoveryResult = await registry.executeTool('flexible_resource_discovery', {
    resourceTypes: ['personas', 'mantras'],
    filters: {
      tags: ['architecture', 'technical']
    },
    sorting: {
      field: 'name',
      order: 'asc'
    },
    pagination: {
      limit: 5,
      offset: 0
    },
    includeMetrics: true,
    includeDetails: true
  });
  
  console.log('发现结果:', JSON.stringify(discoveryResult, null, 2));
  
  // 获取工具指标
  console.log('\n📈 工具执行指标:');
  const metrics = registry.getMetrics();
  console.log('指标:', metrics);
  
  // 健康检查
  console.log('\n🏥 健康检查:');
  const healthResults = await registry.healthCheckAll();
  console.log('健康状态:', healthResults);
  
  return {
    analysisResult,
    discoveryResult,
    metrics,
    healthResults
  };
}