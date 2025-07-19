/**
 * 新意图分析架构测试
 */

import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

describe("New Intent Analysis Architecture Tests", () => {
  let client: any;
  let transport: any;

  beforeAll(async () => {
    transport = new StdioClientTransport({
      command: "node",
      args: ["dist/server.js"]
    });
    client = new Client({ name: "intent-analysis-test", version: "3.0.0" });
    await client.connect(transport);
  }, 30000);

  afterAll(async () => {
    if (transport) await transport.close();
  });

  describe("analyze_user_intent Tool", () => {
    it("should analyze technical intent correctly", async () => {
      const result = await client.callTool({
        name: "analyze_user_intent",
        arguments: { 
          userInput: "我需要重构这个复杂的架构设计",
          analysisDepth: "detailed"
        }
      });
      
      const analysis = JSON.parse(result.content[0].text);
      expect(analysis.intentAnalysis.primary).toBe('technical');
      expect(analysis.taskAnalysis.complexity).toBe('high');
      expect(analysis.availableResources.personas).toBeDefined();
      expect(analysis.availableResources.personas.length).toBeGreaterThan(0);
    });

    it("should analyze creative intent correctly", async () => {
      const result = await client.callTool({
        name: "analyze_user_intent",
        arguments: { 
          userInput: "帮我写一个营销文案",
          analysisDepth: "detailed"
        }
      });
      
      const analysis = JSON.parse(result.content[0].text);
      expect(analysis.intentAnalysis.primary).toBe('creative');
      expect(analysis.availableResources.personas.some((p: any) => p.id === 'creative')).toBe(true);
    });

    it("should analyze analytical intent correctly", async () => {
      const result = await client.callTool({
        name: "analyze_user_intent",
        arguments: { 
          userInput: "分析这组数据的趋势",
          analysisDepth: "detailed"
        }
      });
      
      const analysis = JSON.parse(result.content[0].text);
      expect(analysis.intentAnalysis.primary).toBe('analytical');
      expect(analysis.availableResources.personas.some((p: any) => p.id === 'analyst')).toBe(true);
    });

    it("should handle context parameter", async () => {
      const result = await client.callTool({
        name: "analyze_user_intent",
        arguments: { 
          userInput: "优化性能",
          context: "软件开发项目",
          analysisDepth: "basic"
        }
      });
      
      const analysis = JSON.parse(result.content[0].text);
      expect(analysis.context).toBe("软件开发项目");
      expect(analysis.intentAnalysis).toBeDefined();
    });
  });

  describe("get_persona_options Tool", () => {
    it("should return all available personas", async () => {
      const result = await client.callTool({
        name: "get_persona_options",
        arguments: { includeCapabilities: true }
      });
      
      const options = JSON.parse(result.content[0].text);
      expect(options.personas).toBeDefined();
      expect(options.personas.length).toBeGreaterThan(3);
      expect(options.selectionGuide).toBeDefined();
      expect(options.metadata.totalPersonas).toBeGreaterThan(0);
    });

    it("should filter by domain", async () => {
      const result = await client.callTool({
        name: "get_persona_options",
        arguments: { 
          includeCapabilities: true,
          filterByDomain: "software_development"
        }
      });
      
      const options = JSON.parse(result.content[0].text);
      expect(options.personas.every((p: any) =>
        p.domains.includes("software_development")
      )).toBe(true);
    });

    it("should include capabilities when requested", async () => {
      const result = await client.callTool({
        name: "get_persona_options",
        arguments: { includeCapabilities: true }
      });
      
      const options = JSON.parse(result.content[0].text);
      expect(options.personas[0].capabilities).toBeDefined();
      expect(options.personas[0].traits).toBeDefined();
      expect(options.personas[0].domains).toBeDefined();
    });
  });

  describe("evaluate_persona_match Tool", () => {
    it("should evaluate tech-expert for technical intent", async () => {
      const result = await client.callTool({
        name: "evaluate_persona_match",
        arguments: { 
          personaId: "tech-expert",
          userIntent: "我需要优化代码架构"
        }
      });
      
      const evaluation = JSON.parse(result.content[0].text);
      expect(evaluation.persona.id).toBe("tech-expert");
      expect(evaluation.matchAnalysis.overallScore).toBeGreaterThan(0.7);
      expect(evaluation.matchAnalysis.recommendation).toBe("highly_recommended");
    });

    it("should evaluate creative for creative intent", async () => {
      const result = await client.callTool({
        name: "evaluate_persona_match",
        arguments: { 
          personaId: "creative",
          userIntent: "写一个故事"
        }
      });
      
      const evaluation = JSON.parse(result.content[0].text);
      expect(evaluation.persona.id).toBe("creative");
      expect(evaluation.matchAnalysis.overallScore).toBeGreaterThan(0.7);
    });

    it("should suggest alternatives for poor matches", async () => {
      const result = await client.callTool({
        name: "evaluate_persona_match",
        arguments: { 
          personaId: "therapist",
          userIntent: "编写复杂算法"
        }
      });
      
      const evaluation = JSON.parse(result.content[0].text);
      expect(evaluation.matchAnalysis.overallScore).toBeLessThan(0.5);
      expect(evaluation.alternatives).toBeDefined();
      expect(evaluation.alternatives.length).toBeGreaterThan(0);
    });

    it("should handle requirements parameter", async () => {
      const result = await client.callTool({
        name: "evaluate_persona_match",
        arguments: { 
          personaId: "analyst",
          userIntent: "数据分析",
          requirements: ["统计知识", "可视化能力"]
        }
      });
      
      const evaluation = JSON.parse(result.content[0].text);
      expect(evaluation.matchAnalysis).toBeDefined();
      expect(evaluation.reasoning).toBeDefined();
    });

    it("should handle error for non-existent persona", async () => {
      const result = await client.callTool({
        name: "evaluate_persona_match",
        arguments: { 
          personaId: "non-existent",
          userIntent: "test"
        }
      });
      
      // Check if it's an error response
      expect(result.isError || result.content[0].text.includes("not found")).toBe(true);
    });
  });

  describe("Integration with existing tools", () => {
    it("should work with summon_persona after analysis", async () => {
      // First analyze intent
      const analysisResult = await client.callTool({
        name: "analyze_user_intent",
        arguments: { 
          userInput: "我需要技术帮助",
          analysisDepth: "detailed"
        }
      });
      
      const analysis = JSON.parse(analysisResult.content[0].text);
      const recommendedPersona = analysis.availableResources.personas[0];
      
      // Then summon the recommended persona
      const summonResult = await client.callTool({
        name: "summon_persona",
        arguments: { 
          personaId: recommendedPersona.id,
          intent: "technical assistance"
        }
      });
      
      const summoned = JSON.parse(summonResult.content[0].text);
      expect(summoned.persona.id).toBe(recommendedPersona.id);
      expect(summoned.sessionId).toBeDefined();
    });

    it("should provide better recommendations than old system", async () => {
      const result = await client.callTool({
        name: "analyze_user_intent",
        arguments: { 
          userInput: "我需要分析用户行为数据，找出购买模式，并制定营销策略",
          analysisDepth: "comprehensive"
        }
      });
      
      const analysis = JSON.parse(result.content[0].text);
      
      // Should identify multiple intents
      expect(analysis.intentAnalysis.secondary.length).toBeGreaterThan(0);
      
      // Should provide multiple persona recommendations
      expect(analysis.availableResources.personas.length).toBeGreaterThan(1);
      
      // Should include decision support
      expect(analysis.decisionSupport.recommendedStrategy).toBeDefined();
      expect(analysis.decisionSupport.alternatives).toBeDefined();
    });
  });

  describe("Error handling", () => {
    it("should handle empty user input", async () => {
      const result = await client.callTool({
        name: "analyze_user_intent",
        arguments: { 
          userInput: "",
          analysisDepth: "basic"
        }
      });
      
      const analysis = JSON.parse(result.content[0].text);
      expect(analysis.intentAnalysis.primary).toBe('general');
    });

    it("should handle invalid analysis depth", async () => {
      // Should default to 'detailed' for invalid values
      const result = await client.callTool({
        name: "analyze_user_intent",
        arguments: { 
          userInput: "test input"
        }
      });
      
      const analysis = JSON.parse(result.content[0].text);
      expect(analysis).toBeDefined();
    });
  });
});