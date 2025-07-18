export class SessionMemory {
  private memory: Map<string, any> = new Map();

  set(key: string, value: any): void {
    this.memory.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.memory.get(key) as T;
  }

  has(key: string): boolean {
    return this.memory.has(key);
  }

  clear(): void {
    this.memory.clear();
  }

  delete(key: string): boolean {
    return this.memory.delete(key);
  }
}