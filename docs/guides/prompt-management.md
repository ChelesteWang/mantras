# 🎭 Mantras 综合提示模板管理系统

## 🎯 系统概览

我们将四种提示模板维护方案整合为一个统一的管理系统，提供从新手到专家的完整解决方案。

## 🚀 快速开始

### 一键启动管理中心
```bash
npm run prompt:center
```
打开可视化管理中心，包含所有功能的统一入口。

### 统一管理器
```bash
npm run prompt:manage
```
启动交互式统一管理器，支持所有操作模式。

## 🎭 四种管理方式详解

### 1. 交互式创建向导 🎯
**适合**: 新手用户、快速原型

```bash
npm run prompt:create
```

**特点**:
- ✅ 零学习成本，问答式引导
- ✅ 自动参数检测和验证
- ✅ 同时生成JSON和Markdown格式
- ✅ 内置最佳实践建议

**使用场景**:
- 第一次创建模板
- 快速原型验证
- 团队新成员培训

### 2. 片段组合系统 🧩
**适合**: 复杂模板构建、标准化

```bash
# 查看片段库
code templates/prompt-snippets.md

# 通过统一管理器组合
npm run prompt:manage
# 选择 "2. 从片段组合模板"
```

**特点**:
- ✅ 模块化设计，可复用
- ✅ 标准化片段，确保一致性
- ✅ 快速组合，像搭积木
- ✅ 最佳实践沉淀

**可用片段**:
- 角色设定片段
- 任务描述片段
- 上下文说明片段
- 输出格式片段
- 约束条件片段

### 3. Markdown 格式维护 📝
**适合**: 开发者日常维护、版本控制

```bash
# 查看Markdown示例
code assets/prompt-templates/rubber-ducking.md

# 转换格式
npm run prompt:manage
# 选择 "3. 转换格式"
```

**特点**:
- ✅ 易读易写，语法高亮
- ✅ Git友好，版本控制
- ✅ 文档即代码
- ✅ 搜索友好

**文件结构**:
```markdown
---
id: template-id
name: 模板名称
description: 模板描述
---

# 模板名称

## 📝 模板内容
```
模板内容...
```

## 💡 使用说明
详细说明...
```

### 4. Web可视化编辑器 🌐
**适合**: 非技术用户、团队协作

```bash
npm run prompt:editor
```

**特点**:
- ✅ 所见即所得，实时预览
- ✅ 图形界面，操作简单
- ✅ 片段快速插入
- ✅ 多格式导出

**界面功能**:
- 分标签页设计（基础信息/模板内容/示例/预览）
- 参数自动检测
- 片段库集成
- 实时预览和导出

## 🛠️ 智能辅助工具

### 模板分析器
```bash
npm run prompt:analyze
```
- 📊 统计模板分布
- 🔍 分析参数使用
- 💡 提供优化建议

### 质量检查器
```bash
npm run prompt:quality
```
- ✅ 批量质量评分
- 🔍 发现潜在问题
- 📈 生成改进建议

### 智能推荐
```bash
node bin/smart-assistant.js recommend debugging code-review
```
- 🤖 推荐模板结构
- 🎯 建议参数设计
- 🧩 推荐片段组合

## 🔄 推荐工作流

### 新手入门路径
```
1. npm run prompt:center     # 打开管理中心了解功能
2. npm run prompt:editor     # 用Web编辑器了解结构
3. npm run prompt:create     # 用向导创建第一个模板
4. npm run prompt:manage     # 学习统一管理器
```

### 开发者路径
```
1. npm run prompt:analyze    # 分析现有模板
2. code templates/prompt-snippets.md  # 了解片段库
3. npm run prompt:manage     # 用片段组合复杂模板
4. code assets/prompt-templates/  # Markdown格式维护
```

### 团队协作路径
```
1. npm run prompt:center     # 团队共享管理中心
2. npm run prompt:editor     # 非技术人员使用Web编辑器
3. npm run prompt:quality    # 定期质量检查
4. Git版本控制Markdown文件  # 代码审查和协作
```

## 📊 统一管理器功能详解

运行 `npm run prompt:manage` 后的选项：

### 1. 📝 创建新模板 (交互式向导)
- 引导式问答创建
- 支持三种创建方式：
  - 手动输入
  - 片段组合
  - 基于现有模板修改

### 2. 🧩 从片段组合模板
- 显示可用片段列表
- 交互式选择和组合
- 实时预览组合结果

### 3. 📄 转换格式 (JSON ↔ Markdown)
- 单文件转换
- 批量转换
- 双向格式支持

### 4. 🔍 浏览现有模板
- 列出所有模板文件
- 查看模板内容
- 支持编辑、复制、转换

### 5. 🌐 打开Web编辑器
- 自动启动浏览器
- 打开可视化编辑界面

### 6. 📊 管理片段库
- 查看所有片段
- 添加新片段
- 编辑现有片段
- 导出片段库

## 🎯 最佳实践建议

### 选择合适的方式
- **探索学习** → Web编辑器 + 交互向导
- **日常开发** → Markdown格式 + 片段系统
- **团队协作** → 统一管理器 + 版本控制
- **质量保证** → 智能分析 + 质量检查

### 工作流建议
1. **用Web编辑器快速原型**
2. **用交互向导标准化输出**
3. **用片段系统构建复杂模板**
4. **用Markdown格式长期维护**

### 团队协作
1. **建立片段库标准**
2. **定期质量检查**
3. **版本控制Markdown文件**
4. **代码审查模板变更**

## 🔧 技术实现

### 核心组件
- `unified-prompt-manager.js` - 统一管理器
- `smart-assistant.js` - 智能分析助手
- `create-prompt-wizard.js` - 交互式向导
- `prompt-editor.html` - Web可视化编辑器
- `management-center.html` - 管理中心界面

### 支持格式
- **JSON** - 系统标准格式
- **Markdown** - 人类友好格式
- **片段** - 可复用组件

### 自动化功能
- 参数自动检测
- 格式自动转换
- 质量自动评分
- 问题自动发现

这个综合系统将四种方案的优势完美结合，为不同用户和场景提供最适合的解决方案！