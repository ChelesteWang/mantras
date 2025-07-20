# 🎭 Mantras MCP 服务器

> 企业级 AI 资产管理、Persona 召唤和智能提示工程平台

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)

## ✨ 核心特性

### 🏗️ 现代化架构 (NEW!)
- **依赖注入容器** - 统一服务管理，降低耦合度
- **配置管理系统** - 类型安全的配置，支持环境变量和文件
- **全局错误处理** - 结构化错误分类和监控
- **监控和统计** - 实时性能监控和健康检查

### 📁 统一资产管理
- **Markdown 优先** - 人类友好的 Markdown + Front Matter 格式
- **构建时优化** - 预编译资产，提升 10x 加载性能
- **智能加载** - 优先使用构建时数据，回退到实时解析
- **自动同步** - 元数据自动同步和完整性验证
- **版本控制友好** - Git diff 清晰，便于团队协作

### 🧠 智能记忆系统
- **对话历史管理** - 自动记录和智能检索对话
- **多类型记忆存储** - 事实、任务、偏好、上下文记忆
- **智能记忆检索** - 相关性算法和语义搜索
- **记忆分析洞察** - 模式识别和连接发现
- **会话间记忆继承** - 全局记忆和知识积累

### 🎭 Persona 召唤系统
- **10个专业人格** - 分析师、创意、技术专家、治疗师等
- **10个提示模板** - 基于最佳实践的工程模板
- **智能召唤** - 基于意图的自动人格选择
- **会话管理** - 多会话并发和状态管理
- **记忆集成** - 每个 persona 都具备记忆能力
- **动态合成** - 组合多个人格创建新的专家

### 📝 提示工程增强
- **10大核心技巧** - 基于《程序员的提示工程实战手册》
- **多种创建方式** - 向导、Web编辑器、模板组合
- **智能推荐** - 基于上下文的模板推荐
- **参数化模板** - 动态参数替换和验证

## 🚀 快速开始

### 安装和构建
```bash
# 克隆项目
git clone <repository-url>
cd mantras

# 安装依赖
npm install

# 构建项目
npm run build

# 启动服务器
npm start
```

### 配置选项
```bash
# 指定资产目录
npm start -- --assets-dir ./custom-assets

# 使用构建时优化的资产
npm start -- --use-build-assets

# 设置日志级别
npm start -- --log-level debug
```

# 安装依赖
npm install

# 构建项目 (包含资产处理)
npm run build

# 启动服务器
npm start
```

## 🏗️ 系统架构

### 核心组件
```
src/
├── server.ts                    # 主服务器 (集成新架构)
├── shared/
│   ├── container/              # 依赖注入容器
│   ├── errors/                 # 全局错误处理
│   └── tools/                  # 工具基础设施
├── config/
│   └── environment.ts          # 配置管理系统
├── presentation/
│   └── mcp/                    # MCP 工具注册
└── tools/                      # MCP 工具实现
```

### 架构特点
- **依赖注入**: 统一服务管理，便于测试和维护
- **配置管理**: 类型安全的配置系统，支持环境变量
- **错误处理**: 结构化错误分类和全局监控
- **工具注册**: 统一的工具注册和执行框架

## 🛠️ 资产管理

### 构建时处理
```bash
npm run build:assets     # 处理和验证资产
npm run build:code       # 编译 TypeScript 代码
npm run build           # 完整构建流程
```

### 资产维护
```bash
npm run assets:migrate   # 迁移 JSON 到 Markdown
npm run assets:sync      # 同步元数据
npm run assets:cleanup   # 清理重复文件
npm run assets:validate  # 验证资产完整性
```

### 开发工具
```bash
npm run assets:demo      # 功能演示
npm run prompt:create    # 创建提示模板
npm run prompt:manage    # 管理提示模板
```

## 📊 性能优化

| 模式 | 首次加载 | 缓存加载 | 内存使用 | 适用场景 |
|------|----------|----------|----------|----------|
| 构建时优化 | ~5ms | <1ms | 低 | 生产环境 |
| Markdown 解析 | ~50ms | ~1ms | 中等 | 开发环境 |

### 生产部署
```bash
# 使用构建时优化的资产
npm run build
npm start -- --use-build-assets

