/**
 * 配置管理系统 - 统一管理应用配置
 */

import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// 环境类型
export type Environment = 'development' | 'production' | 'test';

// 日志级别
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

// 缓存配置
export const CacheConfigSchema = z.object({
  enabled: z.boolean().default(true),
  type: z.enum(['memory', 'redis']).default('memory'),
  ttl: z.number().default(300), // 5分钟
  maxSize: z.number().default(1000),
  redis: z
    .object({
      host: z.string().default('localhost'),
      port: z.number().default(6379),
      password: z.string().optional(),
      db: z.number().default(0),
    })
    .optional(),
});

// 数据库配置
export const DatabaseConfigSchema = z.object({
  type: z.enum(['sqlite', 'postgresql', 'mysql']).default('sqlite'),
  host: z.string().default('localhost'),
  port: z.number().default(5432),
  database: z.string().default('mantras'),
  username: z.string().default('mantras'),
  password: z.string().optional(),
  ssl: z.boolean().default(false),
  pool: z
    .object({
      min: z.number().default(2),
      max: z.number().default(10),
      acquireTimeoutMillis: z.number().default(30000),
      idleTimeoutMillis: z.number().default(30000),
    })
    .default({}),
});

// 监控配置
export const MonitoringConfigSchema = z.object({
  enabled: z.boolean().default(true),
  metricsEnabled: z.boolean().default(true),
  healthCheckEnabled: z.boolean().default(true),
  healthCheckInterval: z.number().default(30000), // 30秒
  alerting: z
    .object({
      enabled: z.boolean().default(false),
      webhookUrl: z.string().optional(),
      errorThreshold: z.number().default(10),
      responseTimeThreshold: z.number().default(1000),
    })
    .default({}),
});

// 安全配置
export const SecurityConfigSchema = z.object({
  rateLimiting: z
    .object({
      enabled: z.boolean().default(true),
      windowMs: z.number().default(60000), // 1分钟
      maxRequests: z.number().default(100),
      skipSuccessfulRequests: z.boolean().default(false),
    })
    .default({}),
  cors: z
    .object({
      enabled: z.boolean().default(true),
      origins: z.array(z.string()).default(['*']),
      methods: z.array(z.string()).default(['GET', 'POST', 'PUT', 'DELETE']),
      allowedHeaders: z.array(z.string()).default(['Content-Type', 'Authorization']),
    })
    .default({}),
});

// 功能开关配置
export const FeatureFlagsSchema = z.object({
  enableCache: z.boolean().default(true),
  enableMetrics: z.boolean().default(true),
  enableAsyncLoading: z.boolean().default(true),
  enableRateLimit: z.boolean().default(true),
  enablePersonaMemory: z.boolean().default(true),
  enableToolMiddleware: z.boolean().default(true),
  enableErrorTracking: z.boolean().default(true),
});

// 主配置模式
export const ConfigSchema = z.object({
  // 基础配置
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.number().default(3000),
  host: z.string().default('localhost'),
  logLevel: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // 应用配置
  app: z
    .object({
      name: z.string().default('Mantras MCP Server'),
      version: z.string().default('2.0.0'),
      description: z.string().default('AI Asset Management and Persona Summoning System'),
    })
    .default({}),

  // 资产配置
  assets: z
    .object({
      directory: z.string().default('./assets'),
      useBuildAssets: z.boolean().default(false),
      buildAssetsPath: z.string().default('./dist/assets/assets.json'),
      autoReload: z.boolean().default(true),
      watchChanges: z.boolean().default(true),
    })
    .default({}),

  // 子系统配置
  cache: CacheConfigSchema.default({}),
  database: DatabaseConfigSchema.default({}),
  monitoring: MonitoringConfigSchema.default({}),
  security: SecurityConfigSchema.default({}),
  features: FeatureFlagsSchema.default({}),
});

