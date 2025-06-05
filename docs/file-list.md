# Mantras-Next 项目文件列表

本文档列出了Mantras-Next项目中的所有文件，按包和功能分类，并提供简短的说明。

## 根目录文件

- **README.md**：项目的主要文档，提供项目概述、安装指南和使用示例
- **README_zh.md**：项目的中文文档，提供项目概述、安装指南和使用示例
- **architecture-design.md**：项目的架构设计文档，详细描述了项目的设计理念和实现细节
- **package.json**：项目的依赖和脚本配置
- **tsconfig.json**：TypeScript编译配置

## 核心包 (@mantras-next/core)

### 配置文件

- **packages/core/package.json**：核心包的依赖和脚本配置
- **packages/core/tsconfig.json**：核心包的TypeScript编译配置

### 接口和类型

- **packages/core/src/interfaces/component.ts**：定义基础组件接口和相关类型
- **packages/core/src/interfaces/callable.ts**：定义可调用组件接口和组合操作符
- **packages/core/src/interfaces/ide-context.ts**：定义IDE上下文接口和相关类型
- **packages/core/src/interfaces/rule.ts**：定义规则接口和相关类型

### 错误处理

- **packages/core/src/errors/index.ts**：定义框架特定的错误类和错误处理机制

### 注册表和服务定位

- **packages/core/src/registry/index.ts**：实现组件注册和查找功能

### 日志系统

- **packages/core/src/logger/index.ts**：实现日志记录功能

### 配置系统

- **packages/core/src/config/index.ts**：实现配置管理功能

### 事件系统

- **packages/core/src/events/index.ts**：实现事件发布和订阅功能

### 扩展点系统

- **packages/core/src/extensions/index.ts**：实现扩展点和插件机制

### 入口文件

- **packages/core/src/index.ts**：导出核心包的公共API

## 工具包 (@mantras-next/tools)

### 配置文件

- **packages/tools/package.json**：工具包的依赖和脚本配置
- **packages/tools/tsconfig.json**：工具包的TypeScript编译配置

### 接口和类型

- **packages/tools/src/interfaces/tool.ts**：定义工具接口和相关类型

### 基础工具类

- **packages/tools/src/base/base-tool.ts**：实现工具的基本功能
- **packages/tools/src/base/ide-tool.ts**：实现IDE特定工具的基本功能
- **packages/tools/src/base/code-tool.ts**：实现代码相关工具的基本功能
- **packages/tools/src/base/file-tool.ts**：实现文件操作工具的基本功能

### 代码工具

- **packages/tools/src/code/code-formatter.ts**：实现代码格式化工具

### 文件工具

- **packages/tools/src/file/file-reader.ts**：实现文件读取工具

### 入口文件

- **packages/tools/src/index.ts**：导出工具包的公共API

## 智能体包 (@mantras-next/agents)

### 配置文件

- **packages/agents/package.json**：智能体包的依赖和脚本配置
- **packages/agents/tsconfig.json**：智能体包的TypeScript编译配置

### 接口和类型

- **packages/agents/src/interfaces/agent.ts**：定义智能体接口和相关类型
- **packages/agents/src/interfaces/memory.ts**：定义记忆系统接口和相关类型

### 基础智能体类

- **packages/agents/src/base/base-agent.ts**：实现智能体的基本功能

### 智能体实现

- **packages/agents/src/implementations/simple-agent.ts**：实现一个简单的智能体
- **packages/agents/src/implementations/simple-memory.ts**：实现一个简单的记忆系统

### 智能体管理器

- **packages/agents/src/manager/agent-manager.ts**：实现智能体的管理和协调

### 入口文件

- **packages/agents/src/index.ts**：导出智能体包的公共API

## 记忆包 (@mantras-next/memory)

### 配置文件

- **packages/memory/package.json**：记忆包的依赖和脚本配置
- **packages/memory/tsconfig.json**：记忆包的TypeScript编译配置

### 入口文件

- **packages/memory/src/index.ts**：导出记忆包的公共API（占位文件，尚未实现）

## LLM集成包 (@mantras-next/llms)

### 配置文件

- **packages/llms/package.json**：LLM集成包的依赖和脚本配置
- **packages/llms/tsconfig.json**：LLM集成包的TypeScript编译配置

### 入口文件

- **packages/llms/src/index.ts**：导出LLM集成包的公共API（占位文件，尚未实现）

## 向量存储包 (@mantras-next/vectorstores)

### 配置文件

- **packages/vectorstores/package.json**：向量存储包的依赖和脚本配置
- **packages/vectorstores/tsconfig.json**：向量存储包的TypeScript编译配置

### 入口文件

- **packages/vectorstores/src/index.ts**：导出向量存储包的公共API（占位文件，尚未实现）

## 示例和配置

### 示例应用

- **examples/simple-app.ts**：一个简单的示例应用，展示如何使用框架的核心功能

### 示例配置

- **examples/configs/sample-agent.yaml**：一个示例智能体配置文件

## 文档

### 入门指南

- **docs/getting-started.md**：框架的入门指南，介绍基本概念和使用方法

### API参考

- **docs/api-reference.md**：框架的API参考文档，详细描述了各个组件的接口和用法

### 项目总结

- **docs/project-summary.md**：项目的总结文档，记录了项目的主要成就和未来方向

### 文件列表

- **docs/file-list.md**：本文档，列出了项目中的所有文件