/**
 * 依赖注入容器 - 管理服务的注册和解析
 */

export interface ServiceDefinition<T = any> {
  factory: (...args: any[]) => T;
  singleton?: boolean;
  dependencies?: string[];
  metadata?: Record<string, any>;
}

export interface ServiceScope {
  id: string;
  parent?: ServiceScope;
  services: Map<string, any>;
}

export class DIContainer {
  private services = new Map<string, ServiceDefinition>();
  private singletonInstances = new Map<string, any>();
  private currentScope: ServiceScope | undefined = undefined;
  private scopeStack: ServiceScope[] = [];

  /**
   * 注册服务
   */
  register<T>(key: string, definition: ServiceDefinition<T>): void {
    if (this.services.has(key)) {
      throw new Error(`Service '${key}' is already registered`);
    }

    this.services.set(key, definition);
  }

  /**
   * 注册单例服务
   */
  registerSingleton<T>(
    key: string,
    factory: (...args: any[]) => T,
    dependencies: string[] = []
  ): void {
    this.register(key, {
      factory,
      singleton: true,
      dependencies,
    });
  }

  /**
   * 注册瞬态服务
   */
  registerTransient<T>(
    key: string,
    factory: (...args: any[]) => T,
    dependencies: string[] = []
  ): void {
    this.register(key, {
      factory,
      singleton: false,
      dependencies,
    });
  }

  /**
   * 解析服务
   */
  resolve<T>(key: string): T {
    const definition = this.services.get(key);
    if (!definition) {
      throw new Error(`Service '${key}' not found`);
    }

    // 检查是否为单例且已实例化
    if (definition.singleton && this.singletonInstances.has(key)) {
      return this.singletonInstances.get(key);
    }

    // 检查当前作用域
    if (this.currentScope && this.currentScope.services.has(key)) {
      return this.currentScope.services.get(key);
    }

    // 解析依赖
    const dependencies = this.resolveDependencies(definition.dependencies || []);

    // 创建实例
    const instance = definition.factory(...dependencies);

    // 存储实例
    if (definition.singleton) {
      this.singletonInstances.set(key, instance);
    } else if (this.currentScope) {
      this.currentScope.services.set(key, instance);
    }

    return instance;
  }

  /**
   * 创建新的作用域
   */
  createScope(id?: string): ServiceScope {
    const scope: ServiceScope = {
      id: id || `scope_${Date.now()}`,
      parent: this.currentScope,
      services: new Map(),
    };

    this.scopeStack.push(scope);
    this.currentScope = scope;

    return scope;
  }

  /**
   * 退出当前作用域
   */
  exitScope(): void {
    if (this.scopeStack.length === 0) {
      throw new Error('No scope to exit');
    }

    const currentScope = this.scopeStack.pop()!;
    this.currentScope = currentScope.parent || undefined;

    // 清理作用域中的服务
    currentScope.services.clear();
  }

  /**
   * 在指定作用域中执行
   */
  async withScope<T>(scopeId: string, callback: () => Promise<T>): Promise<T> {
    const scope = this.createScope(scopeId);
    try {
      return await callback();
    } finally {
      this.exitScope();
    }
  }

  /**
   * 检查服务是否已注册
   */
  isRegistered(key: string): boolean {
    return this.services.has(key);
  }

  /**
   * 获取所有已注册的服务键
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * 获取服务定义
   */
  getServiceDefinition(key: string): ServiceDefinition | undefined {
    return this.services.get(key);
  }

  /**
   * 清理所有单例实例
   */
  clearSingletons(): void {
    this.singletonInstances.clear();
  }

  /**
   * 解析依赖数组
   */
  private resolveDependencies(dependencies: string[]): any[] {
    return dependencies.map(dep => this.resolve(dep));
  }

  /**
   * 验证依赖图是否存在循环依赖
   */
  validateDependencyGraph(): void {
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (key: string): void => {
      if (visiting.has(key)) {
        throw new Error(`Circular dependency detected: ${key}`);
      }

      if (visited.has(key)) {
        return;
      }

      visiting.add(key);

      const definition = this.services.get(key);
      if (definition && definition.dependencies) {
        definition.dependencies.forEach(dep => visit(dep));
      }

      visiting.delete(key);
      visited.add(key);
    };

    this.services.forEach((_, key) => visit(key));
  }
}

// 全局容器实例
export const container = new DIContainer();

// 装饰器支持
export function Injectable(key?: string) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    const serviceKey = key || constructor.name;
    container.registerSingleton(serviceKey, () => new constructor());
    return constructor;
  };
}

export function Inject(key: string) {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    // 这里可以添加元数据存储逻辑
    // 用于自动依赖注入
  };
}
