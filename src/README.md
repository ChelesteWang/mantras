# Mantras 项目源码结构

本文档描述了重构后的 `src` 目录结构，旨在提供更清晰、更有组织的代码架构。

## 📁 目录结构概览

```
src/
├── core/                    # 🎯 核心业务逻辑
├── infrastructure/          # 🏗️ 基础设施层
├── presentation/           # 🎨 表示层
├── shared/                 # 🔗 共享组件
├── tools/                  # 🛠️ MCP 工具实现
└── types.ts               # 📝 全局类型定义
```

## 🎯 核心模块 (core/)

### 📦 资产管理 (assets/)
负责所有资产的管理、加载和处理：
- `asset-factory.ts` - 资产工厂
- `asset-loader.ts` - 资产加载器
- `asset-repository.ts` - 资产仓库
- `asset-sources.ts` - 资产源配置
- `enhanced-asset-manager.ts` - 增强资产管理器
- `unified-asset-manager.ts` - 统一资产管理器

### 🧠 内存管理 (memory/)
处理系统内存和状态管理：
- `memory.ts` - 内存管理核心逻辑

### 🎭 人格系统 (personas/)
管理 AI 人格的召唤和生命周期：
- `persona-summoner.ts` - 人格召唤器

### 📋 模板系统 (templates/)
提示工程模板和模板管理：
- `prompt-templates.ts` - 提示模板定义

## 🏗️ 基础设施层 (infrastructure/)

### ⚙️ 配置管理 (config/)
系统配置和环境变量管理：
- `environment.ts` - 环境配置

### 📝 日志系统 (logging/)
统一的日志记录和管理：
- `logger.ts` - 日志记录器

### 🖥️ 服务器 (server/)
MCP 服务器核心实现：
- `server.ts` - 服务器主逻辑

## 🎨 表示层 (presentation/)

### 🔌 MCP 接口 (mcp/)
Model Context Protocol 相关的表示层逻辑：
- `tool-registry.ts` - 工具注册表

## 🔗 共享组件 (shared/)

### 📦 依赖注入 (container/)
依赖注入容器和服务管理：
- `di-container.ts` - DI 容器实现

### ❌ 错误处理 (errors/)
统一的错误处理机制：
- `error-handler.ts` - 错误处理器

### 🛠️ 工具基础 (tools/)
MCP 工具的基础类和接口：
- `standard-mcp-tool.ts` - 标准 MCP 工具基类

## 🛠️ 工具实现 (tools/)

具体的 MCP 工具实现：
- `agent-empowerment.tools.ts` - 代理增强工具
- `enhanced-flexible-tools.ts` - 增强灵活工具
- `flexible-mcp.tools.ts` - 灵活 MCP 工具
- `improved-intent-analysis.ts` - 改进的意图分析
- `init.tool.ts` - 初始化工具
- `memory.tool.ts` - 内存管理工具
- `persona-discovery.tools.ts` - 人格发现工具

## 📝 全局类型 (types.ts)

定义整个项目使用的通用类型和接口。

## 🚀 使用指南

### 导入模块
每个主要模块都提供了 `index.ts` 文件用于统一导入：

```typescript
// 导入核心资产管理功能
import { AssetFactory, UnifiedAssetManager } from './core/assets';

// 导入基础设施组件
import { logger } from './infrastructure/logging';
import { config } from './infrastructure/config';

// 导入共享工具
import { DIContainer } from './shared/container';
```

### 模块职责
- **core/**: 包含业务逻辑，不依赖外部基础设施
- **infrastructure/**: 提供技术基础设施，可被核心模块使用
- **presentation/**: 处理外部接口和协议适配
- **shared/**: 提供跨模块的通用功能
- **tools/**: 实现具体的 MCP 工具功能

## 🔄 迁移说明

此重构保持了所有现有功能的完整性，只是重新组织了文件位置。如果您的代码中有导入路径需要更新，请参考新的模块结构进行调整。

## 📈 优势

1. **清晰的关注点分离**: 每个模块都有明确的职责
2. **更好的可维护性**: 相关功能集中在一起
3. **便于扩展**: 新功能可以轻松添加到相应模块
4. **统一的导入方式**: 通过索引文件简化导入
5. **符合架构最佳实践**: 遵循分层架构原则