# Mantras MCP 服务器

一个强大的 Model Context Protocol (MCP) 服务器，提供 AI 资产管理、Persona 召唤和**提示工程增强功能**。

## 🚀 核心功能

### 1. AI 资产管理
- 统一管理 Personas、Prompts 和 Tools
- 支持远程和本地资产源
- 智能缓存和更新机制

### 2. Persona 召唤系统
- 动态 Persona 创建和管理
- 基于意图的智能推荐
- 会话状态管理和记忆功能
- Persona 合成和定制

### 3. 🎯 提示工程增强功能 (新增)
基于《程序员的提示工程实战手册》的10大核心技巧：

- **角色提示** - 设定专家角色获得高质量建议
- **明确上下文** - 清晰框定问题避免模糊回答  
- **输入输出示例** - 通过具体示例展示意图
- **迭代式链条** - 将复杂任务分解成连续小步骤
- **模拟调试** - 让AI模拟代码运行时行为
- **功能蓝图** - 借助AI主导的规划和脚手架能力
- **重构指导** - 确保重构与核心目标对齐
- **寻求替代方案** - 探索多种不同的实现路径
- **小黄鸭调试法** - 通过解释来挑战理解并发现逻辑矛盾
- **约束锚定** - 给AI设定明确的边界和限制

## 📋 可用的 MCP 工具

### 资产管理
- `list_assets` - 列出所有可用资产
- `get_asset` - 根据ID获取特定资产

### Persona 管理
- `list_personas` - 列出所有可用的 Persona 定义
- `summon_persona` - 召唤或激活特定 Persona
- `summon_by_intent` - 根据意图自动召唤最佳 Persona
- `list_active_sessions` - 列出所有活跃的 Persona 会话
- `get_session` - 获取特定会话的详细信息
- `release_session` - 结束活跃的 Persona 会话
- `synthesize_persona` - 通过组合现有 Persona 创建新的

### 🎯 提示工程功能 (新增)
- `list_mantras` - 列出所有可用的 Mantra 模板
- `apply_mantra` - 应用 Mantra 模板并填入用户输入
- `create_execution_plan` - 为复杂任务创建执行计划
- `execute_plan` - 执行之前创建的执行计划
- `get_project_context` - 收集并返回项目上下文信息

## 🎯 提示工程使用示例

### 代码审查
```bash
mantras__apply_mantra {
  "templateName": "role-prompting",
  "inputs": {
    "language": "TypeScript",
    "goal": "安全性检查",
    "code": "function authenticate(token: string) { return token === 'admin'; }"
  }
}
```

### 调试问题
```bash
mantras__apply_mantra {
  "templateName": "explicit-context",
  "inputs": {
    "problem": "函数返回错误结果",
    "code": "function add(a, b) { return a + b; }",
    "expected": "数字相加",
    "actual": "字符串拼接"
  }
}
```

### 性能优化
```bash
mantras__apply_mantra {
  "templateName": "constraint-anchoring",
  "inputs": {
    "avoid": "递归",
    "constraints": "ES6语法，不使用外部库",
    "optimization_target": "内存占用",
    "code": "function fibonacci(n) { if(n<=1) return n; return fibonacci(n-1) + fibonacci(n-2); }"
  }
}
```

## 🛠️ 安装和使用

### 安装依赖
```bash
npm install
```

### 构建项目
```bash
npm run build
```

### 运行测试
```bash
npm test
```

### 启动服务器
```bash
npm start
```

### 演示提示工程功能
```bash
node demo-prompt-engineering.js
```

## MCP 配置

```json
{
  "mcpServers": {
    "mantras": {
      "command": "node",
      "args": ["/path/to/mantras/dist/server.js"]
    }
  }
}
```

## 📚 文档

- [架构文档](./ARCHITECTURE.md)
- [提示工程使用指南](./PROMPT_ENGINEERING_GUIDE.md)
- [精简实施方案](./PROMPT_ENGINEERING_MINIMAL.md)

## 🎯 设计原则

- **如无必要，勿增实体** - 最小化原则，只添加真正必要的功能
- **零技术债务** - 完全复用现有架构
- **渐进增强** - 先让用户用起来，再根据反馈优化
- **类型安全** - TypeScript 确保代码质量

## 🚀 快速开始

1. 克隆项目并安装依赖
2. 运行 `npm run build` 构建项目
3. 运行 `node demo-prompt-engineering.js` 查看演示
4. 使用 MCP 工具开始体验提示工程功能

## 📈 版本历史

- **v2.0.0** - 添加提示工程增强功能，集成10大核心技巧
- **v1.x** - 基础 Persona 召唤和资产管理功能