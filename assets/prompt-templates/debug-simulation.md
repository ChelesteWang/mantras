---
id: debug-simulation
type: prompt-template
name: 模拟调试
description: 让AI模拟代码运行时行为
version: 1.0.0
author: mantras-team
tags: [debugging, troubleshooting]
technique: debug_simulation
category: debugging
parameters: [code, focus_area]
difficulty: intermediate
rating: 4.8
---

# 模拟调试

## 📝 模板内容

```
请逐行过一遍这个函数。每个变量的值是什么？代码最有可能在哪里出错？

{code}

特别关注：{focus_area}
```

## 💡 使用说明

让AI模拟代码运行时行为

## 🎯 参数说明

- **{code}**: 请描述此参数的用途
- **{focus_area}**: 请描述此参数的用途

## 📊 元数据

- **创建时间**: 2025-01-18
- **最后修改**: 2025-01-18
- **使用次数**: 0
- **用户评分**: 4.8/5.0
- **难度等级**: intermediate