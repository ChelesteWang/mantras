import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

describe("MCP Server Integration", () => {
  let client: any;
  let transport: any;

  beforeAll(async () => {
    // 由 SDK 自动启动 server 进程（用编译后的 JS 文件）
    transport = new StdioClientTransport({
      command: "node",
      args: ["dist/server.js"]
    });
    client = new Client({ name: "test-client", version: "1.0.0" });
    await client.connect(transport);
  }, 20000);

  afterAll(async () => {
    if (transport) await transport.close();
  });

  it("should list all assets", async () => {
    const result = await client.callTool({
      name: "list_assets",
      args: {}
    });
    expect(result.content[0].type).toBe("text");
    const assets = JSON.parse(result.content[0].text);
    expect(Array.isArray(assets)).toBe(true);
    expect(assets.length).toBeGreaterThan(0);
  });

  // it("should get asset by id", async () => {
  //   // 先获取所有资产
  //   const listResult = await client.callTool({
  //     name: "list_assets",
  //     args: {}
  //   });
  //   const assets = JSON.parse(listResult.content[0].text);
  //   console.log("list_assets返回内容：", assets);
  //   expect(Array.isArray(assets)).toBe(true);
  //   expect(assets.length).toBeGreaterThan(0);
  //   const firstId = assets[0].id;
  //   console.log("firstId：", firstId);

  //   // 再查单个
  //   const getResult = await client.callTool({
  //     name: "get_asset",
  //     args: { id: firstId }
  //   });
  //   console.log("getResult：", getResult.content);
  //   expect(getResult.content[0].type).toBe("text");
  //   console.log("get_asset返回内容：", getResult.content[0].text);
  //   const asset = JSON.parse(getResult.content[0].text);
  //   expect(asset.id).toBe(firstId);
  // });
}); 