import { UnifiedAssetManager } from '../src/unified-asset-manager';
import { AssetFactory } from '../src/asset-factory';
import { AssetLoader, AssetSerializer } from '../src/asset-loader';
import { RemoteAssetRepository } from '../src/asset-repository';
import { Asset, Persona, PromptTemplate, ActionableTool } from '../src/types';

// Mock dependencies
jest.mock('../src/asset-loader');
const MockAssetLoader = AssetLoader as jest.Mocked<typeof AssetLoader>;
const MockAssetSerializer = AssetSerializer as jest.Mocked<typeof AssetSerializer>;

describe('UnifiedAssetManager - Extended Coverage', () => {
  let manager: UnifiedAssetManager;
  let mockRepository: jest.Mocked<RemoteAssetRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = {
      getAssets: jest.fn(),
      getAssetById: jest.fn()
    } as any;
    manager = new UnifiedAssetManager(mockRepository);
  });

  describe('Change Listeners', () => {
    it('should handle listener errors gracefully', () => {
      const errorListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      const goodListener = jest.fn();

      manager.addChangeListener(errorListener);
      manager.addChangeListener(goodListener);

      const asset = AssetFactory.createPersona({
        id: 'test',
        name: 'Test',
        description: 'Test',
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
        },
        constraints: {
          maxResponseLength: 1000,
          tone: 'test',
          allowedTopics: ['test']
        }
      });

      // Should not throw despite listener error
      expect(() => manager.registerAsset(asset)).not.toThrow();
      expect(goodListener).toHaveBeenCalled();
    });

    it('should remove listeners correctly', () => {
      const listener = jest.fn();
      manager.addChangeListener(listener);
      manager.removeChangeListener(listener);

      const asset = AssetFactory.createPersona({
        id: 'test',
        name: 'Test',
        description: 'Test',
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
        },
        constraints: {
          maxResponseLength: 1000,
          tone: 'test',
          allowedTopics: ['test']
        }
      });

      manager.registerAsset(asset);
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Asset Registration with Validation', () => {
    it('should skip validation when requested', () => {
      const invalidAsset = {
        id: 'invalid',
        type: 'persona',
        name: 'Invalid'
        // Missing required fields
      } as Asset;

      expect(() => manager.registerAsset(invalidAsset, true)).not.toThrow();
      expect(manager.getAssetById('invalid')).toBe(invalidAsset);
    });

    it('should throw error for invalid asset when validation enabled', () => {
      const invalidAsset = {
        id: 'invalid',
        type: 'persona',
        name: 'Invalid'
        // Missing required fields
      } as Asset;

      expect(() => manager.registerAsset(invalidAsset, false))
        .toThrow('Invalid asset invalid:');
    });
  });

  describe('Asset Removal', () => {
    it('should return false when removing non-existent asset', () => {
      const result = manager.removeAsset('non-existent');
      expect(result).toBe(false);
    });

    it('should remove asset and notify listeners', () => {
      const listener = jest.fn();
      manager.addChangeListener(listener);

      const asset = AssetFactory.createPersona({
        id: 'to-remove',
        name: 'To Remove',
        description: 'Test',
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
        },
        constraints: {
          maxResponseLength: 1000,
          tone: 'test',
          allowedTopics: ['test']
        }
      });

      manager.registerAsset(asset);
      const result = manager.removeAsset('to-remove');

      expect(result).toBe(true);
      expect(manager.getAssetById('to-remove')).toBeUndefined();
      expect(listener).toHaveBeenCalledWith(asset, 'removed');
    });
  });

  describe('Import/Export Functions', () => {
    it('should import assets from file', async () => {
      const mockAssets = [
        AssetFactory.createPersona({
          id: 'imported',
          name: 'Imported',
          description: 'Test',
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
          },
          constraints: {
            maxResponseLength: 1000,
            tone: 'test',
            allowedTopics: ['test']
          }
        })
      ];

      MockAssetLoader.loadFromFile.mockResolvedValue(mockAssets);
      MockAssetLoader.validateAndFilter.mockReturnValue(mockAssets);

      const count = await manager.importFromFile('/test/file.json');

      expect(count).toBe(1);
      expect(manager.getAssetById('imported')).toBeDefined();
    });

    it('should handle import errors', async () => {
      MockAssetLoader.loadFromFile.mockRejectedValue(new Error('Import failed'));

      await expect(manager.importFromFile('/test/file.json'))
        .rejects.toThrow('Import failed');
    });

    it('should import assets from directory', async () => {
      const mockAssets = [
        AssetFactory.createPersona({
          id: 'dir-imported',
          name: 'Directory Imported',
          description: 'Test',
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
          },
          constraints: {
            maxResponseLength: 1000,
            tone: 'test',
            allowedTopics: ['test']
          }
        })
      ];

      MockAssetLoader.loadFromDirectory.mockResolvedValue(mockAssets);
      MockAssetLoader.validateAndFilter.mockReturnValue(mockAssets);

      const count = await manager.importFromDirectory('/test/dir');

      expect(count).toBe(1);
      expect(manager.getAssetById('dir-imported')).toBeDefined();
    });

    it('should export assets to file', async () => {
      const asset = AssetFactory.createPersona({
        id: 'to-export',
        name: 'To Export',
        description: 'Test',
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
        },
        constraints: {
          maxResponseLength: 1000,
          tone: 'test',
          allowedTopics: ['test']
        }
      });

      manager.registerAsset(asset);
      MockAssetSerializer.saveToFile.mockResolvedValue();

      await manager.exportToFile('/test/export.json');

      expect(MockAssetSerializer.saveToFile).toHaveBeenCalledWith(
        [asset],
        '/test/export.json'
      );
    });

    it('should export assets by type', async () => {
      const persona = AssetFactory.createPersona({
        id: 'persona-export',
        name: 'Persona Export',
        description: 'Test',
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
        },
        constraints: {
          maxResponseLength: 1000,
          tone: 'test',
          allowedTopics: ['test']
        }
      });

      manager.registerAsset(persona);
      MockAssetSerializer.saveToFile.mockResolvedValue();

      await manager.exportToFile('/test/personas.json', 'persona');

      expect(MockAssetSerializer.saveToFile).toHaveBeenCalledWith(
        [persona],
        '/test/personas.json'
      );
    });

    it('should export by type to directory', async () => {
      MockAssetSerializer.saveByType.mockResolvedValue();

      await manager.exportByType('/test/output');

      expect(MockAssetSerializer.saveByType).toHaveBeenCalledWith(
        [],
        '/test/output'
      );
    });
  });

  describe('TypeScript Definitions', () => {
    it('should generate TypeScript definitions', () => {
      const asset = AssetFactory.createPersona({
        id: 'ts-def',
        name: 'TS Definition',
        description: 'Test',
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
        },
        constraints: {
          maxResponseLength: 1000,
          tone: 'test',
          allowedTopics: ['test']
        }
      });

      manager.registerAsset(asset);
      MockAssetSerializer.generateTypeScriptDefinitions.mockReturnValue('export const ASSETS = [];');

      const result = manager.generateTypeScriptDefinitions();

      expect(result).toBe('export const ASSETS = [];');
      expect(MockAssetSerializer.generateTypeScriptDefinitions).toHaveBeenCalledWith([asset]);
    });
  });

  describe('Snapshot Functions', () => {
    it('should create snapshot', () => {
      const asset = AssetFactory.createPersona({
        id: 'snapshot-test',
        name: 'Snapshot Test',
        description: 'Test',
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
        },
        constraints: {
          maxResponseLength: 1000,
          tone: 'test',
          allowedTopics: ['test']
        }
      });

      manager.registerAsset(asset);
      const snapshot = manager.createSnapshot();

      expect(snapshot.assets).toHaveLength(1);
      expect(snapshot.assets[0].id).toBe('snapshot-test');
      expect(snapshot.stats.persona).toBe(1);
      expect(snapshot.timestamp).toBeDefined();
    });

    it('should restore from snapshot', () => {
      const asset1 = AssetFactory.createPersona({
        id: 'original',
        name: 'Original',
        description: 'Test',
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
        },
        constraints: {
          maxResponseLength: 1000,
          tone: 'test',
          allowedTopics: ['test']
        }
      });

      const asset2 = AssetFactory.createPersona({
        id: 'restored',
        name: 'Restored',
        description: 'Test',
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
        },
        constraints: {
          maxResponseLength: 1000,
          tone: 'test',
          allowedTopics: ['test']
        }
      });

      manager.registerAsset(asset1);
      expect(manager.getAllAssets()).toHaveLength(1);

      const snapshot = { assets: [asset2] };
      manager.restoreFromSnapshot(snapshot);

      expect(manager.getAllAssets()).toHaveLength(1);
      expect(manager.getAssetById('original')).toBeUndefined();
      expect(manager.getAssetById('restored')).toBeDefined();
    });
  });

  describe('Load Assets Error Handling', () => {
    it('should handle repository errors during load', async () => {
      mockRepository.getAssets.mockRejectedValue(new Error('Repository error'));

      await expect(manager.loadAssets()).rejects.toThrow('Repository error');
    });

    it('should refresh assets successfully', async () => {
      const mockAssets = [
        AssetFactory.createPersona({
          id: 'refreshed',
          name: 'Refreshed',
          description: 'Test',
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
          },
          constraints: {
            maxResponseLength: 1000,
            tone: 'test',
            allowedTopics: ['test']
          }
        })
      ];

      mockRepository.getAssets.mockResolvedValue(mockAssets);

      await manager.refreshAssets();

      expect(manager.getAssetById('refreshed')).toBeDefined();
    });
  });
});