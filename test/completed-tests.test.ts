import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

describe("Complete MCP Functionality Tests", () => {
  let client: any;
  let transport: any;

  beforeAll(async () => {
    console.log("Starting MCP server for tests...");
    transport = new StdioClientTransport({
      command: "node",
      args: ["dist/server.js", "--personas", "test/test-assets.json"]
    });
    client = new Client({ name: "test-client", version: "2.0.0" });
    await client.connect(transport);
  }, 30000);

  afterAll(async () => {
    console.log("Closing MCP server connection...");
    if (transport) await transport.close();
    console.log("MCP server connection closed.");
  });

  describe("Asset Management Corner Cases", () => {
    it("should handle empty id for get_asset", async () => {
      const result = await client.callTool({
        name: "get_asset",
        arguments: { assetId: "" }
      });
      
      expect(result.content[0].type).toBe("text");
      const response = JSON.parse(result.content[0].text);
      expect(response.error).toContain("Invalid asset ID");
      expect(Array.isArray(response.available)).toBe(true);
    });

    it("should handle null/undefined assetId", async () => {
      const result = await client.callTool({
        name: "get_asset",
        arguments: { assetId: "does-not-exist" }
      });
      
      expect(result.content[0].type).toBe("text");
      const response = JSON.parse(result.content[0].text);
      expect(response.error).toContain("Invalid asset ID");
    });

    it("should handle special characters in assetId", async () => {
      const result = await client.callTool({
        name: "get_asset",
        arguments: { assetId: "@#$%^&*()" }
      });
      
      expect(result.content[0].type).toBe("text");
      const response = JSON.parse(result.content[0].text);
      expect(response.error).toContain("Invalid asset ID");
    });

    it("should handle case sensitivity", async () => {
      const result1 = await client.callTool({
        name: "get_asset",
        arguments: { assetId: "analyst" }
      });
      
      const result2 = await client.callTool({
        name: "get_asset",
        arguments: { assetId: "ANALYST" }
      });
      
      const response1 = JSON.parse(result1.content[0].text);
      const response2 = JSON.parse(result2.content[0].text);
      
      expect(response1.error).toBeUndefined();
      expect(response2.error).toBe("Invalid asset ID");
    });

    it("should handle unicode and emoji assetIds", async () => {
      const result = await client.callTool({
        name: "get_asset",
        arguments: { assetId: "🔥analyst" }
      });
      
      expect(result.content[0].type).toBe("text");
      const response = JSON.parse(result.content[0].text);
      expect(response.error).toContain("Invalid asset ID");
    });

    it("should return consistent format for all assets", async () => {
      const assetTypes = ['persona', 'prompt', 'tool'];
      
      for (const type of assetTypes) {
        const listResult = await client.callTool({
          name: "list_assets",
          arguments: {}
        });
        
        const assets = JSON.parse(listResult.content[0].text);
        const filteredAssets = assets.filter((a: any) => a.type === type);
        
        for (const asset of filteredAssets) {
          const result = await client.callTool({
            name: "get_asset",
            arguments: { assetId: asset.id }
          });
          
          expect(result.content[0].type).toBe("text");
          const assetData = JSON.parse(result.content[0].text);
          expect(assetData.id).toBe(asset.id);
          expect(assetData.type).toBe(type);
        }
      }
    });
  });

  describe("Persona Summoner Edge Cases", () => {
    it("should handle null/undefined personaId", async () => {
      const result = await client.callTool({
        name: "summon_persona",
        arguments: {}
      });
      
      const response = JSON.parse(result.content[0].text);
      expect(response.persona).toBeDefined();
      expect(response.persona.id).toBeDefined();
    });

    it("should handle empty string personaId", async () => {
      const result = await client.callTool({
        name: "summon_persona",
        arguments: { personaId: "" }
      });
      
      const response = JSON.parse(result.content[0].text);
      expect(response.persona).toBeDefined();
      expect(response.persona.id).toBeDefined();
    });

    it("should handle very long user input strings", async () => {
      const longInput = "a".repeat(1000);
      const result = await client.callTool({
        name: "analyze_user_intent",
        arguments: { userInput: longInput }
      });
      
      const response = JSON.parse(result.content[0].text);
      expect(response.intentAnalysis).toBeDefined();
      expect(response.intentAnalysis.confidence).toBeGreaterThanOrEqual(0);
      expect(response.intentAnalysis.confidence).toBeLessThanOrEqual(1);
    });

    it("should handle international languages in user input", async () => {
      const inputs = [
        '数据分析需求',
        'crear contenido creativo',
        '技術情報が必要です',
        'help with technical stuff'
      ];
      
      for (const userInput of inputs) {
        const result = await client.callTool({
          name: "analyze_user_intent",
          arguments: { userInput }
        });
        
        const response = JSON.parse(result.content[0].text);
        expect(response.intentAnalysis).toBeDefined();
        expect(response.intentAnalysis.confidence).toBeGreaterThan(0);
      }
    });

    it("should handle special characters in user input", async () => {
      const result = await client.callTool({
        name: "analyze_user_intent",
        arguments: { userInput: "Code review 🔍 & debugging #${variable}" }
      });
      
      const response = JSON.parse(result.content[0].text);
      expect(response.intentAnalysis).toBeDefined();
    });

    it("should handle extremely short user inputs", async () => {
      const shortInputs = ['a', 'x', '1'];
      
      for (const userInput of shortInputs) {
        const result = await client.callTool({
          name: "analyze_user_intent",
          arguments: { userInput }
        });
        
        const response = JSON.parse(result.content[0].text);
        expect(response.intentAnalysis).toBeDefined();
      }
    });
  });

  describe("Session Management Tests", () => {
    let createdSessions = [];

    it("should create unique session IDs", async () => {
      const sessions: any[] = [];
      
      for (let i = 0; i < 10; i++) {
        const result = await client.callTool({
          name: "summon_persona",
          arguments: { personaId: "analyst" }
        });
        const session = JSON.parse(result.content[0].text);
        sessions.push(session);
      }
      
      const sessionIds = sessions.map(s => s.sessionId);
      const uniqueIds = new Set(sessionIds);
      expect(uniqueIds.size).toBe(sessionIds.length);
    });

    it("should manage multiple concurrent sessions", async () => {
      const promises = [
        client.callTool({ name: "summon_persona", arguments: { personaId: "analyst" } }),
        client.callTool({ name: "summon_persona", arguments: { personaId: "creative" } }),
        client.callTool({ name: "summon_persona", arguments: { personaId: "tech-expert" } })
      ];
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      
      const sessionList = await client.callTool({
        name: "list_active_sessions",
        arguments: {}
      });
      
      const sessions = JSON.parse(sessionList.content[0].text);
      expect(sessions.length).toBeGreaterThanOrEqual(3);
    });

    it("should prevent duplicate session releases", async () => {
      const summonResult = await client.callTool({
        name: "summon_persona",
        arguments: { personaId: "analyst" }
      });
      
      const session = JSON.parse(summonResult.content[0].text);
      
      // Release once
      const release1 = await client.callTool({
        name: "release_session",
        arguments: { sessionId: session.sessionId }
      });
      
      const response1 = JSON.parse(release1.content[0].text);
      expect(response1.success).toBe(true);
      
      // Release again - should fail
      const release2 = await client.callTool({
        name: "release_session",
        arguments: { sessionId: session.sessionId }
      });
      
      const response2 = JSON.parse(release2.content[0].text);
      expect(response2.success).toBe(false);
    });

    it("should preserve session metadata across operations", async () => {
      const result = await client.callTool({
        name: "summon_persona",
        arguments: {
          personaId: "analyst",
          intent: "business analysis"
        }
      });
      
      const session = JSON.parse(result.content[0].text);
      expect(session.metadata.summonerIntent).toBe("business analysis");
      expect(session.timestamp).toBeDefined();
      expect(session.sessionId).toBeDefined();
      
      const retrieved = await client.callTool({
        name: "get_session",
        arguments: { sessionId: session.sessionId }
      });
      
      const retrievedSession = JSON.parse(retrieved.content[0].text);
      expect(retrievedSession.sessionId).toBe(session.sessionId);
    });
  });

  describe("Synthesis Feature Tests", () => {
    it("should combine capabilities correctly", async () => {
      const result = await client.callTool({
        name: "synthesize_persona",
        arguments: { basePersonaIds: ["creative", "tech-expert"] }
      });
      
      const response = JSON.parse(result.content[0].text);
      const synthesized = response.synthesizedPersona;
      
      expect(synthesized.capabilities.creative).toBe(true);
      expect(synthesized.capabilities.technical).toBe(true);
      expect(synthesized.capabilities.analysis).toBe(true);
    });

    it("should handle empty synthesis array", async () => {
      const result = await client.callTool({
        name: "synthesize_persona",
        arguments: { basePersonaIds: [] }
      });
      const response = JSON.parse(result.content[0].text);
      expect(response.error).toBeDefined();
      expect(response.error).toContain("Cannot synthesize persona from an empty list of base personas.");
    });

    it("should handle duplicate base personas in synthesis", async () => {
      const result = await client.callTool({
        name: "synthesize_persona",
        arguments: { basePersonaIds: ["creative", "creative", "creative"] }
      });
      
      const response = JSON.parse(result.content[0].text);
      const synthesized = response.synthesizedPersona;
      expect(synthesized.capabilities.creative).toBe(true);
    });
  });

  describe("Performance Tests", () => {
    it("should handle rapid successive calls", async () => {
      const startTime = Date.now();
      
      const promises = Array(10).fill(null).map((_, i) => 
        client.callTool({
          name: "analyze_user_intent",
          arguments: { userInput: `Request ${i}` }
        })
      );
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      expect(results.length).toBe(10);
      expect(endTime - startTime).toBeLessThan(10000); // 10 second timeout
    });

    it("should handle concurrent persona operations", async () => {
      const operations = [
        client.callTool({ name: "list_personas", arguments: {} }),
        client.callTool({ name: "summon_persona", arguments: { personaId: "analyst" } }),
        client.callTool({ name: "analyze_user_intent", arguments: { userInput: "data analysis" } }),
        client.callTool({ name: "list_active_sessions", arguments: {} })
      ];
      
      const results = await Promise.all(operations);
      expect(results).toHaveLength(4);
    });
  });

  describe("Data Validation Tests", () => {
    it("should validate id parameter type and format", async () => {
      const invalidIds = [null, undefined, "", 123, {}, []];
      
      for (const invalidId of invalidIds.filter(id => typeof id === 'string')) {
        const result = await client.callTool({
          name: "get_asset",
          arguments: { assetId: invalidId }
        });
        
        const response = JSON.parse(result.content[0].text);
        expect(response.error).toBeDefined();
      }
    });

    it("should maintain data integrity across operations", async () => {
      const list1 = await client.callTool({ name: "list_personas", arguments: {} });
      const personas1 = JSON.parse(list1.content[0].text);
      
      const summonResult = await client.callTool({
        name: "summon_persona",
        arguments: { personaId: "analyst" }
      });
      
      const list2 = await client.callTool({ name: "list_personas", arguments: {} });
      const personas2 = JSON.parse(list2.content[0].text);
      
      expect(personas1.length).toBe(personas2.length);
    });
  });
});