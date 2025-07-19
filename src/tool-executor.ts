import { ActionableTool } from './types';
import { calculatorTool } from './tools/calculator.tool';
import { initTool } from './tools/init.tool';
import { intentAnalyzerTool } from './tools/intent-analyzer.tool';
import { smartRecommenderTool } from './tools/smart-recommender.tool';

export class ToolExecutor {
  private tools: Map<string, ActionableTool> = new Map();

  constructor() {
    this.registerTool(calculatorTool);
    this.registerTool(initTool);
    this.registerTool(intentAnalyzerTool);
    this.registerTool(smartRecommenderTool);
  }

  private registerTool(tool: ActionableTool) {
    this.tools.set(tool.id, tool);
  }

  public getTool(id: string): ActionableTool | undefined {
    return this.tools.get(id);
  }

  public listTools(): ActionableTool[] {
    return Array.from(this.tools.values());
  }

  public async executeTool(id: string, args: any): Promise<any> {
    const tool = this.getTool(id);
    if (!tool) {
      throw new Error(`Tool "${id}" not found.`);
    }
    // Basic validation, a more robust solution would use a JSON Schema validator
    if (tool.parameters) {
        const requiredParams = (tool.parameters as any).required || [];
        for (const param of requiredParams) {
            if (!(param in args)) {
                throw new Error(`Missing required parameter "${param}" for tool "${id}".`);
            }
        }
    }
    return tool.execute(args);
  }
}