/**
 * 重构服务器测试
 */

import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

describe("Refactored Server Tests", () => {
  let client: any;
  let transport: any;

  beforeAll(async () => {
    transport = new StdioClientTransport({
      command: "node",
      args: ["dist/server-refactored.js"]
    });
    client = new Client({ name: "refactored-server-test", version: "3.0.0" });
    await client.connect(transport);
  }, 30000);

  afterAll(async () => {
    if (transport) await transport.close();
  });

  describe("Basic functionality", () => {
    it("should initialize successfully", async () => {
      const result = await client.callTool({
        name: "init",
        arguments: { includeExamples: true }
      });
      
      const response = JSON.parse(result.content[0].text);
      expect(response.name).toBe("Mantra MCP (Model Context Protocol) System");
      expect(response.version).toBe("2.0.0");
    });

    it("should list personas", async () => {
      const result = await client.callTool({
        name: "list_personas",
        arguments: {}
      });
      
      const personas = JSON.parse(result.content[0].text);
      expect(Array.isArray(personas)).toBe(true);
      expect(personas.length).toBeGreaterThan(0);
    });

    it("should summon a persona", async () => {
      const result = await client.callTool({
        name: "summon_persona",
        arguments: { personaId: "analyst" }
      });
      
      const response = JSON.parse(result.content[0].text);
      expect(response.persona.id).toBe("analyst");
      expect(response.sessionId).toBeDefined();
    });

    it("should analyze user intent", async () => {
      const result = await client.callTool({
        name: "analyze_user_intent",
        arguments: { 
          userInput: "我需要技术帮助",
          analysisDepth: "detailed"
        }
      });
      
      const analysis = JSON.parse(result.content[0].text);
      expect(analysis.intentAnalysis).toBeDefined();
      expect(analysis.availableResources).toBeDefined();
    });

    it("should list mantras", async () => {
      const result = await client.callTool({
        name: "list_mantras",
        arguments: {}
      });
      
      const mantras = JSON.parse(result.content[0].text);
      expect(Array.isArray(mantras)).toBe(true);
    });

    it("should create execution plan", async () => {
      const result = await client.callTool({
        name: "create_execution_plan",
        arguments: { 
          userRequest: "构建一个Web应用",
          includeContext: true
        }
      });
      
      const plan = JSON.parse(result.content[0].text);
      expect(plan.id).toBeDefined();
      expect(plan.steps).toBeDefined();
      expect(plan.steps.length).toBeGreaterThan(0);
    });
  });

  describe("Error handling", () => {
    it("should handle invalid asset requests gracefully", async () => {
      const result = await client.callTool({
        name: "get_asset",
        arguments: { assetId: "non-existent" }
      });
      
      expect(result.isError || result.content[0].text.includes("not found")).toBe(true);
    });

    it("should handle invalid template requests gracefully", async () => {
      const result = await client.callTool({
        name: "apply_mantra",
        arguments: { 
          templateName: "non-existent",
          inputs: {}
        }
      });
      
      expect(result.isError || result.content[0].text.includes("not found")).toBe(true);
    });
  });
});