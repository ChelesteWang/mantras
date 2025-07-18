# 🔍 命令参考手册

完整的 Mantras MCP 命令参考，包括 CLI 工具和 MCP 工具。

## 📦 NPM 脚本命令

### 🏗️ 基础命令
```bash
# 项目构建和启动
npm install          # 安装依赖
npm run build        # 构建项目
npm start           # 启动 MCP 服务器 (开发模式)
npm test            # 运行测试

# MCP 服务器启动
node bin/mantras.js  # 直接启动 MCP 服务器
mantras             # 全局安装后的命令
```

### 📊 资产管理命令
```bash
# 基础操作
npm run assets:list      # 列出所有资产
npm run assets:validate  # 验证资产完整性
npm run assets:stats     # 查看资产统计信息
npm run assets:search    # 搜索资产
npm run assets:export    # 导出资产
npm run assets:import    # 导入资产
npm run assets:backup    # 创建资产备份
```

**详细说明**:
- `assets:list` - 显示所有资产的表格，支持 `--type` 参数过滤
- `assets:validate` - 检查所有资产的完整性和格式
- `assets:stats` - 显示资产数量统计和分布
- `assets:search` - 在资产中搜索关键词
- `assets:export` - 导出资产到指定目录
- `assets:import` - 从文件或目录导入资产
- `assets:backup` - 创建带时间戳的备份

### 🎭 提示模板管理命令
```bash
# 统一管理
npm run prompt:center    # 打开可视化管理中心 (推荐)
npm run prompt:manage    # 启动统一命令行管理器

# 创建方式
npm run prompt:create    # 交互式创建向导
npm run prompt:editor    # Web可视化编辑器

# 分析工具
npm run prompt:analyze   # 模板分析和统计
npm run prompt:quality   # 批量质量检查
```

**详细说明**:
- `prompt:center` - 打开HTML管理中心，提供可视化界面
- `prompt:manage` - 启动交互式管理器，支持所有操作
- `prompt:create` - 问答式创建向导，适合新手
- `prompt:editor` - 打开Web编辑器，支持实时预览
- `prompt:analyze` - 分析模板分布、参数使用等
- `prompt:quality` - 检查模板质量并提供改进建议

## 🔧 CLI 工具命令

### mantras-cli.js
主要的资产管理CLI工具

#### 基础语法
```bash
node bin/mantras-cli.js <command> [options]
```

#### 可用命令

##### list - 列出资产
```bash
node bin/mantras-cli.js list [options]

选项:
  --type <type>     按类型过滤 (persona|prompt|prompt-template|tool)
  --category <cat>  按分类过滤
  --format <fmt>    输出格式 (table|json|csv)
```

**示例**:
```bash
# 列出所有资产
node bin/mantras-cli.js list

# 只显示人格资产
node bin/mantras-cli.js list --type persona

# JSON格式输出
node bin/mantras-cli.js list --format json
```

##### validate - 验证资产
```bash
node bin/mantras-cli.js validate [options]

选项:
  --file <file>     验证特定文件
  --type <type>     验证特定类型
  --verbose         显示详细信息
```

##### create - 创建资产
```bash
node bin/mantras-cli.js create [options]

选项:
  --type <type>     资产类型 (必需)
  --template        使用模板创建
  --interactive     交互式创建
```

##### search - 搜索资产
```bash
node bin/mantras-cli.js search <query> [options]

选项:
  --type <type>     在特定类型中搜索
  --field <field>   搜索特定字段
  --case-sensitive  区分大小写
```

##### export - 导出资产
```bash
node bin/mantras-cli.js export <output> [options]

选项:
  --type <type>     导出特定类型
  --format <fmt>    输出格式 (json|yaml|csv)
  --split           按类型分别保存
```

##### import - 导入资产
```bash
node bin/mantras-cli.js import <source> [options]

选项:
  --format <fmt>    输入格式 (json|yaml)
  --validate        导入前验证
  --overwrite       覆盖现有资产
```

##### backup - 备份资产
```bash
node bin/mantras-cli.js backup <output> [options]

选项:
  --compress        压缩备份文件
  --include-meta    包含元数据
```

##### stats - 统计信息
```bash
node bin/mantras-cli.js stats [options]

选项:
  --detailed        显示详细统计
  --export <file>   导出统计报告
```

### unified-prompt-manager.js
综合提示模板管理器

```bash
node bin/unified-prompt-manager.js

交互式菜单:
1. 📝 创建新模板 (交互式向导)
2. 🧩 从片段组合模板
3. 📄 转换格式 (JSON ↔ Markdown)
4. 🔍 浏览现有模板
5. 🌐 打开Web编辑器
6. 📊 管理片段库
```

### smart-assistant.js
智能分析助手

#### 基础语法
```bash
node bin/smart-assistant.js <command> [args]
```

#### 可用命令

##### analyze - 分析模板
```bash
node bin/smart-assistant.js analyze

输出:
- 模板总数和分类分布
- 难度分布统计
- 常用参数分析
- 优化建议
```

##### quality - 质量检查
```bash
node bin/smart-assistant.js quality

输出:
- 每个模板的质量评分
- 发现的问题列表
- 改进建议
- 平均质量分数
```

