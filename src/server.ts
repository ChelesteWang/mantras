import { RemoteAssetRepository } from './asset-repository';
import { PersonaSummoner } from './persona-summoner';
import { PROMPT_TEMPLATES } from './prompt-templates';
import { initTool } from './tools/init.tool';
import { Command } from 'commander';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 解析命令行参数
const program = new Command();
program
  .option('--personas <path>', 'Path to local assets JSON file')
  .parse(process.argv);
const options = program.opts();

// 实例化资产仓库和persona召唤器
const repository = new RemoteAssetRepository(options.personas);
const personaSummoner = new PersonaSummoner();

// 创建支持参数提取的MCP服务器
const server = new McpServer({
  name: "ai-asset-manager-persona-summoner",
  version: "2.0.0"
});

// 注册 init 工具 - 系统初始化和概览
server.tool(
  "init",
  "Initialize and provide comprehensive overview of the Mantra MCP system for AI agents",
  {
    includeExamples: z.boolean().optional().describe("Whether to include usage examples"),
    includeArchitecture: z.boolean().optional().describe("Whether to include system architecture details")
  },
  async ({ includeExamples, includeArchitecture }) => {
    const result = await initTool.execute({ includeExamples, includeArchitecture });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

// 注册工具 - 使用registerTool with proper parameter extraction
server.tool(
  "list_assets",
  "List all available assets including personas, prompts, and tools",
  {},
  async () => {
    const assets = await repository.getAssets();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(assets, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "get_asset",
  "Get specific asset by ID",
  { assetId: z.string().describe("Asset ID to retrieve") },
  async ({ assetId }) => {
    // logToFile(`get_asset called with: ${JSON.stringify({ assetId })}`);

    const asset = await repository.getAssetById(assetId);
    // logToFile(`Found asset: ${asset ? asset.name : 'NOT_FOUND'}`);

    if (!asset) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: "Invalid asset ID",
              requestedAssetId: assetId,
              available: (await repository.getAssets()).map(a => a.id)
            }, null, 2)
          }
        ]
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(asset, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "list_personas",
  "List all available persona definitions",
  {},
  async () => {
    const personas = personaSummoner.getPersonas();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(personas, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "summon_persona",
  "Summon or activate a specific persona",
  {
    personaId: z.string().optional().describe("Specific persona ID to summon"),
    intent: z.string().optional().describe("Intent/type of interaction (e.g., 'technical', 'creative', 'analytical')"),
    customParams: z.record(z.any()).optional().describe("Custom parameters for persona customization")
  },
  async ({ personaId, intent, customParams }) => {
    // logToFile(`summon_persona called: ${JSON.stringify({ personaId, intent })}`);

    const summoned = personaSummoner.summonPersona({
      personaId,
      intent,
      customParams
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(summoned, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "summon_by_intent",
  "Automatically summon the best persona for your intent",
  {
    intent: z.string().describe("The user's intent or situation description")
  },
  async ({ intent }) => {
    // logToFile(`summon_by_intent called with intent: ${intent}`);

    const summoned = personaSummoner.summonPersona({ intent });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            persona: summoned.persona,
            recommendation: `Summoned ${summoned.persona.name} for: ${intent}`,
            confidence: summoned.metadata.confidence
          }, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "list_active_sessions",
  "List all active persona sessions",
  {},
  async () => {
    const sessions = personaSummoner.getActiveSessions();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(sessions, null, 2)
        }
      ]
    };
  }
);



server.tool(
  "get_session",
  "Get details of a specific session",
  { sessionId: z.string().describe("The ID of the session to retrieve") },
  async ({ sessionId }) => {
    const session = personaSummoner.getSession(sessionId);
    if (session) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(session, null, 2)
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: "Session not found" }, null, 2)
          }
        ]
      };
    }
  }
);

server.tool(
  "release_session",
  "End an active persona session",
  { sessionId: z.string().describe("Session ID to release") },
  async ({ sessionId }) => {
    const released = personaSummoner.releaseSession(sessionId);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: released,
            message: released ? `Session ${sessionId} released` : 'Session not found'
          }, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "synthesize_persona",
  "Create new persona by combining existing ones",
  {
    basePersonaIds: z.array(z.string()).describe("Array of base persona IDs to combine"),
    customName: z.string().optional().describe("Custom name for synthesized persona")
  },
  async ({ basePersonaIds, customName }) => {
    if (!basePersonaIds || basePersonaIds.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: "Cannot synthesize persona from an empty list of base personas."
            }, null, 2)
          }
        ]
      };
    }
    const synthesized = personaSummoner.synthesizePersona(basePersonaIds, customName);
    const asset = personaSummoner.toAsset(synthesized);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            synthesizedPersona: asset,
            message: `Created synthesized persona: ${synthesized.name}`
          }, null, 2)
        }
      ]
    };
  }
);

