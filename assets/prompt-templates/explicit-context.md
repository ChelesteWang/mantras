---
id: explicit-context
type: prompt-template
name: 明确上下文
description: 清晰框定问题避免模糊回答
version: 1.0.0
author: mantras-team
tags: [debugging]
technique: explicit_context
category: debugging
parameters: [problem, code, expected, actual]
difficulty: beginner
rating: 4.8
---

# 明确上下文

## 📝 模板内容

```
问题是：{problem}。代码如下：

{code}

它本应 {expected}，但现在却 {actual}。这是为什么？
```

## 💡 使用说明

清晰框定问题避免模糊回答

## 🎯 参数说明

- **{problem}**: 请描述此参数的用途
- **{code}**: 请描述此参数的用途
- **{expected}**: 请描述此参数的用途
- **{actual}**: 请描述此参数的用途

## 📊 元数据

- **创建时间**: 2025-01-18
- **最后修改**: 2025-01-18
- **使用次数**: 0
- **用户评分**: 4.8/5.0
- **难度等级**: beginner