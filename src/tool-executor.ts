import { ActionableTool } from './types';
import { calculatorTool } from './tools/calculator.tool';

export class ToolExecutor {
  private tools: Map<string, ActionableTool> = new Map();

  constructor() {
    this.registerTool(calculatorTool);
  }

  private registerTool(tool: ActionableTool) {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): ActionableTool | undefined {
    return this.tools.get(name);
  }

  public listTools(): ActionableTool[] {
    return Array.from(this.tools.values());
  }

  public async executeTool(name: string, args: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool "${name}" not found.`);
    }
    // Basic validation, a more robust solution would use a JSON Schema validator
    if (tool.parameters) {
        const requiredParams = (tool.parameters as any).required || [];
        for (const param of requiredParams) {
            if (!(param in args)) {
                throw new Error(`Missing required parameter "${param}" for tool "${name}".`);
            }
        }
    }
    return tool.execute(args);
  }
}