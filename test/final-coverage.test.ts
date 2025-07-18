import { UnifiedAssetManager } from '../src/unified-asset-manager';
import { AssetFactory } from '../src/asset-factory';
import { RemoteAssetRepository } from '../src/asset-repository';

describe('UnifiedAssetManager - Final Coverage', () => {
  let manager: UnifiedAssetManager;
  let mockRepository: jest.Mocked<RemoteAssetRepository>;

  beforeEach(() => {
    mockRepository = {
      getAssets: jest.fn(),
      getAssetById: jest.fn()
    } as any;
    manager = new UnifiedAssetManager(mockRepository);
  });

  describe('Import Error Handling', () => {
    it('should handle import from directory errors', async () => {
      // The actual error will be a file system error for invalid directory
      await expect(manager.importFromDirectory('/invalid/dir'))
        .rejects.toThrow('ENOENT');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty asset arrays in operations', () => {
      const stats = manager.getAssetStats();
      expect(stats.persona).toBe(0);
      expect(stats.tool).toBe(0);
      expect(stats['prompt-template']).toBe(0);
      expect(stats.prompt).toBe(0);
    });

    it('should handle search with no results', () => {
      const results = manager.searchAssets('nonexistent');
      expect(results).toHaveLength(0);
    });

    it('should handle getPersonasByCapability with no matches', () => {
      const results = manager.getPersonasByCapability('analysis');
      expect(results).toHaveLength(0);
    });

    it('should handle getPromptTemplatesByCategory with no matches', () => {
      const results = manager.getPromptTemplatesByCategory('nonexistent');
      expect(results).toHaveLength(0);
    });
  });
});

describe('AssetFactory - Final Edge Cases', () => {
  describe('Validation Edge Cases', () => {
    it('should handle persona with missing personality', () => {
      const persona = {
        id: 'test',
        type: 'persona',
        name: 'Test',
        systemPrompt: 'Test',
        capabilities: {
          analysis: true,
          creative: false,
          technical: false,
          empathetic: false
        },
        constraints: {
          maxResponseLength: 1000,
          tone: 'test',
          allowedTopics: ['test']
        }
        // Missing personality
      } as any;

      const result = AssetFactory.validateAsset(persona);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Persona personality is required');
    });

    it('should handle persona with missing capabilities', () => {
      const persona = {
        id: 'test',
        type: 'persona',
        name: 'Test',
        systemPrompt: 'Test',
        personality: {
          role: 'Test',
          traits: ['test'],
          communicationStyle: 'test',
          knowledgeDomains: ['test']
        },
        constraints: {
          maxResponseLength: 1000,
          tone: 'test',
          allowedTopics: ['test']
        }
        // Missing capabilities
      } as any;

      const result = AssetFactory.validateAsset(persona);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Persona capabilities are required');
    });

    it('should handle persona with missing constraints', () => {
      const persona = {
        id: 'test',
        type: 'persona',
        name: 'Test',
        systemPrompt: 'Test',
        personality: {
          role: 'Test',
          traits: ['test'],
          communicationStyle: 'test',
          knowledgeDomains: ['test']
        },
        capabilities: {
          analysis: true,
          creative: false,
          technical: false,
          empathetic: false
        }
        // Missing constraints
      } as any;

      const result = AssetFactory.validateAsset(persona);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Persona constraints are required');
    });

    it('should handle template with missing technique', () => {
      const template = {
        id: 'test',
        type: 'prompt-template',
        name: 'Test',
        template: 'test',
        parameters: ['param'],
        category: 'test'
        // Missing technique
      } as any;

      const result = AssetFactory.validateAsset(template);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Template technique is required');
    });

    it('should handle template with missing template content', () => {
      const template = {
        id: 'test',
        type: 'prompt-template',
        name: 'Test',
        technique: 'test',
        parameters: ['param'],
        category: 'test'
        // Missing template
      } as any;

      const result = AssetFactory.validateAsset(template);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Template content is required');
    });

    it('should handle template with missing category', () => {
      const template = {
        id: 'test',
        type: 'prompt-template',
        name: 'Test',
        technique: 'test',
        template: 'test',
        parameters: ['param']
        // Missing category
      } as any;

      const result = AssetFactory.validateAsset(template);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Template category is required');
    });

    it('should handle tool with missing parameters', () => {
      const tool = {
        id: 'test',
        type: 'tool',
        name: 'Test',
        execute: async () => 'result'
        // Missing parameters
      } as any;

      const result = AssetFactory.validateAsset(tool);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tool parameters are required');
    });
  });
});