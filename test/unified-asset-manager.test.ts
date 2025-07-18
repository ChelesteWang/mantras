import { UnifiedAssetManager } from '../src/unified-asset-manager';
import { AssetFactory } from '../src/asset-factory';
import { AssetLoader } from '../src/asset-loader';
import { RemoteAssetRepository } from '../src/asset-repository';
import { Asset, Persona, PromptTemplate, ActionableTool } from '../src/types';

describe('UnifiedAssetManager', () => {
  let manager: UnifiedAssetManager;
  let mockRepository: jest.Mocked<RemoteAssetRepository>;

  beforeEach(() => {
    mockRepository = {
      getAssets: jest.fn(),
      getAssetById: jest.fn()
    } as any;
    manager = new UnifiedAssetManager(mockRepository);
  });

  describe('Asset Registration', () => {
    it('should register a valid persona asset', () => {
      const persona = AssetFactory.createPersona({
        id: 'test-persona',
        name: 'Test Persona',
        description: 'A test persona',
        systemPrompt: 'You are a test assistant',
        personality: {
          role: 'Assistant',
          traits: ['helpful'],
          communicationStyle: 'friendly',
          knowledgeDomains: ['testing']
        },
        capabilities: {
          analysis: true,
          creative: false,
          technical: true,
          empathetic: false
        },
        constraints: {
          maxResponseLength: 1000,
          tone: 'professional',
          allowedTopics: ['testing']
        }
      });

      manager.registerAsset(persona);
      
      expect(manager.getAssetById('test-persona')).toBe(persona);
      expect(manager.getPersonas()).toContain(persona);
    });

    it('should register a valid prompt template asset', () => {
      const template = AssetFactory.createPromptTemplate({
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        technique: 'role_prompting',
        template: 'You are a {role}. Please {task}.',
        parameters: ['role', 'task'],
        category: 'testing'
      });

      manager.registerAsset(template);
      
      expect(manager.getAssetById('test-template')).toBe(template);
      expect(manager.getPromptTemplates()).toContain(template);
    });

    it('should register a valid tool asset', () => {
      const tool = AssetFactory.createTool({
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        parameters: { type: 'object', properties: {} },
        execute: async () => 'test result'
      });

      manager.registerAsset(tool);
      
      expect(manager.getAssetById('test-tool')).toBe(tool);
      expect(manager.getTools()).toContain(tool);
    });

    it('should reject invalid assets', () => {
      const invalidAsset = {
        id: 'invalid',
        type: 'persona',
        name: 'Invalid Persona'
        // Missing required fields
      } as Asset;

      expect(() => manager.registerAsset(invalidAsset)).toThrow();
    });
  });

  describe('Asset Queries', () => {
    beforeEach(() => {
      // Register test assets
      const persona = AssetFactory.createPersona({
        id: 'analyst',
        name: 'Data Analyst',
        description: 'Analytical persona',
        systemPrompt: 'You are a data analyst',
        personality: {
          role: 'Analyst',
          traits: ['analytical'],
          communicationStyle: 'structured',
          knowledgeDomains: ['data']
        },
        capabilities: {
          analysis: true,
          creative: false,
          technical: true,
          empathetic: false
        },
        constraints: {
          maxResponseLength: 2000,
          tone: 'formal',
          allowedTopics: ['data', 'analytics']
        }
      });

      const template = AssetFactory.createPromptTemplate({
        id: 'debug-template',
        name: 'Debug Template',
        description: 'For debugging',
        technique: 'debug_simulation',
        template: 'Debug this: {code}',
        parameters: ['code'],
        category: 'debugging'
      });

      manager.registerAsset(persona);
      manager.registerAsset(template);
    });

    it('should find assets by type', () => {
      const personas = manager.getPersonas();
      const templates = manager.getPromptTemplates();
      
      expect(personas).toHaveLength(1);
      expect(templates).toHaveLength(1);
      expect(personas[0].id).toBe('analyst');
      expect(templates[0].id).toBe('debug-template');
    });

    it('should find personas by capability', () => {
      const analyticalPersonas = manager.getPersonasByCapability('analysis');
      const creativePersonas = manager.getPersonasByCapability('creative');
      
      expect(analyticalPersonas).toHaveLength(1);
      expect(creativePersonas).toHaveLength(0);
    });

    it('should find templates by category', () => {
      const debugTemplates = manager.getPromptTemplatesByCategory('debugging');
      const otherTemplates = manager.getPromptTemplatesByCategory('other');
      
      expect(debugTemplates).toHaveLength(1);
      expect(otherTemplates).toHaveLength(0);
    });

    it('should search assets by query', () => {
      const results = manager.searchAssets('debug');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('debug-template');
    });
  });

  describe('Change Listeners', () => {
    it('should notify listeners on asset changes', () => {
      const listener = jest.fn();
      manager.addChangeListener(listener);

      const asset = AssetFactory.createPersona({
        id: 'test',
        name: 'Test',
        description: 'Test persona',
        systemPrompt: 'Test',
        personality: {
          role: 'Test',
          traits: ['test'],
          communicationStyle: 'test',
          knowledgeDomains: ['test']
        },
        capabilities: {
          analysis: false,
          creative: false,
          technical: false,
          empathetic: false
        },
        constraints: {
          maxResponseLength: 100,
          tone: 'test',
          allowedTopics: ['test']
        }
      });

      manager.registerAsset(asset);
      expect(listener).toHaveBeenCalledWith(asset, 'added');

      manager.registerAsset(asset);
      expect(listener).toHaveBeenCalledWith(asset, 'updated');

      manager.removeAsset('test');
      expect(listener).toHaveBeenCalledWith(asset, 'removed');
    });
  });

  describe('Asset Statistics', () => {
    it('should provide accurate statistics', () => {
      const persona = AssetFactory.createPersona({
        id: 'p1',
        name: 'Persona 1',
        description: 'Test',
        systemPrompt: 'Test',
        personality: {
          role: 'Test',
          traits: ['test'],
          communicationStyle: 'test',
          knowledgeDomains: ['test']
        },
        capabilities: {
          analysis: false,
          creative: false,
          technical: false,
          empathetic: false
        },
        constraints: {
          maxResponseLength: 100,
          tone: 'test',
          allowedTopics: ['test']
        }
      });

      const template = AssetFactory.createPromptTemplate({
        id: 't1',
        name: 'Template 1',
        description: 'Test',
        technique: 'test',
        template: 'Test {param}',
        parameters: ['param'],
        category: 'test'
      });

      manager.registerAsset(persona);
      manager.registerAsset(template);

      const stats = manager.getAssetStats();
      expect(stats.persona).toBe(1);
      expect(stats['prompt-template']).toBe(1);
      expect(stats.tool).toBe(0);
      expect(stats.prompt).toBe(0);
    });
  });
});

