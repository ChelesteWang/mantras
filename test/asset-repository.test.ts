import { RemoteAssetRepository } from '../src/core/assets/asset-repository';
import { Asset } from '../src/types';

// First, get the actual module to ensure we have the real defaultAssets
const originalAssetSources = jest.requireActual('../src/core/assets/asset-sources');

// Mock the asset-sources module to provide a predictable remote URL for testing fetch logic
jest.mock('../src/core/assets/asset-sources', () => ({
  ...originalAssetSources,
  ASSET_SOURCES: ['http://fake-url.com/assets.json'], // Override only the sources
}));

// Mock the fs/promises module to have a predictable readFile function
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

describe('RemoteAssetRepository', () => {
  const mockLocalAssets: Asset[] = [
    { id: 'local-1', name: 'Local Asset 1', type: 'persona', description: '', systemPrompt: '' },
  ];
  const mockRemoteAssets: Asset[] = [
    { id: 'remote-1', name: 'Remote Asset 1', type: 'persona', description: '', systemPrompt: '' },
  ];
  const localFilePath = './test-assets.json';

  beforeEach(() => {
    // Reset modules to clear cache and state between tests
    jest.resetModules();
    // Clear all mocks before each test to ensure test isolation
    jest.clearAllMocks();
  });

  it('should fetch assets from a remote source successfully', async () => {
    const { RemoteAssetRepository } = require('../src/core/assets/asset-repository');
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockRemoteAssets,
    } as Response);

    const repo = new RemoteAssetRepository();
    const assets = await repo.getAssets();

    expect(fetchSpy).toHaveBeenCalledWith('http://fake-url.com/assets.json');
    expect(assets).toEqual(mockRemoteAssets);
  });

  it('should fall back to default assets when remote fetch fails and no local file is provided', async () => {
    const { RemoteAssetRepository } = require('../src/core/assets/asset-repository');
    const { defaultAssets } = require('../src/core/assets/asset-sources');
    const fetchSpy = jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    const repo = new RemoteAssetRepository(); // No local file path
    const assets = await repo.getAssets();

    expect(fetchSpy).toHaveBeenCalledWith('http://fake-url.com/assets.json');
    expect(assets).toEqual(defaultAssets);
    expect(assets.find((a: Asset) => a.id === 'analyst')).toBeDefined();
  });

  it('should load and merge local assets when remote fetch fails', async () => {
    const fs = require('fs/promises');
    const { RemoteAssetRepository } = require('../src/core/assets/asset-repository');
    const { defaultAssets } = require('../src/core/assets/asset-sources');
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    fs.readFile.mockResolvedValue(JSON.stringify(mockLocalAssets));

    const repo = new RemoteAssetRepository(localFilePath);
    const assets = await repo.getAssets();

    expect(fs.readFile).toHaveBeenCalledWith(localFilePath, 'utf-8');
    const localAsset = assets.find((a: { id: string; }) => a.id === 'local-1');
    const defaultAsset = assets.find((a: Asset) => a.id === 'analyst');
    expect(localAsset).toBeDefined();
    expect(localAsset?.name).toBe('Local Asset 1');
    expect(defaultAsset).toBeDefined();
    expect(assets.length).toBe(defaultAssets.length + mockLocalAssets.length);
  });

  it('should return cached assets on subsequent calls', async () => {
    const { RemoteAssetRepository } = require('../src/core/assets/asset-repository');
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockRemoteAssets,
    } as Response);

    const repo = new RemoteAssetRepository();
    await repo.getAssets(); // First call, fetches and caches
    await repo.getAssets(); // Second call, should use cache

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('should merge remote and local assets, with local taking precedence', async () => {
    const fs = require('fs/promises');
    const { RemoteAssetRepository } = require('../src/core/assets/asset-repository');
    const mixedRemoteAssets: Asset[] = [
        { id: 'remote-1', name: 'Remote Asset 1', type: 'persona', description: '', systemPrompt: '' },
        { id: 'local-1', name: 'Original Local Asset', type: 'persona', description: '', systemPrompt: '' },
    ];
    jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mixedRemoteAssets,
    } as Response);
    fs.readFile.mockResolvedValue(JSON.stringify(mockLocalAssets));

    const repo = new RemoteAssetRepository(localFilePath);
    const assets = await repo.getAssets();

    const remoteAsset = assets.find((a: { id: string; }) => a.id === 'remote-1');
    expect(remoteAsset).toBeDefined();

    const localAsset = assets.find((a: Asset) => a.id === 'local-1');
    expect(localAsset).toBeDefined();
    expect(localAsset?.name).toBe('Local Asset 1'); // Check that local version is used
  });

  it('should get an asset by its ID', async () => {
    const { RemoteAssetRepository } = require('../src/core/assets/asset-repository');
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockRemoteAssets,
    } as Response);

    const repo = new RemoteAssetRepository();
    const asset = await repo.getAssetById('remote-1');
    expect(asset).toBeDefined();
    expect(asset?.id).toBe('remote-1');

    const notFoundAsset = await repo.getAssetById('non-existent-id');
    expect(notFoundAsset).toBeUndefined();
  });

  it('should log an error when remote fetch fails with an Error instance', async () => {
    const { RemoteAssetRepository } = require('../src/core/assets/asset-repository');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network failure'));

    const repo = new RemoteAssetRepository();
    await repo.getAssets();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch remote assets from http://fake-url.com/assets.json: Network failure'
    );
    consoleErrorSpy.mockRestore();
  });

  it('should log an unknown error when remote fetch fails with a non-Error', async () => {
    const { RemoteAssetRepository } = require('../src/core/assets/asset-repository');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(global, 'fetch').mockRejectedValue('some string error');

    const repo = new RemoteAssetRepository();
    await repo.getAssets();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'An unknown error occurred while fetching remote assets from http://fake-url.com/assets.json'
    );
    consoleErrorSpy.mockRestore();
  });

  it('should log an error when reading local assets fails', async () => {
    const fs = require('fs/promises');
    const { RemoteAssetRepository } = require('../src/core/assets/asset-repository');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => [] } as Response);
    fs.readFile.mockRejectedValue(new Error('Read error'));

    const repo = new RemoteAssetRepository(localFilePath);
    await repo.getAssets();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Failed to read or parse local assets from ${localFilePath}:`,
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });
});