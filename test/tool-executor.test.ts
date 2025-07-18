import { ToolExecutor } from '../src/tool-executor';

describe('ToolExecutor', () => {
  let toolExecutor: ToolExecutor;

  beforeEach(() => {
    toolExecutor = new ToolExecutor();
  });

  it('should register and list the calculator tool', () => {
    const tools = toolExecutor.listTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('Calculator');
    expect(tools[0].id).toBe('calculator');
  });

  it('should execute the calculator tool with valid arguments', async () => {
    const result = await toolExecutor.executeTool('calculator', { operation: 'add', a: 5, b: 3 });
    expect(result).toBe(8);
  });

  it('should throw an error for a non-existent tool', async () => {
    await expect(toolExecutor.executeTool('nonexistent', {})).rejects.toThrow('Tool "nonexistent" not found.');
  });

  it('should throw an error for a missing required parameter', async () => {
    await expect(toolExecutor.executeTool('calculator', { operation: 'add', a: 5 })).rejects.toThrow('Missing required parameter "b" for tool "calculator".');
  });

  it('should throw an error for an unsupported operation', async () => {
    await expect(toolExecutor.executeTool('calculator', { operation: 'subtract', a: 5, b: 3 })).rejects.toThrow('Unsupported operation');
  });
});