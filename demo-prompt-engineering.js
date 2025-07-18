#!/usr/bin/env node

/**
 * 提示工程增强功能演示脚本
 * 展示如何使用新的提示模板功能
 */

import { PROMPT_TEMPLATES, getTemplatesByCategory } from './dist/prompt-templates.js';

console.log('🎯 Mantras 提示工程增强功能演示\n');

// 1. 显示所有模板概览
console.log('📋 可用的提示模板 (共 ' + PROMPT_TEMPLATES.length + ' 个):');
console.log('=' .repeat(50));

PROMPT_TEMPLATES.forEach((template, index) => {
  console.log(`${index + 1}. ${template.name} (${template.id})`);
  console.log(`   技巧: ${template.technique}`);
  console.log(`   分类: ${template.category}`);
  console.log(`   参数: ${template.parameters.join(', ')}`);
  console.log(`   描述: ${template.description}\n`);
});

// 2. 按分类展示
console.log('\n🏷️  按分类分组:');
console.log('=' .repeat(50));

const categories = [...new Set(PROMPT_TEMPLATES.map(t => t.category))];
categories.forEach(category => {
  const templates = getTemplatesByCategory(category);
  console.log(`\n📁 ${category} (${templates.length} 个模板):`);
  templates.forEach(t => {
    console.log(`   • ${t.name} - ${t.description}`);
  });
});

// 3. 演示模板应用
console.log('\n\n🚀 模板应用演示:');
console.log('=' .repeat(50));

// 演示角色提示模板
const roleTemplate = PROMPT_TEMPLATES.find(t => t.id === 'role-prompting');
if (roleTemplate) {
  console.log('\n📝 角色提示模板演示:');
  console.log('模板:', roleTemplate.template);
  
  const inputs = {
    language: 'JavaScript',
    goal: '性能优化',
    code: 'function fibonacci(n) { if(n<=1) return n; return fibonacci(n-1) + fibonacci(n-2); }'
  };
  
  let result = roleTemplate.template;
  roleTemplate.parameters.forEach(param => {
    result = result.replace(new RegExp(`{${param}}`, 'g'), inputs[param] || '');
  });
  
  console.log('\n应用后的提示:');
  console.log('─'.repeat(40));
  console.log(result);
  console.log('─'.repeat(40));
}

// 4. 使用建议
console.log('\n\n💡 使用建议:');
console.log('=' .repeat(50));
console.log('1. 根据具体需求选择合适的模板');
console.log('2. 确保提供所有必需的参数');
console.log('3. 可以组合多个模板解决复杂问题');
console.log('4. 根据AI回复调整参数以获得更好效果');

console.log('\n✨ 开始使用 Mantras 提示工程功能吧！');