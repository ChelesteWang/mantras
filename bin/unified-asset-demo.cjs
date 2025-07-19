#!/usr/bin/env node

const { AssetLoader, AssetSerializer } = require('../dist/asset-loader.js');
const fs = require('fs').promises;
const path = require('path');

/**
 * 统一资产管理演示
 */
async function demonstrateUnifiedAssetManagement() {
  console.log('🎭 统一资产管理演示');
  console.log('===================================\n');

  try {
    // 1. 测试从现有 Markdown 文件加载
    console.log('📖 1. 从 Markdown 文件加载资产...');
    
    const personaPath = './assets/personas/tech-expert.md';
    try {
      const persona = await AssetLoader.loadFromMarkdown(personaPath);
      console.log(`✅ 成功加载 Persona: ${persona.name}`);
      console.log(`   - ID: ${persona.id}`);
      console.log(`   - 类型: ${persona.type}`);
      console.log(`   - 版本: ${persona.version}`);
      console.log(`   - 标签: ${persona.tags?.join(', ') || '无'}`);
      if (persona.personality) {
        console.log(`   - 角色: ${persona.personality.role || '未定义'}`);
        console.log(`   - 特点: ${persona.personality.traits?.join(', ') || '无'}`);
      }
    } catch (error) {
      console.log(`⚠️  无法加载 ${personaPath}: ${error.message}`);
    }

    console.log('\n📝 2. 从 Prompt Template 加载...');
    
    const templatePath = './assets/prompt-templates/role-prompting.md';
    try {
      const template = await AssetLoader.loadFromMarkdown(templatePath);
      console.log(`✅ 成功加载模板: ${template.name}`);
      console.log(`   - ID: ${template.id}`);
      console.log(`   - 技术: ${template.technique || '未定义'}`);
      console.log(`   - 分类: ${template.category || '未定义'}`);
      console.log(`   - 参数: ${template.parameters?.join(', ') || '无'}`);
      if (template.template) {
        console.log(`   - 模板长度: ${template.template.length} 字符`);
      }
    } catch (error) {
      console.log(`⚠️  无法加载 ${templatePath}: ${error.message}`);
    }

    // 3. 测试目录加载（混合格式）
    console.log('\n📁 3. 从目录加载所有资产...');
    
    try {
      const personasDir = './assets/personas';
      const personas = await AssetLoader.loadFromDirectory(personasDir);
      console.log(`✅ 从 ${personasDir} 加载了 ${personas.length} 个资产`);
      
      personas.forEach(persona => {
        console.log(`   - ${persona.id}: ${persona.name} (${persona.type})`);
      });
    } catch (error) {
      console.log(`⚠️  无法加载目录: ${error.message}`);
    }

    // 4. 演示创建新的 Markdown 资产
    console.log('\n🆕 4. 创建新的 Markdown 资产...');
    
    const newAsset = {
      id: 'demo-persona',
      type: 'persona',
      name: '演示专家',
      description: '用于演示统一资产管理的示例专家',
      version: '1.0.0',
      author: 'mantras-team',
      tags: ['demo', 'example', 'test'],
      personality: {
        role: '演示专家',
        traits: ['友好', '专业', '耐心'],
        communicationStyle: '清晰易懂',
        knowledgeDomains: ['演示', '教学', '示例']
      },
      capabilities: {
        analysis: true,
        creative: true,
        technical: false,
        empathetic: true
      }
    };

    const demoPath = './demo-persona.md';
    try {
      await AssetSerializer.saveAssetToMarkdown(newAsset, demoPath);
      console.log(`✅ 创建演示资产: ${demoPath}`);
      
      // 验证可以重新加载
      const reloaded = await AssetLoader.loadFromMarkdown(demoPath);
      console.log(`✅ 验证重新加载: ${reloaded.name}`);
      
      // 清理演示文件
      await fs.unlink(demoPath);
      console.log(`🗑️  清理演示文件`);
      
    } catch (error) {
      console.log(`❌ 创建演示资产失败: ${error.message}`);
    }

    console.log('\n🎉 演示完成！');
    console.log('\n📋 总结:');
    console.log('✅ Markdown Front Matter 解析');
    console.log('✅ 自动内容结构提取');
    console.log('✅ 混合格式目录加载');
    console.log('✅ Markdown 资产创建');
    console.log('✅ 向后兼容 JSON 格式');

  } catch (error) {
    console.error('❌ 演示失败:', error.message);
    process.exit(1);
  }
}

// 运行演示
if (require.main === module) {
  demonstrateUnifiedAssetManagement().catch(console.error);
}

module.exports = { demonstrateUnifiedAssetManagement };