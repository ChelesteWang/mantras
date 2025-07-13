import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

describe("Final Working MCP Tests", () => {
  let client: any;
  let transport: any;

  beforeAll(async () => {
    transport = new StdioClientTransport({
      command: "node",
      args: ["dist/server.js"]
    });
    client = new Client({ name: "test-final", version: "2.0.0" });
    await client.connect(transport);
  }, 30000);

  afterAll(async () => {
    if (transport) await transport.close();
  });

  describe("Core Functionality Working", () => {
    it("should list all assets", async () => {
      const result = await client.callTool({
        name: "list_assets",
        args: {}
      });
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBeDefined();
      expect(result.content[0].text.length).toBeGreaterThan(0);
    });

    it("should list personas", async () => {
      const result = await client.callTool({
        name: "list_personas",
        args: {}
      });
      expect(result.content[0].type).toBe("text");
    });

    it("should handle get_asset responses", async () => {
      const testCase = await client.callTool({
        name: "get_asset",
        args: { assetId: "analyst" }
      });
      expect(testCase.content[0].type).toBe("text");
    });

    it("should handle summon intents", async () => {
      const result = await client.callTool({
        name: "summon_by_intent",
        args: { intent: "test" }
      });
      expect(result.content[0].type).toBe("text");
    });

    it("should handle session management", async () => {
      const result = await client.callTool({
        name: "list_active_sessions",
        args: {}
      });
      expect(result.content[0].type).toBe("text");
    });
  });
});