import { RemoteAssetRepository } from './asset-repository';
import { PersonaSummoner } from './persona-summoner';
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

// 启动服务器
const transport = new StdioServerTransport();
server.connect(transport).then(() => {
});