describe('AssetFactory', () => {
  describe('Asset Validation', () => {
    it('should validate complete persona', () => {
      const persona = AssetFactory.createPersona({
        id: 'test',
        name: 'Test',
        description: 'Test persona',
        systemPrompt: 'Test',
        personality: {
          role: 'Test',
          traits: ['test'],
          communicationStyle: 'test',
          knowledgeDomains: ['test']
        },
        capabilities: {
          analysis: false,
          creative: false,
          technical: false,
          empathetic: false
        },
        constraints: {
          maxResponseLength: 100,
          tone: 'test',
          allowedTopics: ['test']
        }
      });

      const validation = AssetFactory.validateAsset(persona);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidPersona = {
        id: 'test',
        type: 'persona',
        name: 'Test'
        // Missing required fields
      } as Asset;

      const validation = AssetFactory.validateAsset(invalidPersona);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Asset Cloning', () => {
    it('should create deep copies of assets', () => {
      const original = AssetFactory.createPersona({
        id: 'original',
        name: 'Original',
        description: 'Original persona',
        systemPrompt: 'Original',
        personality: {
          role: 'Original',
          traits: ['original'],
          communicationStyle: 'original',
          knowledgeDomains: ['original']
        },
        capabilities: {
          analysis: true,
          creative: false,
          technical: false,
          empathetic: false
        },
        constraints: {
          maxResponseLength: 100,
          tone: 'original',
          allowedTopics: ['original']
        }
      });

      const clone = AssetFactory.cloneAsset(original);
      
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.personality).not.toBe(original.personality);
    });
  });
});