// 提示工程增强功能
server.tool(
  "list_mantras",
  "List all available Mantra templates",
  {
    category: z.string().optional().describe("Filter by category")
  },
  async ({ category }) => {
    let templates = PROMPT_TEMPLATES;
    
    if (category) {
      templates = templates.filter(template => template.category === category);
    }
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            templates: templates.map(t => ({
              id: t.id,
              name: t.name,
              description: t.description,
              technique: t.technique,
              category: t.category,
              parameters: t.parameters
            })),
            availableCategories: [...new Set(PROMPT_TEMPLATES.map(t => t.category))]
          }, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "apply_mantra",
  "Apply a Mantra template with user inputs",
  {
    templateName: z.string().describe("Name of the Mantra template to apply"),
    inputs: z.record(z.string()).describe("User inputs for the template slots")
  },
  async ({ templateName, inputs }) => {
    // 支持通过 name 或 id 查找模板
    const template = PROMPT_TEMPLATES.find(t => 
      t.id === templateName || t.name === templateName
    );
    
    if (!template) {
      throw new Error(`Template "${templateName}" not found. Available templates: ${PROMPT_TEMPLATES.map(t => t.id).join(', ')}`);
    }
    
    // 检查必需参数
    const missingParams = template.parameters.filter(param => !inputs[param]);
    if (missingParams.length > 0) {
      throw new Error(`Missing required parameters: ${missingParams.join(', ')}. Required: ${template.parameters.join(', ')}`);
    }
    
    // 应用模板
    let result = template.template;
    template.parameters.forEach(param => {
      const value = inputs[param] || '';
      result = result.replace(new RegExp(`{${param}}`, 'g'), value);
    });
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            appliedTemplate: {
              id: template.id,
              name: template.name,
              technique: template.technique,
              category: template.category
            },
            prompt: result,
            usedInputs: inputs
          }, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "create_execution_plan",
  "Create an execution plan for a complex task",
  {
    userRequest: z.string().describe("The user's request or task description"),
    includeContext: z.boolean().optional().describe("Whether to include project context")
  },
  async ({ userRequest, includeContext = false }) => {
    // 简化的执行计划生成
    const planId = `plan_${Date.now()}`;
    
    // 基于用户请求分析任务类型
    const taskType = userRequest.toLowerCase().includes('debug') ? 'debugging' :
                    userRequest.toLowerCase().includes('refactor') ? 'refactoring' :
                    userRequest.toLowerCase().includes('implement') ? 'implementation' :
                    userRequest.toLowerCase().includes('review') ? 'code-review' : 'general';
    
    // 推荐相关的提示模板
    const relevantTemplates = PROMPT_TEMPLATES.filter(t => 
      t.category === taskType || 
      userRequest.toLowerCase().includes(t.technique.replace('_', ' '))
    );
    
    const plan = {
      id: planId,
      userRequest,
      taskType,
      recommendedTemplates: relevantTemplates.map(t => ({
        id: t.id,
        name: t.name,
        technique: t.technique,
        description: t.description
      })),
      steps: [
        "1. 分析问题和需求",
        "2. 选择合适的提示模板",
        "3. 准备必要的输入参数",
        "4. 应用模板生成提示",
        "5. 执行和验证结果"
      ],
      createdAt: new Date().toISOString()
    };
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(plan, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "execute_plan",
  "Execute a previously created execution plan",
  {
    planId: z.string().describe("The ID of the plan to execute")
  },
  async ({ planId }) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            message: `Plan ${planId} execution started. Please use the recommended templates from the plan.`,
            status: "ready_for_template_application"
          }, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "get_project_context",
  "Collect and return project context information",
  {
    includeFileStructure: z.boolean().optional().describe("Include file structure in context"),
    maxRelevantFiles: z.number().optional().describe("Maximum number of relevant files to include")
  },
  async ({ includeFileStructure = true, maxRelevantFiles = 10 }) => {
    // 简化的项目上下文收集
    const allAssets = await repository.getAssets();
    const personas = allAssets.filter(asset => asset.type === 'persona');
    const tools = allAssets.filter(asset => asset.type === 'tool');
    
    const context = {
      projectType: "Mantras MCP Server",
      mainLanguage: "TypeScript",
      framework: "Model Context Protocol",
      keyFeatures: [
        "Asset Management",
        "Persona Summoning", 
        "Prompt Engineering Templates",
        "Session Management"
      ],
      availableAssets: {
        personas: personas.length,
        promptTemplates: PROMPT_TEMPLATES.length,
        tools: tools.length
      },
      contextCollectedAt: new Date().toISOString()
    };
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(context, null, 2)
        }
      ]
    };
  }
);

// 启动服务器
const transport = new StdioServerTransport();
server.connect(transport).then(() => {
});

