# 提示工程增强功能 - 精简实施方案

## 核心理念：如无必要，勿增实体

基于《程序员的提示工程实战手册》，采用最小化原则，只添加真正必要的功能。

## 1. 现状分析

Mantras MCP 服务器已具备：
- ✅ 完善的 Asset 系统（可复用）
- ✅ Persona 管理（可扩展）
- ✅ 会话管理
- ✅ 模板化能力

**真正需要的**：将手册中的 10 大提示工程技巧转化为可用的模板

## 2. 精简方案

### 2.1 复用现有 Asset 系统

将提示模板作为新的 Asset 类型：

```typescript
// 扩展 src/types.ts
export type AssetType = 'persona' | 'prompt' | 'tool' | 'prompt-template';

export interface PromptTemplate extends Asset {
  type: 'prompt-template';
  technique: string;        // 对应手册中的技巧
  template: string;         // 模板内容
  parameters: string[];     // 参数列表
  category: string;         // 分类
}
```

### 2.2 最小化新增功能

只添加 **1个** 新的 MCP 工具：
- **`apply_prompt_template`** - 应用提示模板

（`list_prompt_templates` 复用现有的 `list_assets`）

### 2.3 内置 10 个核心模板

基于手册创建精简的提示模板，存储在现有 asset 系统中。

## 3. 具体实施

### 3.1 扩展类型定义（5 行代码）

```typescript
// 在 src/types.ts 中添加
export type AssetType = 'persona' | 'prompt' | 'tool' | 'prompt-template';

export interface PromptTemplate extends Asset {
  type: 'prompt-template';
  technique: string;
  template: string;
  parameters: string[];
  category: string;
}
```

### 3.2 创建内置模板（1 个文件）

```typescript
// src/prompt-templates.ts
export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'role-prompting',
    type: 'prompt-template',
    name: '角色提示',
    description: '设定专家角色获得高质量建议',
    technique: 'role_prompting',
    template: '你是一位资深的 {language} 开发者。请为了 {goal} 来审查这个函数：\n\n{code}',
    parameters: ['language', 'goal', 'code'],
    category: 'debugging'
  },
  
  {
    id: 'explicit-context',
    type: 'prompt-template',
    name: '明确上下文',
    description: '清晰框定问题避免模糊回答',
    technique: 'explicit_context',
    template: '问题：{problem}。代码：{code}。预期：{expected}，实际：{actual}。为什么？',
    parameters: ['problem', 'code', 'expected', 'actual'],
    category: 'debugging'
  }
  
  // ... 其他 8 个模板
];
```

### 3.3 添加 MCP 工具（20 行代码）

```typescript
// 在 server.ts 中添加
import { PROMPT_TEMPLATES } from './prompt-templates';

server.tool(
  "apply_prompt_template",
  "Apply a prompt engineering template",
  {
    templateId: z.string(),
    inputs: z.record(z.string())
  },
  async ({ templateId, inputs }) => {
    const template = PROMPT_TEMPLATES.find(t => t.id === templateId);
    if (!template) throw new Error(`Template ${templateId} not found`);
    
    let result = template.template;
    template.parameters.forEach(param => {
      result = result.replace(new RegExp(`{${param}}`, 'g'), inputs[param] || '');
    });
    
    return {
      content: [{ type: "text", text: result }]
    };
  }
);

## 4. 使用示例

```bash
# 列出提示模板（复用现有功能）
mantras__list_assets

# 应用角色提示模板
mantras__apply_prompt_template {
  "templateId": "role-prompting",
  "inputs": {
    "language": "JavaScript",
    "goal": "性能优化", 
    "code": "function slow() { ... }"
  }
}
```

## 5. 实施计划

**总工作量**：1-2 天

- [ ] 扩展类型定义（30 分钟）
- [ ] 创建 10 个内置模板（4 小时）
- [ ] 添加 MCP 工具（1 小时）
- [ ] 简单测试（1 小时）

## 6. 优势

- 🎯 **专注核心价值**：提供手册中的 10 大技巧模板
- 🚀 **快速交付**：2天完成 vs 原计划 14周
- 💡 **零技术债务**：完全复用现有架构
- 📈 **渐进增强**：后续可按需添加功能

**核心原则**：先让用户用起来，再根据反馈优化。