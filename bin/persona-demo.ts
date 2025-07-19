#!/usr/bin/env node

/**
 * 新人格类型演示脚本
 * 展示基于性格特质的人格系统
 */

import { PersonaSummoner } from '../src/core/personas/persona-summoner.js';

async function demonstrateNewPersonas() {
  console.log('🎭 新人格类型演示\n');

  const personaSummoner = new PersonaSummoner();

  // 获取所有人格
  const allPersonas = personaSummoner.getPersonas();
  console.log(`📋 系统中共有 ${allPersonas.length} 个人格：`);
  allPersonas.forEach(persona => {
    console.log(`   - ${persona.name} (${persona.id}): ${persona.description}`);
  });
  console.log();

  // 演示新的性格特质型人格
  console.log('🆕 新增的性格特质型人格演示：\n');

  // 1. 暴躁老哥 - 批判性思维
  console.log('1️⃣ 暴躁老哥 - 批判性思维者');
  const grumpySession = personaSummoner.summonPersona({
    personaId: 'grumpy_bro',
    intent: '需要严格审视我的想法'
  });
  console.log(`   ✅ 召唤成功: ${grumpySession.persona.name}`);
  console.log(`   🎯 特质: ${grumpySession.persona.personality.traits.join(', ')}`);
  console.log(`   💬 沟通风格: ${grumpySession.persona.personality.communicationStyle}`);
  console.log(`   📝 系统提示: ${grumpySession.persona.systemPrompt.substring(0, 100)}...`);
  console.log();

  // 2. 自省姐 - 深度思考者
  console.log('2️⃣ 自省姐 - 深度思考者');
  const reflectionSession = personaSummoner.summonPersona({
    personaId: 'reflection_sis',
    intent: '需要深度分析和逻辑验证'
  });
  console.log(`   ✅ 召唤成功: ${reflectionSession.persona.name}`);
  console.log(`   🎯 特质: ${reflectionSession.persona.personality.traits.join(', ')}`);
  console.log(`   💬 沟通风格: ${reflectionSession.persona.personality.communicationStyle}`);
  console.log(`   📝 系统提示: ${reflectionSession.persona.systemPrompt.substring(0, 100)}...`);
  console.log();

  // 3. 粉丝妹 - 亮点发现者
  console.log('3️⃣ 粉丝妹 - 亮点发现者');
  const fanSession = personaSummoner.summonPersona({
    personaId: 'fan_girl',
    intent: '需要发现亮点和鼓励'
  });
  console.log(`   ✅ 召唤成功: ${fanSession.persona.name}`);
  console.log(`   🎯 特质: ${fanSession.persona.personality.traits.join(', ')}`);
  console.log(`   💬 沟通风格: ${fanSession.persona.personality.communicationStyle}`);
  console.log(`   📝 系统提示: ${fanSession.persona.systemPrompt.substring(0, 100)}...`);
  console.log();

  // 4. 小布丁 - 产品策略分析师
  console.log('4️⃣ 小布丁 - 产品策略分析师');
  const productSession = personaSummoner.summonPersona({
    personaId: 'product_strategist',
    intent: '需要商业分析和产品策略'
  });
  console.log(`   ✅ 召唤成功: ${productSession.persona.name}`);
  console.log(`   🎯 特质: ${productSession.persona.personality.traits.join(', ')}`);
  console.log(`   💬 沟通风格: ${productSession.persona.personality.communicationStyle}`);
  console.log(`   📝 系统提示: ${productSession.persona.systemPrompt.substring(0, 100)}...`);
  console.log();

  // 演示智能召唤功能
  console.log('🤖 智能召唤演示（基于意图自动选择人格）：\n');

  const testIntents = [
    { intent: '我需要有人批评我的想法', expected: 'grumpy_bro' },
    { intent: '帮我深度分析这个逻辑', expected: 'reflection_sis' },
    { intent: '发现我想法中的亮点', expected: 'fan_girl' },
    { intent: '分析这个商业模式的价值', expected: 'product_strategist' },
    { intent: '我需要技术建议', expected: 'tech-expert' },
    { intent: '我需要情感支持', expected: 'therapist' }
  ];

  testIntents.forEach((test, index) => {
    const session = personaSummoner.summonPersona({ intent: test.intent });
    const isCorrect = session.persona.id === test.expected;
    console.log(`   ${index + 1}. 意图: "${test.intent}"`);
    console.log(`      → 召唤了: ${session.persona.name} (${session.persona.id}) ${isCorrect ? '✅' : '❌'}`);
    console.log(`      → 置信度: ${session.metadata.confidence}`);
    personaSummoner.releaseSession(session.sessionId);
  });

  console.log();

  // 演示人格能力对比
  console.log('📊 人格能力对比：\n');
  
  const capabilities = ['analysis', 'creative', 'technical', 'empathetic'];
  const newPersonas = allPersonas.filter(p => 
    ['grumpy_bro', 'reflection_sis', 'fan_girl', 'product_strategist'].includes(p.id)
  );

  console.log('人格名称'.padEnd(15) + capabilities.map(c => c.padEnd(10)).join(''));
  console.log('-'.repeat(55));
  
  newPersonas.forEach(persona => {
    const row = persona.name.padEnd(15) + 
      capabilities.map(cap => (persona.capabilities[cap as keyof typeof persona.capabilities] ? '✅' : '❌').padEnd(10)).join('');
    console.log(row);
  });

  console.log();

  // 演示记忆功能集成
  console.log('🧠 记忆功能集成演示：\n');
  
  // 为暴躁老哥添加一些对话记录
  personaSummoner.addConversationToSession(grumpySession.sessionId, 'user', 
    '我觉得我的创业想法很棒，一定能成功！', 
    { important: true, needsCriticism: true }
  );
  
  personaSummoner.addConversationToSession(grumpySession.sessionId, 'assistant', 
    '等等！你这想法有几个明显的问题：1. 市场验证了吗？2. 竞争对手分析了吗？3. 资金从哪来？别光想着成功，先把基础工作做好！',
    { criticism: true, reality_check: true }
  );

  const grumpyHistory = personaSummoner.getSessionConversationHistory(grumpySession.sessionId);
  console.log(`   💬 暴躁老哥对话记录: ${grumpyHistory.length} 条`);
  console.log(`   📝 最新对话: "${grumpyHistory[grumpyHistory.length - 1]?.content.substring(0, 50)}..."`);

  // 检查记忆统计
  const memoryStats = grumpySession.memory.getMemoryStats();
  console.log(`   🧠 记忆统计: ${memoryStats.totalMemories} 条记忆，${memoryStats.conversationCount} 条对话`);

  console.log();

  // 清理会话
  console.log('🧹 清理会话：');
  [grumpySession, reflectionSession, fanSession, productSession].forEach(session => {
    const released = personaSummoner.releaseSession(session.sessionId);
    console.log(`   ${released ? '✅' : '❌'} 释放会话: ${session.persona.name}`);
  });

  console.log('\n🎉 新人格类型演示完成！');
  console.log('\n💡 新人格特点总结：');
  console.log('   🔥 暴躁老哥：犀利批评，框架外思维，帮你发现问题');
  console.log('   🤔 自省姐：深度思考，逻辑严密，追求完整性');
  console.log('   ⭐ 粉丝妹：发现亮点，放大优势，跨界思维');
  console.log('   📊 小布丁：商业分析，产品策略，结构化思维');
  console.log('\n这些人格更注重思维方式和性格特质，而不是职业角色！');
}

// 运行演示
demonstrateNewPersonas().catch(console.error);

export { demonstrateNewPersonas };