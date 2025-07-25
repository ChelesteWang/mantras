import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

interface Asset {
  type: string;
  id: string;
  [key: string]: unknown;
}

interface ToolCallResult {
  content: Array<{
    type: string;
    text: string;
  }>;
}

describe('MCP Server Integration', () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    // 由 SDK 自动启动 server 进程（用编译后的 JS 文件）
    transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/infrastructure/server/server.js'],
    });
    client = new Client({ name: 'test-client', version: '1.0.0' });
    await client.connect(transport);
  }, 20000);

  afterAll(async () => {
    if (transport) await transport.close();
  });

  it('should list all assets', async () => {
    const result = (await client.callTool({
      name: 'list_assets',
      arguments: {},
    })) as ToolCallResult;
    expect(result.content[0].type).toBe('text');
    const assets = JSON.parse(result.content[0].text) as Asset[];
    expect(Array.isArray(assets)).toBe(true);
    expect(assets.length).toBeGreaterThan(0);

    // Check for enhanced personas
    const personas = assets.filter((a: Asset) => a.type === 'persona');
    expect(personas.length).toBeGreaterThanOrEqual(4);
  });

  it('should return valid JSON for known asset', async () => {
    // Test that get_asset works with known assets
    const getResult = (await client.callTool({
      name: 'get_asset',
      arguments: { assetId: 'analyst' },
    })) as ToolCallResult;

    expect(getResult.content[0].type).toBe('text');
    const asset = JSON.parse(getResult.content[0].text) as Asset;
    expect(asset.id).toBe('analyst');
    expect(getResult.content[0].text).toBeDefined();
    expect(getResult.content[0].text.length).toBeGreaterThan(0);
  });
});
