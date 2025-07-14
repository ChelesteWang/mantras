import { loadConfig } from '../src/config';
import fs from 'fs';
import path from 'path';

describe('Configuration Loader', () => {
  const tempConfigPath = path.join(__dirname, 'temp-config.json');
  const tempConfigContent = JSON.stringify({ personas: './test/test-assets.json' });

  beforeAll(() => {
    // Create a temporary config file for testing
    fs.writeFileSync(tempConfigPath, tempConfigContent);
  });

  afterAll(() => {
    // Clean up the temporary config file
    if (fs.existsSync(tempConfigPath)) {
      fs.unlinkSync(tempConfigPath);
    }
  });

  it('should load configuration from a specific file path', async () => {
    const config = await loadConfig(tempConfigPath);
    expect(config).toBeDefined();
    expect(config.personas).toBe('./test/test-assets.json');
  });

  it('should return default configuration when the specified file is not found', async () => {
    const nonExistentPath = path.join(__dirname, 'non-existent-config.json');
    const config = await loadConfig(nonExistentPath);
    expect(config).toBeDefined();
    expect(config.personas).toBe('');
  });
});