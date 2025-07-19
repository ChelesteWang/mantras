# Mantras MCP 服务器

企业级 AI 资产管理、Persona 召唤和智能记忆系统。

## 🚀 快速开始

```bash
npm install && npm run build
npm run memory:demo      # 体验记忆系统
npm run assets:list      # 查看资产状态
npm start               # 启动MCP服务器
```

## 🎭 核心功能

### 🧠 智能记忆系统 (NEW!)
- **对话历史管理** - 自动记录和智能检索对话
- **多类型记忆存储** - 事实、任务、偏好、上下文记忆
- **智能记忆检索** - 相关性算法和语义搜索
- **记忆分析洞察** - 模式识别和连接发现
- **会话间记忆继承** - 全局记忆和知识积累

### AI 资产管理
- **19个已验证资产** - 8个人格 + 10个提示模板 + 1个提示
- **CLI管理工具** - 完整的命令行工具集
- **质量控制** - 自动验证和完整性检查

### Persona 召唤系统
- **8个专业人格** - 包含职业型和性格特质型人格
  - **职业型人格**: 数据分析师、技术专家、创意作家、支持专家
  - **性格特质型人格**: 暴躁老哥、自省姐、粉丝妹、小布丁
- **智能召唤** - 基于意图的自动人格选择
- **会话管理** - 多会话并发和状态管理
- **记忆集成** - 每个 persona 都具备记忆能力

### 提示工程增强
- **10大核心技巧** - 基于最佳实践的模板
- **三种创建方式** - 向导、Web编辑器、片段组合
- **双格式支持** - JSON系统格式 + Markdown人类格式

## 🛠️ 管理工具

```bash
# 记忆系统
npm run memory:demo      # 记忆系统演示
npm run memory:test      # 记忆功能测试

# 人格系统
npm run persona:demo     # 人格类型演示
npm run persona:test     # 人格功能测试

# 资产管理
npm run assets:list      # 列出资产
npm run assets:validate  # 验证完整性
npm run assets:stats     # 统计信息

# 提示模板管理
npm run prompt:create    # 创建向导
npm run prompt:manage    # 统一管理
npm run assistant:smart  # 智能助手
```

## 🧠 记忆系统特性

### 核心能力
- ✅ **对话历史**：自动记录用户和助手的对话
- ✅ **上下文记忆**：跟踪当前话题、项目和文件
- ✅ **长期记忆**：存储重要事实、任务和偏好
- ✅ **智能检索**：基于相关性的记忆搜索
- ✅ **记忆分析**：模式识别和洞察生成
- ✅ **数据持久化**：记忆导出导入和备份

### 使用示例
```javascript
// 添加记忆
await mcp_mantras_manage_memory({
  action: "add_memory",
  sessionId: "session_123",
  memoryType: "fact",
  content: "用户偏好使用 TypeScript",
  importance: 8,
  tags: ["preference", "typescript"]
});

// 搜索记忆
await mcp_mantras_manage_memory({
  action: "search_memories",
  query: "typescript",
  sessionId: "session_123"
});

// 分析记忆模式
await mcp_mantras_analyze_memory({
  action: "analyze_patterns",
  sessionId: "session_123"
});
```

## 📚 文档

完整文档请查看 [docs/](./docs/) 目录：
- [快速开始](./docs/getting-started.md) - 5分钟上手指南
- [记忆系统指南](./docs/guides/memory-system.md) - 记忆功能详解
- [性格特质型人格](./docs/guides/personality-traits-personas.md) - 新人格类型详解
- [记忆实现总结](./docs/guides/memory-implementation-summary.md) - 技术实现详情
- [核心概念](./docs/core-concepts.md) - 系统设计理念

## 🎯 MCP 配置

```json
{
  "mcpServers": {
    "mantras": {
      "command": "node",
      "args": ["/path/to/mantras/bin/mantras.js"]
    }
  }
}
```

或者如果全局安装：
```json
{
  "mcpServers": {
    "mantras": {
      "command": "mantras"
    }
  }
}
```

---

**版本**: v2.0.0 | **Node.js**: >=18.0.0 | **许可证**: ISC