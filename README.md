# Mantras MCP 服务器

企业级 AI 资产管理和 Persona 召唤系统。

## 🚀 快速开始

```bash
npm install && npm run build
npm run prompt:center    # 打开管理中心
npm run assets:list      # 查看资产状态
npm start               # 启动MCP服务器
```

## 🎭 核心功能

### AI 资产管理
- **17个已验证资产** - 6个人格 + 10个提示模板 + 1个提示
- **CLI管理工具** - 完整的命令行工具集
- **质量控制** - 自动验证和完整性检查

### Persona 召唤系统
- **6个专业人格** - 数据分析师、技术专家、创意作家等
- **智能召唤** - 基于意图的自动人格选择
- **会话管理** - 多会话并发和状态管理

### 提示工程增强
- **10大核心技巧** - 基于最佳实践的模板
- **三种创建方式** - 向导、Web编辑器、片段组合
- **双格式支持** - JSON系统格式 + Markdown人类格式

## 🛠️ 管理工具

```bash
# 资产管理
npm run assets:list      # 列出资产
npm run assets:validate  # 验证完整性
npm run assets:backup    # 创建备份

# 提示模板管理
npm run prompt:center    # 管理中心
npm run prompt:editor    # Web编辑器
npm run prompt:create    # 创建向导
npm run prompt:analyze   # 智能分析
```

## 📚 文档

完整文档请查看 [docs/](./docs/) 目录：
- [快速开始](./docs/getting-started.md) - 5分钟上手指南
- [核心概念](./docs/core-concepts.md) - 系统设计理念
- [功能指南](./docs/guides/) - 详细使用说明

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