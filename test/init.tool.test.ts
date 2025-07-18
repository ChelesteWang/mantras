import { initTool } from '../src/tools/init.tool';

describe('Init Tool', () => {
  it('should provide basic system overview without optional parameters', async () => {
    const result = await initTool.execute({});
    
    expect(result).toHaveProperty('status', 'Mantra MCP System Initialized');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('overview');
    expect(result).toHaveProperty('nextSteps');
    
    // Check overview structure
    expect(result.overview).toHaveProperty('name', 'Mantra MCP (Model Context Protocol) System');
    expect(result.overview).toHaveProperty('version', '2.0.0');
    expect(result.overview).toHaveProperty('coreCapabilities');
    expect(result.overview).toHaveProperty('quickStart');
    expect(result.overview).toHaveProperty('commonWorkflows');
    
    // Check core capabilities
    expect(result.overview.coreCapabilities).toHaveProperty('assetManagement');
    expect(result.overview.coreCapabilities).toHaveProperty('personaSystem');
    expect(result.overview.coreCapabilities).toHaveProperty('mantraTemplates');
    expect(result.overview.coreCapabilities).toHaveProperty('executionPlanning');
    
    // Should include examples by default
    expect(result).toHaveProperty('examples');
    
    // Should not include architecture by default
    expect(result).not.toHaveProperty('architecture');
  });

  it('should include examples when includeExamples is true', async () => {
    const result = await initTool.execute({ includeExamples: true });
    
    expect(result).toHaveProperty('examples');
    expect(result.examples).toHaveProperty('summonPersona');
    expect(result.examples).toHaveProperty('applyMantra');
    expect(result.examples).toHaveProperty('createPlan');
    
    // Check example structure
    expect(result.examples.summonPersona).toHaveProperty('description');
    expect(result.examples.summonPersona).toHaveProperty('call', 'summon_persona');
    expect(result.examples.summonPersona).toHaveProperty('parameters');
  });

  it('should exclude examples when includeExamples is false', async () => {
    const result = await initTool.execute({ includeExamples: false });
    
    expect(result).not.toHaveProperty('examples');
  });

  it('should include architecture when includeArchitecture is true', async () => {
    const result = await initTool.execute({ includeArchitecture: true });
    
    expect(result).toHaveProperty('architecture');
    expect(result.architecture).toHaveProperty('components');
    expect(result.architecture).toHaveProperty('dataFlow');
    expect(result.architecture).toHaveProperty('extensibility');
    
    // Check architecture components
    expect(result.architecture.components).toHaveProperty('assetRepository');
    expect(result.architecture.components).toHaveProperty('personaSummoner');
    expect(result.architecture.components).toHaveProperty('promptTemplates');
    expect(result.architecture.components).toHaveProperty('toolExecutor');
    expect(result.architecture.components).toHaveProperty('unifiedAssetManager');
  });

  it('should exclude architecture when includeArchitecture is false', async () => {
    const result = await initTool.execute({ includeArchitecture: false });
    
    expect(result).not.toHaveProperty('architecture');
  });

  it('should include both examples and architecture when both flags are true', async () => {
    const result = await initTool.execute({ 
      includeExamples: true, 
      includeArchitecture: true 
    });
    
    expect(result).toHaveProperty('examples');
    expect(result).toHaveProperty('architecture');
  });

  it('should have correct tool metadata', () => {
    expect(initTool.id).toBe('init');
    expect(initTool.type).toBe('tool');
    expect(initTool.name).toBe('Mantra MCP System Initializer');
    expect(initTool.description).toContain('Initialize and provide comprehensive overview');
    expect(initTool.parameters).toHaveProperty('type', 'object');
    expect(initTool.parameters).toHaveProperty('properties');
  });

  it('should provide helpful next steps', async () => {
    const result = await initTool.execute({});
    
    expect(result.nextSteps).toBeInstanceOf(Array);
    expect(result.nextSteps.length).toBeGreaterThan(0);
    expect(result.nextSteps[0]).toContain('list_assets');
  });

  it('should include all expected workflow types', async () => {
    const result = await initTool.execute({});
    
    const workflowNames = result.overview.commonWorkflows.map((w: any) => w.name);
    expect(workflowNames).toContain('Persona-based Interaction');
    expect(workflowNames).toContain('Prompt Engineering');
    expect(workflowNames).toContain('Complex Task Planning');
  });

  it('should have valid timestamp format', async () => {
    const result = await initTool.execute({});
    
    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    expect(isNaN(new Date(result.timestamp).getTime())).toBe(false);
  });
});