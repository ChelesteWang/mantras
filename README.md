# 🎭 Mantras MCP 服务器

> 基于 Model Context Protocol 的 AI 人格召唤与智能提示工程平台

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)

## 🚀 快速开始

### 一键启动
```bash
# 克隆项目
git clone <repository-url>
cd mantras

# 安装依赖
npm install

# 构建项目
npm run build

# 启动 MCP 服务器
npm start
```

### MCP 客户端配置
将以下配置添加到您的 MCP 客户端（如 Claude Desktop、Cursor 等）：

```json
{
  "mcpServers": {
    "mantras": {
      "command": "node",
      "args": ["/path/to/mantras/index.js"],
      "cwd": "/path/to/mantras"
    }
  }
}
```

## ✨ 核心功能

### 🎭 AI 人格召唤系统
- **10个专业人格** - 暴躁老哥、自省姐、技术专家、数据分析师等
- **智能召唤** - 基于意图自动选择合适人格
- **会话管理** - 多人格并发对话和状态管理
- **人格合成** - 动态组合多个人格创建专家团队
- **记忆集成** - 每个人格都具备上下文记忆能力

### 📝 提示工程增强
- **10个核心模板** - 角色提示、链式思考、调试模拟等
- **参数化模板** - 动态参数替换和验证
- **智能推荐** - 基于上下文的模板推荐
- **模板组合** - 多模板协同工作

### 🧠 智能记忆系统
- **对话记忆** - 自动记录和检索对话历史
- **上下文记忆** - 项目和任务相关信息存储
- **长期记忆** - 跨会话的知识积累
- **记忆分析** - 模式识别和洞察发现

### 📊 任务管理
- **执行计划** - 复杂任务自动分解
- **任务队列** - 智能任务调度和状态管理
- **进度跟踪** - 实时任务状态监控
- **依赖管理** - 任务间依赖关系处理

## 🛠️ MCP 工具集

### 系统工具
- `init` - 系统初始化和功能概览
- `get_project_context` - 获取项目上下文信息

### 资产管理
- `list_assets` - 列出所有可用资产
- `get_asset` - 获取特定资产详情

### 人格系统
- `list_personas` - 列出所有可用人格
- `summon_persona` - 召唤指定人格
- `analyze_user_intent` - 分析用户意图
- `get_persona_options` - 获取人格选项
- `evaluate_persona_match` - 评估人格匹配度
- `list_active_sessions` - 列出活跃会话
- `get_session` - 获取会话详情
- `release_session` - 释放会话
- `synthesize_persona` - 合成新人格

### 提示工程
- `list_mantras` - 列出所有提示模板
- `apply_mantra` - 应用提示模板

### 任务管理
- `create_execution_plan` - 创建执行计划
- `execute_plan` - 执行计划
- `get_task_status` - 获取任务状态
- `update_task_status` - 更新任务状态

### 记忆系统
- `manage_memory` - 管理记忆系统
- `analyze_memory` - 分析记忆模式

## 🏗️ 系统架构

### 现代化设计
- **依赖注入容器** - 统一服务管理，降低耦合度
- **配置管理系统** - 类型安全的配置，支持环境变量
- **全局错误处理** - 结构化错误分类和监控
- **监控和统计** - 实时性能监控和健康检查

### 核心组件
```
src/
├── infrastructure/
│   ├── server/           # MCP 服务器实现
│   ├── config/           # 配置管理
│   └── logging/          # 日志系统
├── core/
│   ├── assets/           # 资产管理
│   ├── personas/         # 人格系统
│   ├── memory/           # 记忆系统
│   └── templates/        # 提示模板
├── tools/                # MCP 工具实现
├── shared/
│   ├── container/        # 依赖注入
│   ├── errors/           # 错误处理
│   └── tools/            # 工具基础设施
└── presentation/
    └── mcp/              # MCP 协议适配
```

## 📁 资产结构

