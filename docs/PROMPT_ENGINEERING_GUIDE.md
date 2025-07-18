# 提示工程增强功能使用指南

## 概述

Mantras MCP 服务器现已集成《程序员的提示工程实战手册》中的10大核心技巧，提供标准化的提示模板来提升AI编程助手的效果。

## 新增功能

### 1. 提示模板管理

- **10个核心模板**：基于手册的最佳实践
- **分类管理**：按用途分类（调试、重构、实现等）
- **参数化模板**：支持动态输入替换

### 2. 新增 MCP 工具

#### `list_mantras` - 列出所有提示模板
```bash
# 列出所有模板
mantras__list_mantras

# 按分类过滤
mantras__list_mantras {"category": "debugging"}
```

#### `apply_mantra` - 应用提示模板
```bash
mantras__apply_mantra {
  "templateName": "role-prompting",
  "inputs": {
    "language": "JavaScript",
    "goal": "性能优化",
    "code": "function slow() { return 1; }"
  }
}
```

#### `create_execution_plan` - 创建执行计划
```bash
mantras__create_execution_plan {
  "userRequest": "我需要调试这个JavaScript函数的性能问题",
  "includeContext": true
}
```

#### `get_project_context` - 获取项目上下文
```bash
mantras__get_project_context {
  "includeFileStructure": true,
  "maxRelevantFiles": 10
}
```

## 10大提示技巧模板

### 1. 角色提示 (role-prompting)
**用途**：设定专家角色获得高质量建议
**参数**：`language`, `goal`, `code`
**分类**：code-review

### 2. 明确上下文 (explicit-context)
**用途**：清晰框定问题避免模糊回答
**参数**：`problem`, `code`, `expected`, `actual`
**分类**：debugging

### 3. 输入输出示例 (input-output-examples)
**用途**：通过具体示例展示意图
**参数**：`input`, `output`, `code`
**分类**：implementation

### 4. 迭代式链条 (iterative-chaining)
**用途**：将复杂任务分解成连续小步骤
**参数**：`step1`, `step2`, `step3`, `current_step`
**分类**：planning

### 5. 模拟调试 (debug-simulation)
**用途**：让AI模拟代码运行时行为
**参数**：`code`, `focus_area`
**分类**：debugging

### 6. 功能蓝图 (feature-blueprinting)
**用途**：借助AI主导的规划和脚手架能力
**参数**：`feature`, `requirements`, `tech_stack`
**分类**：architecture

### 7. 重构指导 (refactor-guidance)
**用途**：确保重构与核心目标对齐
**参数**：`goal`, `specific_aspects`, `code`
**分类**：refactoring

### 8. 寻求替代方案 (ask-alternatives)
**用途**：探索多种不同的实现路径
**参数**：`alternative_style`, `alternative_approach`, `code`
**分类**：optimization

### 9. 小黄鸭调试法 (rubber-ducking)
**用途**：通过解释来挑战理解并发现逻辑矛盾
**参数**：`explanation`, `code`
**分类**：debugging

### 10. 约束锚定 (constraint-anchoring)
**用途**：给AI设定明确的边界和限制
**参数**：`avoid`, `constraints`, `optimization_target`, `code`
**分类**：optimization

## 使用示例

### 场景1：代码审查
```bash
mantras__apply_mantra {
  "templateName": "role-prompting",
  "inputs": {
    "language": "TypeScript",
    "goal": "安全性检查",
    "code": "function authenticate(token: string) { return token === 'admin'; }"
  }
}
```

### 场景2：调试问题
```bash
mantras__apply_mantra {
  "templateName": "explicit-context",
  "inputs": {
    "problem": "函数返回错误结果",
    "code": "function add(a, b) { return a + b; }",
    "expected": "数字相加",
    "actual": "字符串拼接"
  }
}
```

### 场景3：性能优化
```bash
mantras__apply_mantra {
  "templateName": "constraint-anchoring",
  "inputs": {
    "avoid": "递归",
    "constraints": "ES6语法，不使用外部库",
    "optimization_target": "内存占用",
    "code": "function fibonacci(n) { if(n<=1) return n; return fibonacci(n-1) + fibonacci(n-2); }"
  }
}
```

## 最佳实践

1. **选择合适的模板**：根据具体需求选择最匹配的技巧
2. **提供完整参数**：确保所有必需参数都有意义的值
3. **迭代优化**：根据AI回复调整输入参数
4. **组合使用**：复杂问题可以组合多个模板

## 技术实现

- **零技术债务**：完全复用现有Asset系统
- **类型安全**：TypeScript接口确保类型正确
- **可扩展**：易于添加新的模板和技巧
- **向后兼容**：不影响现有功能

## 后续计划

- 根据用户反馈优化模板
- 添加更多专业领域的模板
- 集成AI自动推荐最佳模板功能