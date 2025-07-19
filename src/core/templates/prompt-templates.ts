import { PromptTemplate } from '../../types';

/**
 * 基于《程序员的提示工程实战手册》的10大核心技巧模板
 * 每个模板都对应手册中的一个具体技巧
 */
export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'role-prompting',
    type: 'prompt-template',
    name: '角色提示',
    description: '设定专家角色获得高质量建议',
    technique: 'role_prompting',
    template: '你是一位资深的 {language} 开发者。请为了 {goal} 来审查这个函数：\n\n{code}',
    parameters: ['language', 'goal', 'code'],
    category: 'code-review'
  },
  
  {
    id: 'explicit-context',
    type: 'prompt-template',
    name: '明确上下文',
    description: '清晰框定问题避免模糊回答',
    technique: 'explicit_context',
    template: '问题是：{problem}。代码如下：\n\n{code}\n\n它本应 {expected}，但现在却 {actual}。这是为什么？',
    parameters: ['problem', 'code', 'expected', 'actual'],
    category: 'debugging'
  },

  {
    id: 'input-output-examples',
    type: 'prompt-template',
    name: '输入输出示例',
    description: '通过具体示例展示意图',
    technique: 'input_output_examples',
    template: '当输入为 {input} 时，这个函数应该返回 {output}。你能编写或修复这段代码吗？\n\n{code}',
    parameters: ['input', 'output', 'code'],
    category: 'implementation'
  },

  {
    id: 'iterative-chaining',
    type: 'prompt-template',
    name: '迭代式链条',
    description: '将复杂任务分解成连续小步骤',
    technique: 'iterative_chaining',
    template: '第一步，{step1}。下一步，{step2}。最后，{step3}。\n\n当前需要处理：{current_step}',
    parameters: ['step1', 'step2', 'step3', 'current_step'],
    category: 'planning'
  },

  {
    id: 'debug-simulation',
    type: 'prompt-template',
    name: '模拟调试',
    description: '让AI模拟代码运行时行为',
    technique: 'debug_simulation',
    template: '请逐行过一遍这个函数。每个变量的值是什么？代码最有可能在哪里出错？\n\n{code}\n\n特别关注：{focus_area}',
    parameters: ['code', 'focus_area'],
    category: 'debugging'
  },

  {
    id: 'feature-blueprinting',
    type: 'prompt-template',
    name: '功能蓝图',
    description: '借助AI主导的规划和脚手架能力',
    technique: 'feature_blueprinting',
    template: '我正在构建 {feature}。需求是：{requirements}。技术栈是：{tech_stack}。请搭建出初始组件的脚手架，并解释你的选择。',
    parameters: ['feature', 'requirements', 'tech_stack'],
    category: 'architecture'
  },

  {
    id: 'refactor-guidance',
    type: 'prompt-template',
    name: '重构指导',
    description: '确保重构与核心目标对齐',
    technique: 'refactor_guidance',
    template: '请重构这段代码以提升 {goal}，例如 {specific_aspects}。请用注释来解释你做了哪些更改。\n\n{code}',
    parameters: ['goal', 'specific_aspects', 'code'],
    category: 'refactoring'
  },

  {
    id: 'ask-alternatives',
    type: 'prompt-template',
    name: '寻求替代方案',
    description: '探索多种不同的实现路径',
    technique: 'ask_alternatives',
    template: '你能用 {alternative_style} 重写这段代码吗？如果用 {alternative_approach} 会是什么样子？\n\n{code}',
    parameters: ['alternative_style', 'alternative_approach', 'code'],
    category: 'optimization'
  },

  {
    id: 'rubber-ducking',
    type: 'prompt-template',
    name: '小黄鸭调试法',
    description: '通过解释来挑战理解并发现逻辑矛盾',
    technique: 'rubber_ducking',
    template: '我是这样理解这个函数功能的：{explanation}。我有什么遗漏吗？这个解释能暴露出什么 bug 吗？\n\n{code}',
    parameters: ['explanation', 'code'],
    category: 'debugging'
  },

  {
    id: 'constraint-anchoring',
    type: 'prompt-template',
    name: '约束锚定',
    description: '给AI设定明确的边界和限制',
    technique: 'constraint_anchoring',
    template: '请避免使用 {avoid}，并严格遵守 {constraints}。请为 {optimization_target} 进行优化。函数如下：\n\n{code}',
    parameters: ['avoid', 'constraints', 'optimization_target', 'code'],
    category: 'optimization'
  }
];

/**
 * 根据分类获取模板
 */
export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter(template => template.category === category);
}

/**
 * 根据技巧获取模板
 */
export function getTemplateByTechnique(technique: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find(template => template.technique === technique);
}

/**
 * 获取所有可用的分类
 */
export function getAvailableCategories(): string[] {
  return [...new Set(PROMPT_TEMPLATES.map(template => template.category))];
}