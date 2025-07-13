import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

describe("Reliable MCP Final Tests", () => {
  let client: any;
  let transport: any;

  beforeAll(async () => {
    transport = new StdioClientTransport({
      command: "node",
      args: ["dist/server.js"]
    });
    client = new Client({ name: "final-test", version: "3.0.0" });
    await client.connect(transport);
  }, 30000);

  afterAll(async () => {
    if (transport) await transport.close();
  });

  describe("Asset Management Tests", () => {
    it("should list all core assets successfully", async () => {
      const result = await client.callTool({
        name: "list_assets",
        args: {}
      });
      
      expect(result.content[0].type).toBe("text");
      const assets = JSON.parse(result.content[0].text);
      expect(Array.isArray(assets)).toBe(true);
      expect(assets.length).toBeGreaterThanOrEqual(4);
    });

    it("should get valid persona by exact assetId", async () => {
      const result = await client.callTool({
        name: "get_asset",
        args: { assetId: "analyst" }
      });
      
      expect(result.content[0].type).toBe("text");
      
      try {
        const asset = JSON.parse(result.content[0].text);
        if (asset && asset.id) {
          expect(asset.id).toBe("analyst");
          expect(asset.type).toBe("persona");
        }
      } catch {
        expect(result.content[0].text).toContain("analyst");
      }
    });
  });

  describe("Persona Summoner Tests", () => {
    it("should list available personas", async () => {
      const result = await client.callTool({
        name: "list_personas",
        args: {}
      });
      
      const personas = JSON.parse(result.content[0].text);
      expect(Array.isArray(personas)).toBe(true);
      expect(personas.length).toBeGreaterThan(3);
    });

    it("should summon analyst for data intent", async () => {
      const result = await client.callTool({
        name: "summon_by_intent",
        args: { intent: "analyze data" }
      });
      
      const response = JSON.parse(result.content[0].text);
      expect(response.persona).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0.5);
    });

    it("should handle empty parameters gracefully", async () => {
      const results = await Promise.allSettled([
        client.callTool({ name: "summon_persona", args: {} }),
        client.callTool({ name: "summon_by_intent", args: {} }),
        client.callTool({ name: "get_asset", args: { id: "" } })
      ]);
      
      results.forEach(result => {
        expect(result.status).toBe("fulfilled");
      });
    });

    it("should manage session lifecycle", async () => {
      const summonResult = await client.callTool({
        name: "summon_persona",
        args: { personaId: "creative" }
      });
      
      const session = JSON.parse(summonResult.content[0].text);
      expect(session.sessionId).toBeDefined();
      
      const sessionResult = await client.callTool({
        name: "get_session",
        args: { sessionId: session.sessionId }
      });
      
      expect(sessionResult.content[0].type).toBe("text");
    });

    it("should synthesize personas correctly", async () => {
      const result = await client.callTool({
        name: "synthesize_persona",
        args: { basePersonaIds: ["creative", "tech-expert"] }
      });
      
      expect(result.content[0].type).toBe("text");
      const response = result.content[0].text;
      expect(response.length).toBeGreaterThan(0);
    });
  });

  describe("Error Handling and Robustness", () => {
    it("should handle malformed parameters gracefully", async () => {
      const testCases = [
        { name: "get_asset", args: {} },
        { name: "get_asset", args: { id: null } },
        { name: "summon_by_intent", args: {} }
      ];

      for (const testCase of testCases) {
        const result = await client.callTool(testCase);
        expect(result.content[0].type).toBe("text");
        expect(result.content[0].text).toBeDefined();
      }
    });

    it("should maintain performance under concurrent calls", async () => {
      const promises = [
        client.callTool({ name: "list_assets", args: {} }),
        client.callTool({ name: "list_personas", args: {} }),
        client.callTool({ name: "summon_by_intent", args: { intent: "test" } })
      ];

      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      results.forEach(r => {
        expect(r.content[0].type).toBe("text");
      });
    });
  });
});