// 配置类型
export type Config = z.infer<typeof ConfigSchema>;
export type CacheConfig = z.infer<typeof CacheConfigSchema>;
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type MonitoringConfig = z.infer<typeof MonitoringConfigSchema>;
export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;
export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;

/**
 * 配置管理器
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;
  private watchers: ConfigWatcher[] = [];

  private constructor() {
    this.config = this.loadConfig();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 获取完整配置
   */
  getConfig(): Config {
    return this.config;
  }

  /**
   * 获取特定配置项
   */
  get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }

  /**
   * 获取嵌套配置项
   */
  getNested<T>(path: string): T {
    const keys = path.split('.');
    let value: any = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        throw new Error(`Configuration path '${path}' not found`);
      }
    }

    return value as T;
  }

  /**
   * 检查功能是否启用
   */
  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.config.features[feature];
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<Config>): void {
    const newConfig = { ...this.config, ...updates };
    const validatedConfig = ConfigSchema.parse(newConfig);

    const oldConfig = this.config;
    this.config = validatedConfig;

    // 通知观察者
    this.notifyWatchers(oldConfig, this.config);
  }

  /**
   * 重新加载配置
   */
  reloadConfig(): void {
    const oldConfig = this.config;
    this.config = this.loadConfig();
    this.notifyWatchers(oldConfig, this.config);
  }

  /**
   * 添加配置观察者
   */
  addWatcher(watcher: ConfigWatcher): void {
    this.watchers.push(watcher);
  }

  /**
   * 移除配置观察者
   */
  removeWatcher(watcher: ConfigWatcher): void {
    const index = this.watchers.indexOf(watcher);
    if (index > -1) {
      this.watchers.splice(index, 1);
    }
  }

  /**
   * 验证配置
   */
  validateConfig(): ConfigValidationResult {
    try {
      ConfigSchema.parse(this.config);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        errors:
          error instanceof z.ZodError
            ? error.errors.map(err => ({
                message: err.message,
                path: err.path.map(p => String(p)),
              }))
            : [{ message: String(error) }],
      };
    }
  }

  /**
   * 获取配置摘要
   */
  getConfigSummary(): ConfigSummary {
    return {
      environment: this.config.nodeEnv,
      version: this.config.app.version,
      features: Object.entries(this.config.features)
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature),
      cacheEnabled: this.config.cache.enabled,
      monitoringEnabled: this.config.monitoring.enabled,
      rateLimitEnabled: this.config.security.rateLimiting.enabled,
    };
  }

  /**
   * 导出配置为 JSON
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * 从 JSON 导入配置
   */
  importConfig(configJson: string): void {
    try {
      const parsedConfig = JSON.parse(configJson);
      const validatedConfig = ConfigSchema.parse(parsedConfig);

      const oldConfig = this.config;
      this.config = validatedConfig;
      this.notifyWatchers(oldConfig, this.config);
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error}`);
    }
  }

  /**
   * 加载配置
   */
  private loadConfig(): Config {
    // 从环境变量加载配置
    const envConfig = this.loadFromEnvironment();

    // 从配置文件加载（如果存在）
    const fileConfig = this.loadFromFile();

    // 合并配置（环境变量优先级最高）
    const mergedConfig = {
      ...fileConfig,
      ...envConfig,
    };

    // 验证并返回配置
    return ConfigSchema.parse(mergedConfig);
  }

  /**
   * 从环境变量加载配置
   */
  private loadFromEnvironment(): Partial<Config> {
    const env = process.env;

    const config: any = {
      nodeEnv: (env.NODE_ENV as Environment) || 'development',
      logLevel: (env.LOG_LEVEL as LogLevel) || undefined,

      assets: {},
      cache: { redis: {} },
      database: {},
      monitoring: {},
      security: { rateLimiting: {} },
    };

    // 只在值存在时设置
    if (env.PORT) config.port = parseInt(env.PORT, 10);
    if (env.HOST) config.host = env.HOST;

    if (env.ASSETS_DIR) config.assets.directory = env.ASSETS_DIR;
    if (env.USE_BUILD_ASSETS) config.assets.useBuildAssets = env.USE_BUILD_ASSETS === 'true';
    if (env.BUILD_ASSETS_PATH) config.assets.buildAssetsPath = env.BUILD_ASSETS_PATH;

    if (env.CACHE_ENABLED !== undefined) config.cache.enabled = env.CACHE_ENABLED !== 'false';
    if (env.CACHE_TYPE) config.cache.type = env.CACHE_TYPE as 'memory' | 'redis';
    if (env.CACHE_TTL) config.cache.ttl = parseInt(env.CACHE_TTL, 10);

    if (env.REDIS_HOST) config.cache.redis.host = env.REDIS_HOST;
    if (env.REDIS_PORT) config.cache.redis.port = parseInt(env.REDIS_PORT, 10);
    if (env.REDIS_PASSWORD) config.cache.redis.password = env.REDIS_PASSWORD;
    if (env.REDIS_DB) config.cache.redis.db = parseInt(env.REDIS_DB, 10);

    if (env.DB_TYPE) config.database.type = env.DB_TYPE as 'sqlite' | 'postgresql' | 'mysql';
    if (env.DB_HOST) config.database.host = env.DB_HOST;
    if (env.DB_PORT) config.database.port = parseInt(env.DB_PORT, 10);
    if (env.DB_NAME) config.database.database = env.DB_NAME;
    if (env.DB_USER) config.database.username = env.DB_USER;
    if (env.DB_PASSWORD) config.database.password = env.DB_PASSWORD;
    if (env.DB_SSL) config.database.ssl = env.DB_SSL === 'true';

    if (env.MONITORING_ENABLED !== undefined)
      config.monitoring.enabled = env.MONITORING_ENABLED !== 'false';
    if (env.METRICS_ENABLED !== undefined)
      config.monitoring.metricsEnabled = env.METRICS_ENABLED !== 'false';

    if (env.RATE_LIMIT_ENABLED !== undefined)
      config.security.rateLimiting.enabled = env.RATE_LIMIT_ENABLED !== 'false';
    if (env.RATE_LIMIT_MAX)
      config.security.rateLimiting.maxRequests = parseInt(env.RATE_LIMIT_MAX, 10);

    return config;
  }

  /**
   * 从配置文件加载配置
   */
  private loadFromFile(): Partial<Config> {
    try {
      // 尝试加载 config.json
      const configPath = join(process.cwd(), 'config.json');
      if (existsSync(configPath)) {
        const configContent = readFileSync(configPath, 'utf8');
        return JSON.parse(configContent);
      }
    } catch (error) {
      console.warn('Failed to load configuration file:', error);
    }

    return {};
  }

  /**
   * 通知配置观察者
   */
  private notifyWatchers(oldConfig: Config, newConfig: Config): void {
    this.watchers.forEach(watcher => {
      try {
        watcher(oldConfig, newConfig);
      } catch (error) {
        console.error('Error in config watcher:', error);
      }
    });
  }
}

// 配置观察者类型
export type ConfigWatcher = (oldConfig: Config, newConfig: Config) => void;

// 配置验证结果
export interface ConfigValidationResult {
  valid: boolean;
  errors?: Array<{ message: string; path?: string[] }>;
}

// 配置摘要
export interface ConfigSummary {
  environment: Environment;
  version: string;
  features: string[];
  cacheEnabled: boolean;
  monitoringEnabled: boolean;
  rateLimitEnabled: boolean;
}

// 全局配置实例
export const config = ConfigManager.getInstance();

// 便捷函数
export function getConfig(): Config {
  return config.getConfig();
}

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return config.isFeatureEnabled(feature);
}

export function getConfigValue<K extends keyof Config>(key: K): Config[K] {
  return config.get(key);
}
