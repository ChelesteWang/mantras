import { RemoteAssetRepository } from './asset-repository.js';
import { PersonaSummoner } from './persona-summoner.js';
import { Asset } from './types.js';
import { Command } from 'commander';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { logToFile } from './log-to-file';

// 解析命令行参数
const program = new Command();
program
  .option('--personas <path>', 'Path to local assets JSON file')
  .parse(process.argv);
const options = program.opts();

// 实例化资产仓库和persona召唤器
const repository = new RemoteAssetRepository(options.personas);
const personaSummoner = new PersonaSummoner();

// MCP 服务器实例
const server = new McpServer({
  name: "ai-asset-manager-persona-summoner",
  version: "2.0.0"
});

// 注册工具
server.registerTool(
  "list_assets",
  z.object({}),
  async () => {
    const assets = await repository.getAssets();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(assets)
        }
      ]
    };
  }
);

server.registerTool(
  "get_asset",
  z.object({
    assetId: z.string()
  }),
  async (args) => {
    logToFile(`get_asset args: ${JSON.stringify(args)}`);
    const id = args.assetId;
    if (!id || typeof id !== 'string') {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: "Invalid asset ID",
              providedId: id,
              available: await repository.getAssets().then(a => a.map(asset => asset.id))
            })
          }
        ]
      };
    }
    
    const asset = await repository.getAssetById(id);
    logToFile(`get_asset: ${id}\nasset: ${JSON.stringify(asset)}`);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(asset || {
            error: "Asset not found",
            requestedId: id,
            available: await repository.getAssets().then(a => a.map(asset => asset.id))
          })
        }
      ]
    };
  }
);

// Persona summoner tools
server.registerTool(
  "list_personas",
  z.object({}),
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

server.registerTool(
  "summon_persona",
  z.object({
    personaId: z.string().optional().describe("Specific persona ID to summon"),
    intent: z.string().optional().describe("Intent/type of interaction (e.g., 'technical', 'creative', 'analytical')"),
    customParams: z.object({}).optional().describe("Custom parameters for persona customization")
  }),
  async (args) => {
    logToFile(`summon_persona args: ${JSON.stringify(args)}`);
    const request = {
      personaId: args.personaId,
      intent: args.intent,
      customParams: args.customParams as Record<string, any>
    };
    
    const summoned = personaSummoner.summonPersona(request);
    logToFile(`Summoned persona: ${summoned.persona.name} for intent: ${args.intent || 'default'}`);
    
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

server.registerTool(
  "summon_by_intent",
  z.object({
    intent: z.string().describe("The user's intent or situation description")
  }),
  async (args) => {
    const summoned = personaSummoner.summonPersona({
      intent: args.intent
    });
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            persona: summoned.persona,
            recommendation: `Summoned ${summoned.persona.name} persona for: ${args.intent}`,
            confidence: summoned.metadata.confidence
          }, null, 2)
        }
      ]
    };
  }
);

server.registerTool(
  "list_active_sessions",
  z.object({}),
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

server.registerTool(
  "release_session",
  z.object({
    sessionId: z.string().describe("Session ID to release")
  }),
  async (args) => {
    const released = personaSummoner.releaseSession(args.sessionId);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: released,
            message: released ? `Session ${args.sessionId} released` : 'Session not found'
          }, null, 2)
        }
      ]
    };
  }
);

server.registerTool(
  "synthesize_persona",
  z.object({
    basePersonaIds: z.array(z.string()).describe("Array of base persona IDs to combine"),
    customName: z.string().optional().describe("Custom name for synthesized persona")
  }),
  async (args) => {
    const synthesized = personaSummoner.synthesizePersona(args.basePersonaIds, args.customName);
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

server.registerTool(
  "get_session",
  z.object({
    sessionId: z.string().describe("Session ID to retrieve")
  }),
  async (args) => {
    const session = personaSummoner.getSession(args.sessionId);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(session || { error: 'Session not found' }, null, 2)
        }
      ]
    };
  }
);

// 启动 stdio transport
const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  console.log("MCP server with persona summoner is running...");
});