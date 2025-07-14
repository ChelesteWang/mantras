import { cosmiconfig } from 'cosmiconfig';
import { logger } from './logger';

export interface AppConfig {
  personas: string;
}

const defaultConfig: AppConfig = {
  personas: '',
};

export async function loadConfig(filePath?: string): Promise<AppConfig> {
  try {
    const explorer = cosmiconfig('mantras');
    const result = filePath ? await explorer.load(filePath) : await explorer.search();

    if (result && !result.isEmpty) {
      // Merge the loaded config with the default config to ensure all properties are set
      return { ...defaultConfig, ...result.config };
    }
  } catch (error) {
    // It's not a critical error if the config file is not found, so we log it and return the default.
    logger.warn(`Could not load configuration. Using default settings. Error: ${error}`);
  }

  return defaultConfig;
}