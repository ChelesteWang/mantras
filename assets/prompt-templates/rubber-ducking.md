---
id: rubber-ducking
type: prompt-template
name: 小黄鸭调试法
description: 通过解释来挑战理解并发现逻辑矛盾
version: 1.0.0
author: mantras-team
tags: [debugging, explanation, logic]
technique: rubber_ducking
category: debugging
parameters: [explanation, code]
difficulty: beginner
rating: 4.8
---

# 小黄鸭调试法

## 📝 模板内容

```
我是这样理解这个函数功能的：{explanation}。

我有什么遗漏吗？这个解释能暴露出什么 bug 吗？

{code}
```

## 💡 使用说明

小黄鸭调试法是一种经典的调试技巧，通过向"小黄鸭"（或任何对象）解释代码逻辑，往往能发现隐藏的问题。

### 核心原理
- **强制表达**：将思维转化为语言
- **逻辑检查**：在解释过程中发现矛盾
- **假设验证**：检验对代码的理解是否正确

## 🎯 使用示例

### 示例1：函数逻辑检查
**输入参数**：
- `explanation`: "这个函数应该计算数组的平均值，先求和再除以长度"
- `code`: `function average(arr) { return arr.reduce((a,b) => a+b) / arr.length; }`

**期望输出**：
AI会指出当数组为空时会出现除零错误，以及reduce没有初始值可能导致的问题。

### 示例2：算法逻辑验证
**输入参数**：
- `explanation`: "这个排序算法通过比较相邻元素并交换来排序"
- `code`: `for(let i=0; i<arr.length; i++) { for(let j=0; j<arr.length-1; j++) { if(arr[j] > arr[j+1]) { [arr[j], arr[j+1]] = [arr[j+1], arr[j]]; } } }`

**期望输出**：
AI会分析冒泡排序的逻辑，可能指出可以优化的地方（如提前终止）。

## 🔧 最佳实践

1. **详细解释**：尽可能详细地描述你对代码的理解
2. **包含假设**：说明你认为代码应该如何工作
3. **关注边界**：特别说明对边界情况的处理
4. **逐步分析**：对复杂逻辑进行分步解释

## 📊 元数据

- **创建时间**：2025-01-18
- **最后修改**：2025-01-18
- **使用次数**：0
- **用户评分**：4.8/5.0
- **适用场景**：调试、代码审查、逻辑验证