##### recommend - 推荐模板结构
```bash
node bin/smart-assistant.js recommend <intent> <domain>

参数:
  intent    意图描述
  domain    领域 (debugging|code-review|optimization|architecture)

示例:
node bin/smart-assistant.js recommend "代码调试" debugging
```

### create-prompt-wizard.js
交互式创建向导

```bash
node bin/create-prompt-wizard.js

交互流程:
1. 输入基础信息 (ID、名称、描述等)
2. 选择创建方式 (手动|片段组合|基于现有)
3. 输入模板内容
4. 添加示例 (可选)
5. 设置元数据
6. 自动保存为双格式 (JSON + Markdown)
```

## 🎯 MCP 工具命令

### 系统工具

#### init - 系统初始化
```bash
mantras__init {
  "includeExamples": true,      # 是否包含示例
  "includeArchitecture": false  # 是否包含架构信息
}
```

### 资产管理工具

#### list_assets - 列出资产
```bash
mantras__list_assets {
  "type": "persona",           # 可选: 按类型过滤
  "category": "debugging"      # 可选: 按分类过滤
}
```

#### get_asset - 获取资产
```bash
mantras__get_asset {
  "assetId": "tech-expert"     # 必需: 资产ID
}
```

### 人格管理工具

#### list_personas - 列出人格
```bash
mantras__list_personas {}
```

#### summon_persona - 召唤人格
```bash
mantras__summon_persona {
  "personaId": "tech-expert",  # 可选: 特定人格ID
  "intent": "technical"       # 可选: 意图描述
}
```

#### summon_by_intent - 基于意图召唤
```bash
mantras__summon_by_intent {
  "intent": "我需要分析代码性能问题"  # 必需: 意图描述
}
```

#### list_active_sessions - 列出活跃会话
```bash
mantras__list_active_sessions {}
```

#### get_session - 获取会话信息
```bash
mantras__get_session {
  "sessionId": "session-123"   # 必需: 会话ID
}
```

#### release_session - 结束会话
```bash
mantras__release_session {
  "sessionId": "session-123"   # 必需: 会话ID
}
```

#### synthesize_persona - 合成人格
```bash
mantras__synthesize_persona {
  "basePersonaIds": ["tech-expert", "creative"],  # 必需: 基础人格ID列表
  "customName": "技术创新专家"                    # 可选: 自定义名称
}
```

### 提示工程工具

#### list_mantras - 列出模板
```bash
mantras__list_mantras {
  "category": "debugging"      # 可选: 按分类过滤
}
```

#### apply_mantra - 应用模板
```bash
mantras__apply_mantra {
  "templateName": "role-prompting",  # 必需: 模板名称
  "inputs": {                        # 必需: 输入参数
    "language": "JavaScript",
    "goal": "性能优化",
    "code": "function example() { ... }"
  }
}
```

### 执行计划工具

#### create_execution_plan - 创建执行计划
```bash
mantras__create_execution_plan {
  "userRequest": "优化这个React应用的性能",  # 必需: 用户请求
  "includeContext": true                    # 可选: 是否包含项目上下文
}
```

#### execute_plan - 执行计划
```bash
mantras__execute_plan {
  "planId": "plan-123"         # 必需: 计划ID
}
```

#### get_project_context - 获取项目上下文
```bash
mantras__get_project_context {
  "includeFileStructure": true,    # 可选: 包含文件结构
  "maxRelevantFiles": 10          # 可选: 最大相关文件数
}
```

## 🔧 高级用法

### 管道操作
```bash
# 导出特定类型并验证
npm run assets:export && npm run assets:validate

# 创建模板后立即分析
npm run prompt:create && npm run prompt:analyze

# 备份后进行质量检查
npm run assets:backup && npm run prompt:quality
```

### 批量操作
```bash
# 批量验证所有JSON文件
find assets/ -name "*.json" -exec node bin/mantras-cli.js validate --file {} \;

# 批量转换格式
node bin/unified-prompt-manager.js
# 选择 "3. 转换格式" -> "3. 批量转换所有JSON → Markdown"
```

### 自动化脚本
```bash
#!/bin/bash
# 每日维护脚本

echo "🔍 验证资产..."
npm run assets:validate

echo "📊 生成统计..."
npm run assets:stats

echo "🎯 质量检查..."
npm run prompt:quality

echo "💾 创建备份..."
npm run assets:backup

echo "✅ 维护完成!"
```

## 🆘 故障排除

### 常见错误

#### 命令未找到
```bash
# 确保在项目根目录
cd /path/to/mantras

# 确保已构建项目
npm run build

# 检查文件权限
chmod +x bin/*.js
```

#### 资产验证失败
```bash
# 查看详细错误信息
npm run assets:validate

# 检查特定文件
node bin/mantras-cli.js validate --file assets/personas/problematic.json --verbose
```

#### MCP工具无响应
```bash
# 检查服务器状态
npm start

# 验证MCP配置
cat ~/.config/mcp/config.json
```

---

这个命令参考手册涵盖了所有可用的命令和选项。建议收藏此页面以便快速查找！