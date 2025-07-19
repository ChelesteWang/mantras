# 🚀 快速开始指南

欢迎使用 Mantras MCP！这个5分钟指南将帮助您快速上手现代化的 AI 资产管理和 Persona 召唤系统。

## 📋 前置要求

- Node.js 18+ 
- npm 或 yarn
- 基本的命令行操作知识
- 支持 MCP 的 AI 客户端（如 Claude Desktop）

## ⚡ 快速安装

### 1. 克隆和安装
```bash
# 克隆项目
git clone <repository-url>
cd mantras

# 安装依赖
npm install

# 构建项目
npm run build
```

### 2. 启动服务器
```bash
# 启动 MCP 服务器
npm start

# 或者使用构建时优化的资产（推荐生产环境）
npm start -- --use-build-assets

# 开发模式（支持热重载）
npm run dev
```

### 3. 验证安装
```bash
# 检查资产状态
npm run assets:validate

# 查看资产列表
npm run assets:list
```

如果看到类似输出，说明安装成功：
```
✅ 有效: 20+ 个资产
❌ 无效: 0
总计: 人格 10 个，提示模板 10 个
```

## 🎭 第一次体验

### 方式一：MCP 工具调用（推荐）

在支持 MCP 的客户端中，您可以直接调用以下工具：

```bash
# 1. 系统初始化和概览
init

# 2. 查看所有可用人格
list_personas

# 3. 召唤一个技术专家
summon_persona --personaId tech-expert --intent technical

# 4. 查看所有提示模板
list_mantras

# 5. 应用一个提示模板
apply_mantra --templateName role-prompting --inputs '{"role": "代码审查专家", "task": "审查 TypeScript 代码"}'
```

### 方式二：可视化管理中心
```bash
# 打开管理中心
open tools/management-center.html

# 或者打开提示编辑器
open tools/prompt-editor.html
```
- 查看使用示例

### 方式二：命令行体验
```bash
# 查看系统概览
npm run assets:stats

# 创建第一个模板
npm run prompt:create

# 分析现有模板
npm run prompt:analyze
```

## 🎯 核心功能体验

### 1. 资产管理
```bash
# 查看所有资产
npm run assets:list

# 按类型查看
npm run assets:list --type persona

# 搜索资产
npm run assets:search "调试"

# 备份资产
npm run assets:backup
```

### 2. 提示模板管理
```bash
# 统一管理器
npm run prompt:manage

# 交互式创建
npm run prompt:create

# Web编辑器
npm run prompt:editor

# 质量检查
npm run prompt:quality
```

### 3. MCP工具使用
```bash
# 启动MCP服务器
npm start

# 在另一个终端测试MCP工具
# (需要配置MCP客户端)
```

## 🎓 学习路径

### 👶 新手推荐路径
1. **了解概念** - 阅读 [核心概念](./core-concepts.md)
2. **可视化体验** - 运行 `npm run prompt:center`
3. **创建模板** - 运行 `npm run prompt:create`
4. **查看文档** - 浏览 [功能指南](./guides/)

### 👨‍💻 开发者路径
1. **架构理解** - 阅读 [架构文档](./architecture/)
2. **代码分析** - 查看 `src/` 目录
3. **测试运行** - 运行 `npm test`
4. **扩展开发** - 参考 [开发指南](./development/)

## 🔧 常见问题

### Q: 构建失败怎么办？
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Q: 资产验证失败？
```bash
# 查看详细错误
npm run assets:validate

# 修复常见问题
npm run prompt:quality
```

### Q: 如何添加新的提示模板？
```bash
# 使用交互式向导
npm run prompt:create

# 或使用Web编辑器
npm run prompt:editor
```

### Q: 如何备份我的资产？
```bash
# 创建备份
npm run assets:backup

# 导出特定类型
npm run assets:export
```

## 🎯 下一步

根据您的需求选择：

### 📝 内容创作者
- 学习 [提示工程基础](./prompt-engineering/basics.md)
- 掌握 [10大核心技巧](./prompt-engineering/techniques.md)
- 使用 [模板管理工具](./guides/prompt-management.md)

### 🛠️ 开发者
- 了解 [系统架构](./architecture/)
- 设置 [开发环境](./development/setup.md)
- 查看 [API参考](./development/api-reference.md)

### 🚀 运维人员
- 阅读 [部署指南](./operations/deployment.md)
- 配置 [监控系统](./operations/monitoring.md)
- 学习 [故障排除](./operations/troubleshooting.md)

## 💡 小贴士

- 使用 `npm run prompt:center` 作为主要入口
- 定期运行 `npm run assets:validate` 检查资产健康度
- 查看 `npm run prompt:analyze` 了解使用统计
- 遇到问题先查看 [故障排除指南](./operations/troubleshooting.md)

## 🆘 获取帮助

- 📖 查看完整文档：[docs/](./README.md)
- 🐛 报告问题：创建 GitHub Issue
- 💬 讨论交流：参与社区讨论
- 📧 联系我们：mantras-team@example.com

---

🎉 **恭喜！** 您已经完成了快速开始。现在可以开始探索 Mantras MCP 的强大功能了！