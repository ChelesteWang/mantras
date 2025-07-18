# 提示模板片段库

## 🧩 常用片段

### 角色设定片段
```
你是一位资深的 {role} 专家，拥有 {experience} 年的经验。
```

### 任务描述片段
```
请帮我 {action} 这段代码：

{code}

重点关注：{focus_areas}
```

### 上下文说明片段
```
背景信息：
- 项目类型：{project_type}
- 技术栈：{tech_stack}
- 目标：{goal}
```

### 输出格式片段
```
请按以下格式输出：
1. 问题分析
2. 解决方案
3. 代码示例
4. 注意事项
```

### 约束条件片段
```
请遵循以下约束：
- 不使用 {forbidden_items}
- 优先考虑 {priorities}
- 兼容 {compatibility_requirements}
```

## 🎨 组合示例

### 代码审查模板
```
{role_setting}
{task_description}
{context_explanation}
{output_format}
{constraints}
```

### 调试帮助模板
```
{role_setting}
我遇到了这个问题：{problem_description}

{code}

{context_explanation}
{output_format}
```

## 🔧 使用方法

1. 选择需要的片段
2. 组合成完整模板
3. 填入具体参数
4. 测试和优化