### 人格资产 (10个)
```
assets/personas/
├── analyst.md           # 数据分析师
├── creative.md          # 创意作家
├── fan-girl.md          # 粉丝妹 - 发现亮点
├── grumpy-bro.md        # 暴躁老哥 - 犀利批评
├── helper-persona.md    # 通用助手
├── mcp-summoner.md      # 人格召唤师
├── product-strategist.md # 小布丁 - 商业分析
├── reflection-sis.md    # 自省姐 - 深度思考
├── tech-expert.md       # 技术专家
└── therapist.md         # 支持专家
```

### 提示模板 (10个)
```
assets/prompt-templates/
├── role-prompting.md           # 角色提示
├── explicit-context.md         # 明确上下文
├── input-output-examples.md    # 输入输出示例
├── iterative-chaining.md       # 迭代式链条
├── debug-simulation.md         # 模拟调试
├── feature-blueprinting.md     # 功能蓝图
├── refactor-guidance.md        # 重构指导
├── ask-alternatives.md         # 寻求替代方案
├── rubber-ducking.md           # 小黄鸭调试法
└── constraint-anchoring.md     # 约束锚定
```

## 🔧 开发工具

### 资产管理
```bash
npm run assets:list      # 列出所有资产
npm run assets:validate  # 验证资产完整性
npm run assets:stats     # 查看资产统计
npm run assets:sync      # 同步资产元数据
```

### 提示工程
```bash
npm run prompt:create    # 创建新提示模板
npm run prompt:manage    # 管理提示模板
```

### 人格系统
```bash
npm run persona:demo     # 人格系统演示
npm run persona:test     # 人格系统测试
```

### 记忆系统
```bash
npm run memory:demo      # 记忆系统演示
npm run memory:test      # 记忆系统测试
```

### 开发和测试
```bash
npm run dev              # 开发模式
npm run test             # 运行测试
npm run test:coverage    # 测试覆盖率
npm run lint             # 代码检查
npm run format           # 代码格式化
```

## 📚 使用示例

### 召唤人格
```javascript
// 召唤暴躁老哥进行批判性分析
await summon_persona({
  personaId: "grumpy_bro",
  intent: "critical_analysis"
});

// 基于意图智能召唤
await analyze_user_intent({
  userInput: "我需要技术专家帮助",
  context: "代码审查"
});
```

### 应用提示模板
```javascript
// 应用角色提示模板
await apply_mantra({
  templateName: "role-prompting",
  inputs: {
    role: "高级架构师",
    task: "系统设计评审",
    context: "微服务架构"
  }
});
```

### 任务管理
```javascript
// 创建执行计划
await create_execution_plan({
  userRequest: "重构用户认证系统",
  autoDecompose: true
});
```

## 📖 文档

### 用户指南
- [快速开始](docs/getting-started.md)
- [核心概念](docs/core-concepts.md)
- [人格系统](docs/guides/persona-system.md)
- [记忆系统](docs/guides/memory-system.md)

### 开发者指南
- [系统架构](docs/architecture/README.md)
- [API 参考](docs/reference/commands.md)
- [MCP 工具](docs/guides/mcp-tools.md)

### 提示工程
- [基础概念](docs/prompt-engineering/basics.md)
- [核心技巧](docs/prompt-engineering/techniques.md)
- [最佳实践](docs/prompt-engineering/best-practices.md)

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

### 开发环境设置
```bash
# 克隆项目
git clone <your-fork>
cd mantras

# 安装依赖
npm install

# 开发模式
npm run dev

# 运行测试
npm test

# 构建验证
npm run build
```

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 🤝 [Persona Summoner](https://github.com/yinwm/persona-summoner) - 轻量级 AI 人格召唤服务，友联项目
- 🚀 [PromptX](https://github.com/Deepractice/PromptX) - 领先的 AI 上下文工程平台，革命性交互设计
- 🔗 [Model Context Protocol](https://modelcontextprotocol.io/) - 强大的 AI 集成协议
- 📚 [《程序员的提示工程实战手册》](ref/prompt-engineering-playbook-zh.md) - 提示工程最佳实践
- 👥 所有贡献者和用户的反馈和支持

---

**🚀 立即开始**: `npm install && npm run build && npm start`