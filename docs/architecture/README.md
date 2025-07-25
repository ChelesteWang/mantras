# Mantras MCP 服务器 - 架构文档

## 设计理念

### 现代化企业级架构

Mantras 项目采用现代化的企业级架构模式，确保代码的可维护性、可测试性和可扩展性：

- **依赖注入**: 统一服务管理，降低组件间耦合度
- **配置管理**: 类型安全的配置系统，支持多环境部署
- **错误处理**: 结构化错误分类和全局监控
- **监控统计**: 实时性能监控和健康检查

### 组合式 AI 代理架构

基于现代 AI 代理的核心理念：**AI 代理 = 人格 + 提示 + 工具**

这种组合式架构允许通过不同组件的灵活组合，创建专门化的 AI 代理来满足特定的开发需求。

### 统一资产管理

**核心洞察**: 人格、提示模板和工具都是资产 (Assets)

所有组件都被视为统一的资产，通过统一的资产管理系统进行集中管理：
- **统一接口**: 所有资产都继承 `Asset` 基础接口
- **类型安全**: 通过 TypeScript 确保类型一致性
- **集中管理**: 单一入口管理所有资产的生命周期
- **灵活查询**: 支持按类型、能力、类别等多维度查询

## 核心架构组件

### 1. 应用程序核心 (Application Core)
- **文件**: `server.ts`
- **功能**: 主服务器，集成所有架构组件
- **特性**:
  - 依赖注入容器集成
  - 配置管理系统
  - 全局错误处理
  - 优雅启动和关闭
  - 监控和健康检查

### 2. 依赖注入容器 (DI Container)
- **文件**: `shared/container/di-container.ts`
- **功能**: 统一服务管理和依赖解析
- **特性**:
  - 单例和瞬态服务支持
  - 依赖关系验证
  - 作用域管理
  - 装饰器支持

### 3. 配置管理系统 (Configuration Management)
- **文件**: `config/environment.ts`
- **功能**: 类型安全的配置管理
- **特性**:
  - 环境变量支持
  - 配置文件加载
  - 配置验证和类型安全
  - 动态配置更新
  - 功能开关管理

### 4. 全局错误处理 (Error Handling)
- **文件**: `shared/errors/error-handler.ts`
- **功能**: 统一错误处理和监控
- **特性**:
  - 结构化错误分类
  - 错误统计和监控
  - 错误上下文追踪
  - 错误恢复机制

### 5. 工具注册系统 (Tool Registry)
- **文件**: `presentation/mcp/tool-registry.ts`
- **功能**: MCP 工具的统一注册和管理
- **特性**:
  - 工具定义和验证
  - 速率限制
  - 执行中间件
  - 工具统计和监控

## 资产管理组件

### 6. 统一资产管理器 (Unified Asset Manager)
- **文件**: `unified-asset-manager.ts`
- **功能**: 集中管理所有类型的资产（人格、提示模板、工具）
- **特性**:
  - 统一的资产注册和查询接口
  - 按类型、能力、类别的多维度查询
  - 资产验证和完整性检查
  - 缓存和性能优化

### 7. 资产工厂 (Asset Factory)
- **文件**: `asset-factory.ts`
- **功能**: 统一的资产创建、验证和操作
- **特性**:
  - 类型安全的资产创建方法
  - 完整的资产验证逻辑
  - 资产克隆和合并功能

### 8. 资产加载器 (Asset Loader)
- **文件**: `asset-loader.ts`
- **功能**: 资产的导入导出和序列化
- **特性**:
  - 从文件、目录、URL加载资产
  - 资产验证和过滤
  - 多种格式的导出
  - 按类型分组保存

### 1. 人格系统 (Personas)
- **文件**: `persona-summoner.ts`
- **功能**: 定义 AI 的角色、特质、沟通风格和专业领域
- **特性**: 
  - 动态召唤和会话管理
  - 能力约束和专业化
  - 支持人格合成和定制

### 2. 提示模板 (Prompt Templates)
- **文件**: `prompt-templates.ts`
- **功能**: 结构化的提示工程技巧库
- **特性**:
  - 参数化模板，可复用
  - 按类别组织（调试、重构、架构等）
  - 封装最佳实践

### 3. 工具系统 (Tools)
- **文件**: `tool-executor.ts`
- **功能**: 可执行的功能模块
- **特性**:
  - 标准化接口和参数验证
  - 支持动态注册和扩展
  - 与 AI 工作流无缝集成

### 4. 记忆系统 (Memory)
- **文件**: `memory.ts`
- **功能**: 会话上下文保持和学习适应
- **特性**:
  - 会话状态管理
  - 上下文感知能力

### 5. 资产管理 (Asset Repository)
- **文件**: `asset-repository.ts`
- **功能**: 统一的资产获取和缓存
- **特性**:
  - 支持本地和远程资产
  - 缓存优化
  - 版本管理

## 架构优势

### 1. 模块化设计
- 每个组件独立开发和测试
- 清晰的职责分离
- 易于维护和调试

### 2. 可组合性
- 灵活组合不同组件创建专门代理
- 支持运行时动态配置
- 满足多样化需求

### 3. 可扩展性
- 新的人格、模板、工具可轻松添加
- 插件式架构
- 向后兼容

### 4. 标准化接口
- 通过 MCP 协议提供统一接口
- 跨平台兼容
- 易于集成

### 5. 企业级特性
- **类型安全**: 完整的 TypeScript 类型系统
- **数据完整性**: 资产验证和约束检查
- **可观测性**: 变更监听和事件通知
- **数据管理**: 导入导出、快照恢复
- **测试覆盖**: 完整的单元测试套件

## 实际应用场景

### 代码审查代理
```typescript
{
  persona: "tech-expert",
  template: "role-prompting", 
  tools: ["code-analyzer", "security-scanner"]
}
```

### 创意内容代理
```typescript
{
  persona: "creative",
  template: "narrative-structure",
  tools: ["content-generator", "style-checker"]
}
```

### 数据分析代理
```typescript
{
  persona: "analyst",
  template: "explicit-context",
  tools: ["data-processor", "visualization-tool"]
}
```

## 数据流

1. **请求接收**: 客户端通过 MCP 协议发送请求
2. **组件协调**: 服务器根据请求类型调用相应组件
3. **代理组装**: 动态组合人格、模板和工具
4. **任务执行**: 组装的代理执行具体任务
5. **结果返回**: 处理结果返回给客户端

## 扩展方式

### 添加新人格
1. 在 `persona-summoner.ts` 中定义新人格
2. 配置角色特质和能力约束
3. 测试人格行为和响应质量

### 添加新模板
1. 在 `prompt-templates.ts` 中添加模板
2. 定义参数和使用场景
3. 归类到相应技术分类

### 添加新工具
1. 在 `tools/` 目录下实现工具
2. 在 `tool-executor.ts` 中注册
3. 配置参数验证和错误处理

### 扩展记忆能力
1. 增强 `memory.ts` 的存储机制
2. 添加学习和适应算法
3. 优化上下文管理

## 技术栈

- **运行时**: Node.js + TypeScript
- **协议**: @modelcontextprotocol/sdk
- **测试**: Jest
- **验证**: Zod
- **日志**: 自定义日志系统

## 开发原则

1. **简单优先**: 保持架构简洁，避免过度设计
2. **按需扩展**: 根据实际需求逐步增加功能
3. **标准化**: 遵循 MCP 协议和最佳实践
4. **可测试**: 每个组件都有完整的测试覆盖
5. **文档驱动**: 保持文档与代码同步更新

---

**核心价值**: 通过组合式架构，为开发者提供强大而灵活的 AI 辅助平台