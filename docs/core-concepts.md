# 🧠 核心概念

理解 Mantras MCP 的核心概念，快速掌握系统精髓。

## 🎯 设计理念

### AI 代理 = 人格 + 提示 + 工具

```
🎭 人格 (Persona) + 📝 提示 (Prompt) + 🔧 工具 (Tool) = 🤖 AI 代理
```

### 统一资产管理

所有组件都是**资产 (Assets)**：
- 📦 **统一存储** - 集中管理
- 🔍 **统一查询** - 按类型查找
- ✅ **统一验证** - 保证质量

## 📦 核心资产类型

### 🎭 人格 (Personas)
定义 AI 的角色和专业领域。

**现有人格**：
- `analyst` - 数据分析师
- `tech-expert` - 技术专家  
- `creative` - 创意作家
- `therapist` - 支持倾听者

### 📝 提示模板 (Prompt Templates)
基于提示工程最佳实践的参数化模板。

**10大核心技巧**：
1. 角色提示 - 设定专家角色
2. 明确上下文 - 清晰框定问题
3. 输入输出示例 - 通过示例展示意图
4. 迭代式链条 - 分解复杂任务
5. 模拟调试 - AI模拟代码运行
6. 功能蓝图 - AI主导的规划
7. 重构指导 - 目标对齐的重构
8. 寻求替代方案 - 探索不同实现
9. 小黄鸭调试法 - 通过解释发现问题
10. 约束锚定 - 设定明确边界

### 🔧 工具 (Tools)
可执行的功能模块。

**MCP工具类型**：
- **系统工具** - `init`, `list_assets`
- **人格工具** - `summon_persona`, `list_personas`
- **模板工具** - `apply_mantra`, `list_mantras`

## 🏗️ 系统架构

### 分层架构
```
MCP 协议层    ← 标准化接口
服务器层      ← 工具注册和执行
资产管理层    ← 统一资产管理
业务逻辑层    ← 人格、模板、工具
数据层        ← 资产存储
```

### 核心组件

- **统一资产管理器** - 集中管理所有资产
- **人格召唤器** - 动态召唤和管理人格
- **提示模板系统** - 管理参数化模板
- **工具执行器** - 注册和管理工具

## 🎯 设计原则

1. **组合优于继承** - 通过组合创建专门化代理
2. **约定优于配置** - 提供合理默认配置
3. **渐进式增强** - 核心功能开箱即用
4. **类型安全** - 完整的 TypeScript 类型系统

## 🎭 使用模式

- **专家咨询** = 专家人格 + 专业模板 + 分析工具
- **创意协作** = 创意人格 + 头脑风暴模板 + 内容工具
- **技术支持** = 技术专家 + 调试模板 + 代码工具

## 💡 最佳实践

### 资产设计
1. **单一职责** - 每个资产专注一个领域
2. **清晰命名** - 使用描述性的ID和名称
3. **完整文档** - 提供详细的描述和示例

### 系统使用
1. **合理组合** - 根据需求选择合适的资产组合
2. **定期维护** - 保持资产的更新和优化
3. **性能监控** - 关注系统性能和资源使用

---

理解了这些核心概念，您就可以高效使用 Mantras MCP 系统了！