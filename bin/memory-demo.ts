#!/usr/bin/env node

/**
 * Mantra MCP 记忆系统演示脚本
 * 展示 agent 记忆能力的各种功能
 */

import { PersonaSummoner } from '../src/core/personas/persona-summoner.js';
import { SessionMemory, PersistentMemoryManager } from '../src/core/memory/memory.js';

async function demonstrateMemorySystem() {
  console.log('🧠 Mantra MCP 记忆系统演示\n');

  // 1. 创建 persona summoner 和记忆管理器
  const personaSummoner = new PersonaSummoner();
  const memoryManager = personaSummoner.getMemoryManager();

  console.log('📋 1. 召唤技术专家 persona');
  const session = personaSummoner.summonPersona({
    personaId: 'tech-expert',
    intent: 'React 性能优化咨询',
    customParams: {
      expertise: 'frontend_performance'
    }
  });

  console.log(`   ✅ 已召唤: ${session.persona.name} (${session.sessionId})`);
  console.log(`   📝 初始记忆条目: ${session.memory.getMemoryStats().totalMemories}\n`);

  // 2. 添加对话记录
  console.log('💬 2. 添加对话记录');
  personaSummoner.addConversationToSession(session.sessionId, 'user', 
    '我的 React 应用加载很慢，有什么优化建议吗？', 
    { important: true, topic: 'performance' }
  );

  personaSummoner.addConversationToSession(session.sessionId, 'assistant', 
    '我建议从以下几个方面优化：1. 代码分割 2. 懒加载 3. 缓存策略 4. 图片优化',
    { topic: 'performance', suggestions: 4 }
  );

  personaSummoner.addConversationToSession(session.sessionId, 'user', 
    '能详细说说代码分割吗？'
  );

  const conversationHistory = personaSummoner.getSessionConversationHistory(session.sessionId);
  console.log(`   ✅ 已记录 ${conversationHistory.length} 条对话\n`);

  // 3. 添加各种类型的记忆
  console.log('🗃️ 3. 添加不同类型的记忆');
  
  // 添加事实记忆
  session.memory.addMemory('fact', 
    'React.lazy() 和 Suspense 可以实现组件级别的代码分割', 
    8, 
    ['react', 'code-splitting', 'performance']
  );

  // 添加用户偏好
  session.memory.setPreference('codeStyle', 'functional');
  session.memory.setPreference('testFramework', 'jest');

  // 添加任务记忆
  session.memory.addMemory('task', 
    '实现 React 应用的代码分割优化', 
    7, 
    ['task', 'optimization', 'react']
  );

  // 更新上下文
  session.memory.updateContext({
    currentTopic: 'React 性能优化',
    activeProjects: ['电商前端', '管理后台'],
    workingDirectory: '/Users/dev/react-projects'
  });

  session.memory.addRecentFile('/Users/dev/react-projects/src/App.tsx');
  session.memory.addRecentFile('/Users/dev/react-projects/src/components/ProductList.tsx');

  const stats = session.memory.getMemoryStats();
  console.log(`   ✅ 总记忆条目: ${stats.totalMemories}`);
  console.log(`   📊 记忆类型分布:`, stats.memoryByType);
  console.log(`   ⭐ 平均重要性: ${stats.averageImportance.toFixed(1)}\n`);

  // 4. 智能记忆检索
  console.log('🔍 4. 智能记忆检索');
  
  const relevantMemories = session.memory.getRelevantMemories('react performance optimization', 3);
  console.log(`   🎯 找到 ${relevantMemories.length} 条相关记忆:`);
  relevantMemories.forEach((memory, index) => {
    console.log(`   ${index + 1}. [${memory.type}] ${JSON.stringify(memory.content).substring(0, 50)}... (重要性: ${memory.importance})`);
  });

  const searchResults = session.memory.searchMemories('code splitting');
  console.log(`   🔎 搜索 "code splitting" 找到 ${searchResults.length} 条记忆\n`);

  // 5. 记忆分析
  console.log('📈 5. 记忆分析和洞察');
  
  const importantMemories = session.memory.getImportantMemories(7);
  console.log(`   🌟 重要记忆 (≥7): ${importantMemories.length} 条`);
  
  const context = session.memory.getContext();
  console.log(`   📍 当前上下文:`);
  console.log(`      话题: ${context.currentTopic}`);
  console.log(`      项目: ${context.activeProjects.join(', ')}`);
  console.log(`      最近文件: ${context.recentFiles.slice(0, 2).join(', ')}`);
  console.log(`      偏好: ${JSON.stringify(context.preferences)}\n`);

  // 6. 会话结束和记忆转移
  console.log('🔄 6. 会话结束和记忆转移');
  
  const globalMemoryBefore = memoryManager.getGlobalMemory().getMemoryStats();
  console.log(`   📊 转移前全局记忆: ${globalMemoryBefore.totalMemories} 条`);
  
  // 释放会话（会自动转移重要记忆到全局）
  personaSummoner.releaseSession(session.sessionId);
  
  const globalMemoryAfter = memoryManager.getGlobalMemory().getMemoryStats();
  console.log(`   📊 转移后全局记忆: ${globalMemoryAfter.totalMemories} 条`);
  console.log(`   ✅ 已转移 ${globalMemoryAfter.totalMemories - globalMemoryBefore.totalMemories} 条重要记忆到全局\n`);

  // 7. 全局记忆查询
  console.log('🌍 7. 全局记忆查询');
  
  const globalMemory = memoryManager.getGlobalMemory();
  const globalSearchResults = globalMemory.searchMemories('react');
  console.log(`   🔍 全局搜索 "react": ${globalSearchResults.length} 条记忆`);
  
  const transferredMemories = globalMemory.getMemoriesByTag('transferred');
  console.log(`   📤 已转移记忆: ${transferredMemories.length} 条\n`);

  // 8. 创建新会话并继承记忆
  console.log('🆕 8. 创建新会话并继承记忆');
  
  const newSession = personaSummoner.summonPersona({
    personaId: 'tech-expert',
    intent: 'react optimization',
  });

  const inheritedMemories = newSession.memory.getMemoriesByTag('inherited');
  console.log(`   🧬 新会话继承了 ${inheritedMemories.length} 条相关记忆`);
  console.log(`   📝 新会话总记忆: ${newSession.memory.getMemoryStats().totalMemories} 条\n`);

  // 9. 记忆导出演示
  console.log('💾 9. 记忆导出和统计');
  
  const memoryExport = newSession.memory.exportMemory();
  console.log(`   📦 导出数据包含:`);
  console.log(`      基础键值对: ${Object.keys(memoryExport.memory).length} 个`);
  console.log(`      对话历史: ${memoryExport.conversationHistory.length} 条`);
  console.log(`      记忆条目: ${memoryExport.memoryEntries.length} 条`);
  console.log(`      上下文信息: ${Object.keys(memoryExport.contextMemory).length} 个字段\n`);

  // 10. 系统总览
  console.log('📊 10. 系统记忆总览');
  
  const systemStats = personaSummoner.getMemoryStatistics();
  console.log(`   🌍 全局记忆统计:`, systemStats.globalStats);
  console.log(`   🔢 活跃会话数: ${systemStats.totalActiveSessions}`);
  console.log(`   📋 会话详情:`, Object.keys(systemStats.sessionStats).map(id => 
    `${id.substring(0, 12)}... (${systemStats.sessionStats[id].personaName})`
  ).join(', '));

  console.log('\n🎉 记忆系统演示完成！');
  console.log('\n💡 主要特性总结:');
  console.log('   ✅ 对话历史自动记录和检索');
  console.log('   ✅ 多类型记忆存储（事实、任务、偏好、上下文）');
  console.log('   ✅ 智能重要性评分和排序');
  console.log('   ✅ 标签化组织和搜索');
  console.log('   ✅ 上下文感知的记忆检索');
  console.log('   ✅ 会话间记忆继承和转移');
  console.log('   ✅ 记忆分析和洞察生成');
  console.log('   ✅ 数据导出导入支持');

  // 清理
  personaSummoner.releaseSession(newSession.sessionId);
}

// 运行演示
demonstrateMemorySystem().catch(console.error);

export { demonstrateMemorySystem };