# 指定自定义资产目录
npm start -- --assets-dir /path/to/assets
```

## 🎭 MCP 工具集

### 系统工具
- **`init`** - 系统初始化和概览
- **`get_project_context`** - 获取项目上下文信息

### 资产管理工具
- **`list_assets`** - 列出所有可用资产
- **`get_asset`** - 获取特定资产详情

### Persona 系统工具
- **`list_personas`** - 列出所有可用人格
- **`summon_persona`** - 召唤特定人格
- **`analyze_user_intent`** - 分析用户意图
- **`get_persona_options`** - 获取人格选项
- **`evaluate_persona_match`** - 评估人格匹配度
- **`list_active_sessions`** - 列出活跃会话
- **`get_session`** - 获取会话详情
- **`release_session`** - 释放会话
- **`synthesize_persona`** - 合成新人格

### 提示工程工具
- **`list_mantras`** - 列出所有 Mantra 模板
- **`apply_mantra`** - 应用 Mantra 模板
- **`create_execution_plan`** - 创建执行计划
- **`execute_plan`** - 执行计划

### 记忆系统工具
- **`manage_memory`** - 管理记忆系统
- **`analyze_memory`** - 分析记忆模式
- **`list_assets`** - 列出所有可用资产
- **`get_asset`** - 获取特定资产详情
- **`summon_persona`** - 召唤指定人格
- **`summon_by_intent`** - 基于意图智能召唤

### 记忆管理
- **`manage_memory`** - 管理对话、上下文和长期记忆
- **`analyze_memory`** - 分析记忆模式和洞察
- **`get_session`** - 获取会话详情
- **`release_session`** - 结束活跃会话

### 高级功能
- **`synthesize_persona`** - 合成新人格
- **`apply_mantra`** - 应用提示模板
- **`create_execution_plan`** - 创建执行计划
- **`get_project_context`** - 获取项目上下文

## 📁 资产结构

### Persona 资产 (6个)
```
assets/personas/
├── analyst.md          # 数据分析师
├── creative.md         # 创意作家  
├── helper-persona.md   # 通用助手
├── mcp-summoner.md     # 人格召唤师
├── tech-expert.md      # 技术专家
└── therapist.md        # 支持专家
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

## 🏗️ 架构概览

```mermaid
graph TB
    A[MCP Client] --> B[Mantras Server]
    B --> C[Asset Repository]
    B --> D[Persona Summoner]
    B --> E[Memory System]
    
    C --> F[Build-Time Assets]
    C --> G[Markdown Assets]
    
    D --> H[Session Manager]
    D --> I[Persona Synthesizer]
    
    E --> J[Conversation Memory]
    E --> K[Context Memory]
    E --> L[Long-term Memory]
```

## 🔧 开发指南

### 添加新 Persona
1. 在 `assets/personas/` 创建 Markdown 文件
2. 使用标准 Front Matter 格式
3. 运行 `npm run assets:sync` 同步
4. 运行 `npm run build:assets` 验证

### 创建提示模板
1. 使用 `npm run prompt:create` 向导
2. 或直接在 `assets/prompt-templates/` 创建
3. 包含完整的参数说明和示例
4. 运行构建验证格式

### 扩展功能
1. 在 `src/tools/` 添加新工具
2. 在 `src/server.ts` 注册工具
3. 添加相应的测试文件
4. 更新文档和示例

## 📚 文档

### 用户指南
- [快速开始](docs/getting-started.md)
- [核心概念](docs/core-concepts.md)
- [统一资产管理](docs/guides/unified-asset-management.md)
- [构建时资产处理](docs/guides/build-time-asset-processing.md)

### 开发者指南
- [架构说明](docs/architecture/README.md)
- [API 参考](docs/reference/commands.md)
- [内存系统](docs/guides/memory-system.md)
- [Persona 系统](docs/guides/persona-system.md)

### 维护文档
- [脚本清理总结](docs/maintenance/script-cleanup-summary.md)
- [资产读取分析](docs/maintenance/asset-reading-analysis.md)
- [文档更新计划](docs/maintenance/documentation-update-plan.md)

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