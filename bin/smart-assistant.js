#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 智能模板助手 - 提供模板相关的智能建议和自动化功能
 */
class SmartTemplateAssistant {
  constructor() {
    this.templatesDir = './assets/prompt-templates';
    this.snippetsPath = './templates/prompt-snippets.md';
  }

  /**
   * 分析现有模板，提供优化建议
   */
  async analyzeTemplates() {
    console.log('🔍 分析现有模板...\n');
    
    const files = await fs.readdir(this.templatesDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const analysis = {
      totalTemplates: jsonFiles.length,
      categories: {},
      difficulties: {},
      parameterUsage: {},
      suggestions: []
    };

    for (const file of jsonFiles) {
      const content = await fs.readFile(path.join(this.templatesDir, file), 'utf-8');
      const template = JSON.parse(content);
      
      // 统计分类
      analysis.categories[template.category] = (analysis.categories[template.category] || 0) + 1;
      
      // 统计难度
      const difficulty = template.metadata?.difficulty || 'unknown';
      analysis.difficulties[difficulty] = (analysis.difficulties[difficulty] || 0) + 1;
      
      // 统计参数使用
      template.parameters?.forEach(param => {
        analysis.parameterUsage[param] = (analysis.parameterUsage[param] || 0) + 1;
      });
      
      // 检查潜在问题
      if (!template.examples || template.examples.length === 0) {
        analysis.suggestions.push(`${template.name} 缺少使用示例`);
      }
      
      if (template.parameters?.length > 5) {
        analysis.suggestions.push(`${template.name} 参数过多 (${template.parameters.length}个)，建议简化`);
      }
      
      if (!template.metadata?.rating || template.metadata.rating === 0) {
        analysis.suggestions.push(`${template.name} 缺少用户评分`);
      }
    }

    this.printAnalysisReport(analysis);
    return analysis;
  }

  printAnalysisReport(analysis) {
    console.log('📊 模板分析报告');
    console.log('================\n');
    
    console.log(`📈 总体统计:`);
    console.log(`   模板总数: ${analysis.totalTemplates}`);
    console.log(`   分类数量: ${Object.keys(analysis.categories).length}`);
    console.log(`   参数类型: ${Object.keys(analysis.parameterUsage).length}\n`);
    
    console.log('📋 分类分布:');
    Object.entries(analysis.categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}个`);
    });
    console.log();
    
    console.log('🎯 难度分布:');
    Object.entries(analysis.difficulties).forEach(([difficulty, count]) => {
      console.log(`   ${difficulty}: ${count}个`);
    });
    console.log();
    
    console.log('🔧 常用参数:');
    const sortedParams = Object.entries(analysis.parameterUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    sortedParams.forEach(([param, count]) => {
      console.log(`   {${param}}: 使用${count}次`);
    });
    console.log();
    
    if (analysis.suggestions.length > 0) {
      console.log('💡 优化建议:');
      analysis.suggestions.forEach(suggestion => {
        console.log(`   • ${suggestion}`);
      });
      console.log();
    }
  }

  /**
   * 智能推荐模板结构
   */
  async recommendTemplate(intent, domain) {
    console.log(`🤖 为 "${intent}" 在 "${domain}" 领域推荐模板结构...\n`);
    
    const recommendations = {
      debugging: {
        structure: ['问题描述', '代码展示', '预期行为', '实际行为', '环境信息'],
        parameters: ['problem', 'code', 'expected', 'actual', 'environment'],
        snippets: ['角色设定', '任务描述', '上下文', '输出格式']
      },
      'code-review': {
        structure: ['角色设定', '审查目标', '代码内容', '关注点', '输出要求'],
        parameters: ['role', 'goal', 'code', 'focus_areas', 'format'],
        snippets: ['角色设定', '任务描述', '约束条件', '输出格式']
      },
      optimization: {
        structure: ['专家角色', '优化目标', '当前代码', '约束条件', '期望结果'],
        parameters: ['expert_type', 'optimization_goal', 'code', 'constraints', 'expected_result'],
        snippets: ['角色设定', '任务描述', '约束条件', '输出格式']
      },
      architecture: {
        structure: ['架构师角色', '项目需求', '技术栈', '约束条件', '输出格式'],
        parameters: ['architect_type', 'requirements', 'tech_stack', 'constraints', 'output_format'],
        snippets: ['角色设定', '上下文', '约束条件', '输出格式']
      }
    };

    const recommendation = recommendations[domain] || recommendations.debugging;
    
    console.log('📋 推荐模板结构:');
    recommendation.structure.forEach((section, index) => {
      console.log(`   ${index + 1}. ${section}`);
    });
    console.log();
    
    console.log('🔧 建议参数:');
    recommendation.parameters.forEach(param => {
      console.log(`   {${param}}`);
    });
    console.log();
    
    console.log('🧩 推荐片段:');
    recommendation.snippets.forEach(snippet => {
      console.log(`   • ${snippet}`);
    });
    console.log();
    
    return recommendation;
  }

  /**
   * 自动生成模板骨架
   */
  async generateTemplateSkeleton(name, category, parameters) {
    const skeleton = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      type: 'prompt-template',
      name: name,
      description: `${name}的提示模板`,
      version: '1.0.0',
      author: 'mantras-team',
      tags: [category],
      technique: name.toLowerCase().replace(/\s+/g, '_'),
      template: this.generateTemplateContent(parameters),
      parameters: parameters,
      category: category,
      examples: [
        {
          name: '基础示例',
          inputs: parameters.reduce((acc, param) => {
            acc[param] = `示例${param}`;
            return acc;
          }, {}),
          expectedOutput: '根据模板生成的专业建议'
        }
      ],
      metadata: {
        created: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        usageCount: 0,
        rating: 0.0,
        difficulty: 'beginner'
      }
    };

    return skeleton;
  }

  generateTemplateContent(parameters) {
    const commonStructures = {
      role: '你是一位资深的 {role} 专家。',
      task: '请帮我 {action} 以下内容：',
      code: '\n{code}\n',
      context: '背景信息：{context}',
      goal: '目标：{goal}',
      constraints: '约束条件：{constraints}',
      format: '请按以下格式输出：\n1. 分析\n2. 建议\n3. 示例'
    };

    let template = '';
    
    // 智能组合模板内容
    if (parameters.includes('role')) {
      template += commonStructures.role + '\n\n';
    }
    
    if (parameters.includes('action') || parameters.includes('task')) {
      template += commonStructures.task + '\n';
    }
    
    if (parameters.includes('code')) {
      template += commonStructures.code;
    }
    
    if (parameters.includes('context')) {
      template += '\n' + commonStructures.context + '\n';
    }
    
    if (parameters.includes('goal')) {
      template += '\n' + commonStructures.goal + '\n';
    }
    
    if (parameters.includes('constraints')) {
      template += '\n' + commonStructures.constraints + '\n';
    }
    
    // 添加其他参数
    parameters.forEach(param => {
      if (!['role', 'action', 'task', 'code', 'context', 'goal', 'constraints'].includes(param)) {
        template += `\n{${param}}\n`;
      }
    });
    
    template += '\n' + commonStructures.format;
    
    return template.trim();
  }

  /**
   * 检查模板质量
   */
  async checkTemplateQuality(templateId) {
    const filePath = path.join(this.templatesDir, `${templateId}.json`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const template = JSON.parse(content);
      
      const quality = {
        score: 0,
        maxScore: 100,
        issues: [],
        suggestions: []
      };

      // 检查基础信息完整性 (20分)
      if (template.name && template.description) quality.score += 10;
      if (template.tags && template.tags.length > 0) quality.score += 5;
      if (template.category) quality.score += 5;

      // 检查模板内容质量 (30分)
      if (template.template && template.template.length > 50) quality.score += 15;
      if (template.parameters && template.parameters.length > 0) quality.score += 10;
      if (template.parameters && template.parameters.length <= 5) quality.score += 5;

      // 检查示例完整性 (25分)
      if (template.examples && template.examples.length > 0) {
        quality.score += 15;
        if (template.examples.some(ex => ex.inputs && ex.expectedOutput)) {
          quality.score += 10;
        }
      } else {
        quality.issues.push('缺少使用示例');
      }

      // 检查元数据完整性 (25分)
      if (template.metadata) {
        if (template.metadata.difficulty) quality.score += 5;
        if (template.metadata.created) quality.score += 5;
        if (template.metadata.rating !== undefined) quality.score += 5;
        if (template.version) quality.score += 10;
      } else {
        quality.issues.push('缺少元数据');
      }

      // 生成改进建议
      if (quality.score < 60) {
        quality.suggestions.push('模板质量较低，建议完善基础信息和示例');
      }
      if (!template.examples || template.examples.length === 0) {
        quality.suggestions.push('添加实际使用示例');
      }
      if (template.parameters && template.parameters.length > 5) {
        quality.suggestions.push('参数过多，考虑简化');
      }
      if (!template.description || template.description.length < 20) {
        quality.suggestions.push('完善模板描述');
      }

      return quality;
    } catch (error) {
      return {
        score: 0,
        maxScore: 100,
        issues: [`无法读取模板文件: ${error.message}`],
        suggestions: ['检查文件是否存在且格式正确']
      };
    }
  }

  /**
   * 批量质量检查
   */
  async batchQualityCheck() {
    console.log('🔍 批量质量检查...\n');
    
    const files = await fs.readdir(this.templatesDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const results = [];
    
    for (const file of jsonFiles) {
      const templateId = file.replace('.json', '');
      const quality = await this.checkTemplateQuality(templateId);
      results.push({
        id: templateId,
        score: quality.score,
        issues: quality.issues,
        suggestions: quality.suggestions
      });
    }

    // 排序并显示结果
    results.sort((a, b) => b.score - a.score);
    
    console.log('📊 质量检查结果:');
    console.log('================\n');
    
    results.forEach(result => {
      const grade = result.score >= 80 ? '🟢' : result.score >= 60 ? '🟡' : '🔴';
      console.log(`${grade} ${result.id}: ${result.score}/100`);
      
      if (result.issues.length > 0) {
        console.log(`   问题: ${result.issues.join(', ')}`);
      }
      if (result.suggestions.length > 0) {
        console.log(`   建议: ${result.suggestions.join(', ')}`);
      }
      console.log();
    });

    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    console.log(`📈 平均质量分数: ${avgScore.toFixed(1)}/100`);
    
    return results;
  }
}

// 导出助手类
export { SmartTemplateAssistant };

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  const assistant = new SmartTemplateAssistant();
  
  const action = process.argv[2];
  
  switch (action) {
    case 'analyze':
      await assistant.analyzeTemplates();
      break;
    case 'quality':
      await assistant.batchQualityCheck();
      break;
    case 'recommend':
      const intent = process.argv[3] || 'debugging';
      const domain = process.argv[4] || 'code-review';
      await assistant.recommendTemplate(intent, domain);
      break;
    default:
      console.log(`使用方法:
  node smart-assistant.js analyze     # 分析现有模板
  node smart-assistant.js quality     # 批量质量检查
  node smart-assistant.js recommend [intent] [domain]  # 推荐模板结构
      `);
  }
}