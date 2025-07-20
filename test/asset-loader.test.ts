import { AssetLoader, AssetSerializer } from '../src/core/assets/asset-loader';
import { AssetFactory } from '../src/core/assets/asset-factory';
import { Asset } from '../src/types';
import * as fs from 'fs/promises';

// Mock fs module
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('AssetLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadFromFile', () => {
    it('should load assets from a valid JSON file', async () => {
      const mockAssets = [
        {
          id: 'test-persona',
          type: 'persona',
          name: 'Test Persona',
          description: 'A test persona',
          systemPrompt: 'Test prompt',
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
        },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockAssets));

      const result = await AssetLoader.loadFromFile('/test/path.json');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-persona');
      expect(mockFs.readFile).toHaveBeenCalledWith('/test/path.json', 'utf-8');
    });

    it('should throw error for invalid JSON', async () => {
      mockFs.readFile.mockResolvedValue('invalid json');

      await expect(AssetLoader.loadFromFile('/test/invalid.json')).rejects.toThrow();
    });

    it('should throw error for non-array data', async () => {
      mockFs.readFile.mockResolvedValue('{"not": "array"}');

      await expect(AssetLoader.loadFromFile('/test/object.json')).rejects.toThrow(
        'Asset file must contain an array of assets'
      );
    });

    it('should handle file read errors', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(AssetLoader.loadFromFile('/test/missing.json')).rejects.toThrow(
        'File not found'
      );
    });
  });

  describe('loadFromDirectory', () => {
    it('should load assets from multiple JSON files', async () => {
      const mockAssets1 = [{ id: 'asset1', type: 'persona', name: 'Asset 1' }];
      const mockAssets2 = [{ id: 'asset2', type: 'tool', name: 'Asset 2' }];

      mockFs.readdir.mockResolvedValue(['file1.json', 'file2.json', 'other.txt'] as never);
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify(mockAssets1))
        .mockResolvedValueOnce(JSON.stringify(mockAssets2));

      const result = await AssetLoader.loadFromDirectory('/test/dir');

      expect(result).toHaveLength(2);
      expect(result.map(a => a.id)).toEqual(['asset1', 'asset2']);
    });

    it('should handle directory read errors', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Directory not found'));

      await expect(AssetLoader.loadFromDirectory('/test/missing')).rejects.toThrow(
        'Directory not found'
      );
    });

    it('should skip invalid files and continue', async () => {
      mockFs.readdir.mockResolvedValue(['valid.json', 'invalid.json'] as never);
      mockFs.readFile.mockResolvedValueOnce('[]').mockRejectedValueOnce(new Error('Invalid file'));

      const result = await AssetLoader.loadFromDirectory('/test/dir');

      expect(result).toHaveLength(0);
    });
  });

  describe('loadFromUrl', () => {
    it('should load assets from a valid URL', async () => {
      const mockAssets = [{ id: 'remote-asset', type: 'persona', name: 'Remote Asset' }];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAssets),
      } as Response);

      const result = await AssetLoader.loadFromUrl('https://example.com/assets.json');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('remote-asset');
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(AssetLoader.loadFromUrl('https://example.com/missing.json')).rejects.toThrow(
        'HTTP 404: Not Found'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(AssetLoader.loadFromUrl('https://example.com/assets.json')).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle non-array response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ not: 'array' }),
      } as Response);

      await expect(AssetLoader.loadFromUrl('https://example.com/assets.json')).rejects.toThrow(
        'Remote asset source must return an array of assets'
      );
    });
  });

  describe('validateAndFilter', () => {
    it('should filter out invalid assets', () => {
      const assets = [
        AssetFactory.createPersona({
          id: 'valid',
          name: 'Valid',
          description: 'Valid persona',
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
        }),
        { id: 'invalid', type: 'persona', name: 'Invalid' } as Asset,
      ];

      const result = AssetLoader.validateAndFilter(assets);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('valid');
    });
  });
});

describe('AssetSerializer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveToFile', () => {
    it('should save assets to JSON file', async () => {
      const assets = [
        AssetFactory.createPersona({
          id: 'test',
          name: 'Test',
          description: 'Test persona',
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
        }),
      ];

      mockFs.writeFile.mockResolvedValue();

      await AssetSerializer.saveToFile(assets, '/test/output.json');

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        '/test/output.json',
        expect.stringContaining('"id": "test"'),
        'utf-8'
      );
    });

    it('should handle write errors', async () => {
      mockFs.writeFile.mockRejectedValue(new Error('Write failed'));

      await expect(AssetSerializer.saveToFile([], '/test/output.json')).rejects.toThrow(
        'Write failed'
      );
    });
  });

  describe('saveByType', () => {
    it('should save assets grouped by type', async () => {
      const assets = [
        AssetFactory.createPersona({
          id: 'persona1',
          name: 'Persona 1',
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
        }),
        AssetFactory.createPromptTemplate({
          id: 'template1',
          name: 'Template 1',
          description: 'Test',
          technique: 'test',
          template: 'Test {param}',
          parameters: ['param'],
          category: 'test',
        }),
      ];

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue();

      await AssetSerializer.saveByType(assets, '/test/output');

      expect(mockFs.mkdir).toHaveBeenCalledWith('/test/output', { recursive: true });
      expect(mockFs.writeFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateTypeScriptDefinitions', () => {
    it('should generate TypeScript definitions', () => {
      const assets = [
        AssetFactory.createPersona({
          id: 'test-persona',
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
        }),
      ];

      const result = AssetSerializer.generateTypeScriptDefinitions(assets);

      expect(result).toContain('export const PERSONA_ASSETS');
      expect(result).toContain('export const ALL_ASSETS');
      expect(result).toContain('test-persona');
    });
  });
});
