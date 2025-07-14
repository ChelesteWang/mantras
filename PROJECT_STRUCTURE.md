# AI资产管理系统项目结构文档

## 📁 项目整体结构

该AI资产管理系统是一个基于MCP（Model Context Protocol）协议的服务器，专门用于管理和动态调用各类AI相关资产，包括提示词（prompts）、人物角色（personas）和工具定义（tool definitions）。

```
mantras/                    # 项目根目录
├── src/                    # 源代码目录
│   ├── server.ts          # 主服务器程序 - MCP服务器核心
│   ├── persona-summoner.ts # 人格（Persona）动态召唤与管理模块
│   ├── asset-repository.ts # 资产数据仓库 - 管理所有AI资产的核心模块
│   ├── asset-sources.ts   # 资产来源配置 - 远程URL和默认资产定义
│   ├── types.ts          # TypeScript类型定义
│   └── log-to-file.ts    # 日志文件管理工具
├── test/                   # 测试代码目录
│   ├── server.test.ts    # 服务器测试文件
│   ├── persona-summoner.test.ts # 人格召唤器测试文件
│   └── asset-repository.test.ts # 仓库模块测试文件
├── dist/                   # 构建产物目录（已编译的JavaScript文件）
├── docs/                   # 项目文档目录
│   ├── README.md         # 英文项目说明文档
│   └── ARCHITECTURE.md   # 英文架构设计文档
├── node_modules/           # npm依赖包
├── package.json            # 项目配置文件（依赖、脚本等）
├── tsconfig.json           # TypeScript编译配置
├── jest.config.cjs        # Jest测试框架配置
└── debug.log             # 调试日志文件
```

## 🔧 核心模块详细分析

### 1. **`server.ts`** - MCP服务器引擎
**功能定位**：整个系统的引擎，负责与外界通过MCP协议交互。
- 🚀 初始化和启动MCP服务器。
- 🔗 将 `AssetRepository` 和 `PersonaSummoner` 实例注入服务器。
- 🛠️ 注册所有可用的MCP工具（API端点）。
- 📞 处理来自MCP客户端的工具调用请求，并分发到相应模块。

### 2. **`asset-repository.ts`** - 资产数据管理中枢
**功能定位**：系统的数据管理中心，采用多源联邦架构。
- 📡 从一个或多个远程URL获取最新资产数据。
- 💾 从本地JSON文件加载用户自定义资产。
- 🏃 实现智能缓存层，将远程资产缓存到内存，避免重复网络请求。
- 🔄 在远程源不可用时优雅回退到内置的默认资产。
- 🧩 智能合并远程、本地和默认资产，合并优先级为：本地 > 远程 > 默认。

### 3. **`persona-summoner.ts`** - 人格动态管理引擎
**功能定位**：负责根据用户意图或直接指令，动态地召唤、管理和释放不同的AI人格。
- 🎭 实现 `summon_by_intent`，根据意图匹配最合适的人格。
- 🆔 实现 `summon_persona`，直接加载指定ID的人格。
- 🔄 管理活跃的会话（session），确保人格状态的连续性。
- 🗑️ 实现 `release_session`，结束会话并释放资源。

### 4. **`asset-sources.ts`** - 资产来源配置中心
**功能定位**：集中管理所有资产的获取来源。
- 🌐 配置远程资产源的URL列表。
- 📋 提供一个内置的、最小化的默认资产集合（`Asset[]`）作为系统的最终后备。

### 5. **`types.ts`** - 类型系统定义
**功能定位**：整个项目的类型安全基石。
- 📊 定义`Asset`接口 - 所有资产的统一数据结构。
- 🎯 定义`AssetType`类型 - 资产类型枚举（`persona`, `prompt`, `tool`）。
- 🏗️ 定义`AssetRepository`和`PersonaSummoner`等核心模块的接口。

### 6. **`log-to-file.ts`** - 日志管理模块
**功能定位**：系统监控和问题调试工具。
- 📝 提供一个简单的文件日志记录功能。
- 🔍 用于输出调试信息和关键运行时错误。

## 🎯 项目核心特色

### 🔍 多类型资产支持
- **Persona（人物角色）**：AI助手的人格定义。
- **Prompt（提示词）**：优化AI交互的指令模板。
- **Tool（工具定义）**：AI可调用的外部功能描述。

### 🌐 多源联邦架构
- **远程URL**：实时获取最新资产。
- **本地文件**：用户自定义配置。
- **内置默认**：系统提供的基础资产库。

### ⚡ 智能管理特性
- **缓存机制**：自动缓存远程资产，减少网络延迟。
- **优先级系统**：本地资产 > 远程资产 > 默认资产。
- **故障回退**：在网络异常时保证系统可用性。

### 🤝 生态集成能力
- **MCP协议标准**：与所有MCP兼容客户端无缝集成。
- **灵活配置**：支持通过命令行参数在运行时进行配置。

## 🚀 快速开始指南

### 环境准备
- Node.js (v18或更高版本)
- npm

### 构建与测试
```bash
# 安装依赖
npm install

# 编译TypeScript到JavaScript
npm run build

# 运行单元测试
npm test
```

### 运行服务
```bash
# 基本运行 (使用默认配置)
node dist/server.js

# 复杂运行示例 (指定本地资产文件、自定义端口)
node dist/server.js --personas /path/to/personas.json --port 8088
```

## 🛠️ API端点（工具）参考

本服务通过MCP协议暴露以下工具，供客户端调用：

- **`list_assets`**: 列出所有已加载的、所有类型的资产。
- **`get_asset(assetId: string)`**: 根据ID获取单个资产的详细信息。
- **`list_personas`**: 专门用于列出所有可用的“人格”（Persona）资产。
- **`summon_persona(personaId: string)`**: 激活一个指定ID的人格，并返回一个新会话ID。
- **`summon_by_intent(intent: string)`**: 根据自然语言“意图”，智能激活最合适的人格。
- **`get_session(sessionId: string)`**: 获取指定会话ID的详细信息。
- **`release_session(sessionId: string)`**: 结束一个指定的会话，释放人格。

## 🏗️ 架构设计亮点

1.  **分层架构**：清晰的层次分离（服务器 → 服务模块 → 数据源）。
2.  **依赖注入 (Dependency Injection)**：`AssetRepository` 和 `PersonaSummoner` 的实例被创建后注入到 `McpServer` 中，实现了数据层与服务层的解耦，便于独立测试和维护。
3.  **命令行参数解析**: 使用 `minimist` 库解析启动参数（如 `--personas`, `--port`），实现灵活的运行时配置。
4.  **扩展性**：模块化设计便于未来增加新的资产类型或服务模块。
5.  **可靠性**：多层次的故障恢复机制（缓存、默认值回退）。
6.  **性能**：智能缓存机制显著减少了对网络资源的重复请求。

## 📦 部署与维护

### 后台运行
为了确保服务在后台稳定运行，推荐使用进程管理工具，如 `pm2`。
```bash
# 全局安装 pm2
npm install pm2 -g

# 使用 pm2 启动服务
pm2 start dist/server.js --name mantras-mcp-server

# 查看服务状态
pm2 list
```

### 日志管理
- 服务的调试信息和错误会记录在根目录的 `debug.log` 文件中。
- 在生产环境中，建议定期对日志文件进行归档或轮转（log rotation），以防占用过多磁盘空间。

---
*本文档基于项目v1.1.0版本生成*