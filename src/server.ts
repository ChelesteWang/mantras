import { RemoteAssetRepository } from './asset-repository.js';
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

// 实例化资产仓库
const repository = new RemoteAssetRepository(options.personas);

// MCP 服务器实例
const server = new McpServer({
  name: "ai-asset-manager",
  version: "1.0.0"
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
    id: z.string()
  }),
  async (args) => {
    const id = args.id;
    const asset = await repository.getAssetById(id);
    logToFile(`get_asset: ${id}\nasset: ${JSON.stringify(asset)}`);
    if (!asset) throw new Error(`Asset not found: ${id}`);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(asset)
        }
      ]
    };
  }
);

// 启动 stdio transport
const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  console.log("MCP server is running...");
});