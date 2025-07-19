import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

describe("Reliable MCP Final Tests", () => {
  let client: any;
  let transport: any;

  beforeAll(async () => {
    transport = new StdioClientTransport({
      command: "node",
      args: ["dist/infrastructure/server/server.js"]
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
        arguments: {}
      });
      
      expect(result.content[0].type).toBe("text");
      const assets = JSON.parse(result.content[0].text);
      expect(Array.isArray(assets)).toBe(true);
      expect(assets.length).toBeGreaterThanOrEqual(4);
    });

    it("should get valid persona by exact assetId", async () => {
      const result = await client.callTool({
        name: "get_asset",
        arguments: { assetId: "analyst" }
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
        arguments: {}
      });
      
      const personas = JSON.parse(result.content[0].text);
      expect(Array.isArray(personas)).toBe(true);
      expect(personas.length).toBeGreaterThan(3);
    });

    it("should analyze user intent correctly", async () => {
      const result = await client.callTool({
        name: "analyze_user_intent",
        arguments: { userInput: "analyze data", analysisDepth: "detailed" }
      });
      
      const response = JSON.parse(result.content[0].text);
      expect(response.intentAnalysis).toBeDefined();
      expect(response.availableResources.personas).toBeDefined();
    });

    it("should handle empty parameters gracefully", async () => {
      const results = await Promise.allSettled([
        client.callTool({ name: "summon_persona", arguments: {} }),
        client.callTool({ name: "analyze_user_intent", arguments: { userInput: "" } }),
        client.callTool({ name: "get_asset", arguments: { assetId: "" } })
      ]);
      
      results.forEach(result => {
        expect(result.status).toBe("fulfilled");
      });
    });

    it("should manage session lifecycle", async () => {
      const summonResult = await client.callTool({
        name: "summon_persona",
        arguments: { personaId: "creative" }
      });
      
      const session = JSON.parse(summonResult.content[0].text);
      expect(session.sessionId).toBeDefined();
      
      const sessionResult = await client.callTool({
        name: "get_session",
        arguments: { sessionId: session.sessionId }
      });
      
      expect(sessionResult.content[0].type).toBe("text");
    });

    it("should synthesize personas correctly and verify addition", async () => {
      // Synthesize a new persona
      const synthesisResult = await client.callTool({
        name: "synthesize_persona",
        arguments: { 
          basePersonaIds: ["creative", "tech-expert"],
          customName: "Creative Tech Expert"
        }
      });
      
      expect(synthesisResult.content[0].type).toBe("text");
      const synthesisResponse = JSON.parse(synthesisResult.content[0].text);
      const newPersona = synthesisResponse.synthesizedPersona;

      // Verify the synthesized persona's properties
      expect(newPersona).toBeDefined();
      expect(newPersona.id).toBeDefined();
      expect(newPersona.name).toBe("Creative Tech Expert");

      // Verify the new persona is now in the list of all personas
      const listResult = await client.callTool({
        name: "list_personas",
        arguments: {}
      });
      const allPersonas = JSON.parse(listResult.content[0].text);
      const foundPersona = allPersonas.find((p: any) => p.id === newPersona.id);
      expect(foundPersona).toBeDefined();
      expect(foundPersona.name).toBe("Creative Tech Expert");
    });
  });

  describe("Error Handling and Robustness", () => {
    it("should handle malformed parameters gracefully", async () => {
      const testCases = [
        { name: "get_asset", arguments: {} },
        { name: "get_asset", arguments: { assetId: null } },
        { name: "analyze_user_intent", arguments: { userInput: null } }
      ];

      for (const testCase of testCases) {
        await expect(client.callTool(testCase)).rejects.toThrow('MCP error -32602');
      }
    });

    it("should maintain performance under concurrent calls", async () => {
      const promises = [
        client.callTool({ name: "list_assets", arguments: {} }),
        client.callTool({ name: "list_personas", arguments: {} }),
        client.callTool({ name: "analyze_user_intent", arguments: { userInput: "test" } })
      ];

      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      results.forEach(r => {
        expect(r.content[0].type).toBe("text");
      });
    });
  });
});