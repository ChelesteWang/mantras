import { AssetFactory } from '../src/core/assets/asset-factory';
import { Asset, Persona } from '../src/types';

describe('AssetFactory - Complete Coverage', () => {
  describe('fromRawData', () => {
    it('should create persona from raw data', () => {
      const rawData = {
        id: 'test-persona',
        type: 'persona',
        name: 'Test Persona',
        description: 'Test',
        systemPrompt: 'Test',
        personality: {
          role: 'Test',
          traits: ['test'],
          communicationStyle: 'test',
          knowledgeDomains: ['test'],
        },
        capabilities: {
          analysis: true,
          creative: false,
          technical: false,
          empathetic: false,
        },
        constraints: {
          maxResponseLength: 1000,
          tone: 'test',
          allowedTopics: ['test'],
        },
      };

      const result = AssetFactory.fromRawData(rawData);
      expect(result.type).toBe('persona');
      expect(result.id).toBe('test-persona');
    });

    it('should create prompt template from raw data', () => {
      const rawData = {
        id: 'test-template',
        type: 'prompt-template',
        name: 'Test Template',
        description: 'Test',
        technique: 'test',
        template: 'Test {param}',
        parameters: ['param'],
        category: 'test',
      };

      const result = AssetFactory.fromRawData(rawData);
      expect(result.type).toBe('prompt-template');
      expect(result.id).toBe('test-template');
    });

    it('should create tool from raw data', () => {
      const rawData = {
        id: 'test-tool',
        type: 'tool',
        name: 'Test Tool',
        description: 'Test',
        parameters: { type: 'object' },
        execute: async () => 'result',
      };

      const result = AssetFactory.fromRawData(rawData);
      expect(result.type).toBe('tool');
      expect(result.id).toBe('test-tool');
    });

    it('should throw error for missing type', () => {
      const rawData = {
        id: 'test',
        name: 'Test',
      };

      expect(() => AssetFactory.fromRawData(rawData)).toThrow('Asset type is required');
    });

    it('should throw error for unknown type', () => {
      const rawData = {
        id: 'test',
        type: 'unknown',
        name: 'Test',
      };

      expect(() => AssetFactory.fromRawData(rawData)).toThrow('Unknown asset type: unknown');
    });
  });

  describe('validateAsset - Edge Cases', () => {
    it('should detect missing ID', () => {
      const asset = {
        type: 'persona',
        name: 'Test',
      } as Asset;

      const result = AssetFactory.validateAsset(asset);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Asset ID is required');
    });

    it('should detect missing name', () => {
      const asset = {
        id: 'test',
        type: 'persona',
      } as Asset;

      const result = AssetFactory.validateAsset(asset);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Asset name is required');
    });

    it('should detect missing type', () => {
      const asset = {
        id: 'test',
        name: 'Test',
      } as Asset;

      const result = AssetFactory.validateAsset(asset);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Asset type is required');
    });

    it('should validate prompt template with invalid parameters', () => {
      const template = {
        id: 'test',
        type: 'prompt-template',
        name: 'Test',
        technique: 'test',
        template: 'test',
        parameters: 'not-array',
        category: 'test',
      } as unknown as Asset;

      const result = AssetFactory.validateAsset(template);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Template parameters must be an array');
    });

    it('should validate tool with missing execute function', () => {
      const tool = {
        id: 'test',
        type: 'tool',
        name: 'Test',
        parameters: {},
        execute: 'not-function',
      } as unknown as Asset;

      const result = AssetFactory.validateAsset(tool);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tool execute function is required');
    });
  });

  describe('mergeAssets', () => {
    it('should merge assets while preserving ID and type', () => {
      const base = AssetFactory.createPersona({
        id: 'original-id',
        name: 'Original Name',
        description: 'Original',
        systemPrompt: 'Original',
        personality: {
          role: 'Original',
          traits: ['original'],
          communicationStyle: 'original',
          knowledgeDomains: ['original'],
        },
        capabilities: {
          analysis: true,
          creative: false,
          technical: false,
          empathetic: false,
        },
        constraints: {
          maxResponseLength: 1000,
          tone: 'original',
          allowedTopics: ['original'],
        },
      });

      const override: Partial<Persona> = {
        name: 'New Name',
        description: 'New Description',
      };

      const result = AssetFactory.mergeAssets(base, override);

      expect(result.id).toBe('original-id'); // ID preserved
      expect(result.type).toBe('persona'); // Type preserved
      expect(result.name).toBe('New Name'); // Override applied
      expect(result.description).toBe('New Description'); // Override applied
    });
  });
});
