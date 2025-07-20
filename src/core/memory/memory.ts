// 记忆条目接口
export interface MemoryEntry {
  id: string;
  timestamp: Date;
  type: 'conversation' | 'context' | 'preference' | 'fact' | 'task';
  content: any;
  importance: number; // 1-10，重要性评分
  tags: string[];
  metadata?: Record<string, any>;
}

// 对话记录接口
export interface ConversationEntry {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// 上下文记忆接口
export interface ContextMemory {
  currentTopic?: string;
  activeProjects: string[];
  recentFiles: string[];
  workingDirectory?: string;
  preferences: Record<string, any>;
}

// 增强的会话记忆类
export class SessionMemory {
  private memory: Map<string, any> = new Map();
  private conversationHistory: ConversationEntry[] = [];
  private memoryEntries: MemoryEntry[] = [];
  private contextMemory: ContextMemory = {
    activeProjects: [],
    recentFiles: [],
    preferences: {}
  };
  private maxConversationHistory = 100; // 最大对话历史条数
  private maxMemoryEntries = 500; // 最大记忆条目数

  // 基础键值对操作
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
    this.conversationHistory = [];
    this.memoryEntries = [];
    this.contextMemory = {
      activeProjects: [],
      recentFiles: [],
      preferences: {}
    };
  }

  delete(key: string): boolean {
    return this.memory.delete(key);
  }

  // 对话历史管理
  addConversation(role: 'user' | 'assistant' | 'system', content: string, metadata?: Record<string, any>): void {
    const entry: ConversationEntry = {
      role,
      content,
      timestamp: new Date(),
      metadata
    };
    
    this.conversationHistory.push(entry);
    
    // 保持历史记录在限制范围内
    if (this.conversationHistory.length > this.maxConversationHistory) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxConversationHistory);
    }
  }

  getConversationHistory(limit?: number): ConversationEntry[] {
    if (limit) {
      return this.conversationHistory.slice(-limit);
    }
    return [...this.conversationHistory];
  }

  getRecentConversations(minutes: number = 30): ConversationEntry[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.conversationHistory.filter(entry => entry.timestamp > cutoff);
  }

  // 记忆条目管理
  addMemory(
    type: MemoryEntry['type'],
    content: any,
    importance: number = 5,
    tags: string[] = [],
    metadata?: Record<string, any>
  ): string {
    const id = this.generateId();
    const entry: MemoryEntry = {
      id,
      timestamp: new Date(),
      type,
      content,
      importance: Math.max(1, Math.min(10, importance)), // 确保在1-10范围内
      tags,
      metadata
    };
    
    this.memoryEntries.push(entry);
    
    // 按重要性排序并保持在限制范围内
    this.memoryEntries.sort((a, b) => b.importance - a.importance);
    if (this.memoryEntries.length > this.maxMemoryEntries) {
      this.memoryEntries = this.memoryEntries.slice(0, this.maxMemoryEntries);
    }
    
    return id;
  }

  getMemoriesByType(type: MemoryEntry['type']): MemoryEntry[] {
    return this.memoryEntries.filter(entry => entry.type === type);
  }

  getMemoriesByTag(tag: string): MemoryEntry[] {
    return this.memoryEntries.filter(entry => entry.tags.includes(tag));
  }

  getImportantMemories(minImportance: number = 7): MemoryEntry[] {
    return this.memoryEntries.filter(entry => entry.importance >= minImportance);
  }

  searchMemories(query: string): MemoryEntry[] {
    const queryLower = query.toLowerCase();
    const results = new Set<MemoryEntry>(); // 使用 Set 避免重复
    
    this.memoryEntries.forEach(entry => {
      const contentStr = JSON.stringify(entry.content).toLowerCase();
      const tagsStr = entry.tags.join(' ').toLowerCase();
      
      // 内容匹配或标签匹配
      if (contentStr.includes(queryLower) || tagsStr.includes(queryLower)) {
        results.add(entry);
      }
    });
    
    return Array.from(results);
  }

  // 上下文记忆管理
  updateContext(updates: Partial<ContextMemory>): void {
    this.contextMemory = { ...this.contextMemory, ...updates };
  }

  getContext(): ContextMemory {
    return { ...this.contextMemory };
  }

  setCurrentTopic(topic: string): void {
    this.contextMemory.currentTopic = topic;
    this.addMemory('context', { topic }, 6, ['topic', 'context']);
  }

  addActiveProject(project: string): void {
    if (!this.contextMemory.activeProjects.includes(project)) {
      this.contextMemory.activeProjects.push(project);
      this.addMemory('context', { activeProject: project }, 7, ['project', 'active']);
    }
  }

  addRecentFile(filePath: string): void {
    // 移除重复项并添加到开头
    this.contextMemory.recentFiles = this.contextMemory.recentFiles.filter(f => f !== filePath);
    this.contextMemory.recentFiles.unshift(filePath);
    
    // 保持最近文件列表在合理范围内
    if (this.contextMemory.recentFiles.length > 20) {
      this.contextMemory.recentFiles = this.contextMemory.recentFiles.slice(0, 20);
    }
    
    this.addMemory('context', { recentFile: filePath }, 4, ['file', 'recent']);
  }

  setPreference(key: string, value: any): void {
    this.contextMemory.preferences[key] = value;
    this.addMemory('preference', { [key]: value }, 8, ['preference', key]);
  }

  getPreference(key: string): any {
    return this.contextMemory.preferences[key];
  }

  // 智能记忆检索
  getRelevantMemories(context: string, limit: number = 10): MemoryEntry[] {
    const contextLower = context.toLowerCase();
    
    // 计算相关性分数
    const scoredMemories = this.memoryEntries.map(entry => {
      let score = entry.importance; // 基础分数为重要性
      
      // 内容匹配加分
      const contentStr = JSON.stringify(entry.content).toLowerCase();
      if (contentStr.includes(contextLower)) {
        score += 5;
      }
      
      // 标签匹配加分
      const matchingTags = entry.tags.filter(tag => 
        contextLower.includes(tag.toLowerCase()) || tag.toLowerCase().includes(contextLower)
      );
      score += matchingTags.length * 2;
      
      // 时间衰减（越新的记忆分数越高）
      const daysSinceCreation = (Date.now() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 5 - daysSinceCreation * 0.1);
      
      return { entry, score };
    });
    
    // 按分数排序并返回前N个
    return scoredMemories
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.entry);
  }

  // 记忆统计
  getMemoryStats(): {
    totalMemories: number;
    conversationCount: number;
    memoryByType: Record<string, number>;
    averageImportance: number;
    oldestMemory?: Date;
    newestMemory?: Date;
  } {
    const memoryByType: Record<string, number> = {};
    let totalImportance = 0;
    
    this.memoryEntries.forEach(entry => {
      memoryByType[entry.type] = (memoryByType[entry.type] || 0) + 1;
      totalImportance += entry.importance;
    });
    
    const timestamps = this.memoryEntries.map(e => e.timestamp);
    
    return {
      totalMemories: this.memoryEntries.length,
      conversationCount: this.conversationHistory.length,
      memoryByType,
      averageImportance: this.memoryEntries.length > 0 ? totalImportance / this.memoryEntries.length : 0,
      oldestMemory: timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : undefined,
      newestMemory: timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : undefined
    };
  }

  // 记忆导出和导入
  exportMemory(): {
    memory: Record<string, any>;
    conversationHistory: ConversationEntry[];
    memoryEntries: MemoryEntry[];
    contextMemory: ContextMemory;
  } {
    return {
      memory: Object.fromEntries(this.memory),
      conversationHistory: [...this.conversationHistory],
      memoryEntries: [...this.memoryEntries],
      contextMemory: { ...this.contextMemory }
    };
  }

  importMemory(data: {
    memory?: Record<string, any>;
    conversationHistory?: ConversationEntry[];
    memoryEntries?: MemoryEntry[];
    contextMemory?: ContextMemory;
  }): void {
    if (data.memory) {
      this.memory = new Map(Object.entries(data.memory));
    }
    if (data.conversationHistory) {
      this.conversationHistory = data.conversationHistory.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    }
    if (data.memoryEntries) {
      this.memoryEntries = data.memoryEntries.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    }
    if (data.contextMemory) {
      this.contextMemory = { ...data.contextMemory };
    }
  }

  // 记忆清理
  cleanupOldMemories(daysToKeep: number = 30): number {
    const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const initialCount = this.memoryEntries.length;
    
    // 保留重要记忆（重要性 >= 8）和最近的记忆
    this.memoryEntries = this.memoryEntries.filter(entry => 
      entry.importance >= 8 || entry.timestamp > cutoff
    );
    
    return initialCount - this.memoryEntries.length;
  }

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 持久化记忆管理器
export class PersistentMemoryManager {
  private sessionMemories: Map<string, SessionMemory> = new Map();
  private globalMemory: SessionMemory = new SessionMemory();

  getSessionMemory(sessionId: string): SessionMemory {
    if (!this.sessionMemories.has(sessionId)) {
      this.sessionMemories.set(sessionId, new SessionMemory());
    }
    return this.sessionMemories.get(sessionId)!;
  }

  getGlobalMemory(): SessionMemory {
    return this.globalMemory;
  }

  transferToGlobal(sessionId: string, importance: number = 7): void {
    const sessionMemory = this.sessionMemories.get(sessionId);
    if (!sessionMemory) return;

    // 将重要记忆转移到全局记忆
    const importantMemories = sessionMemory.getImportantMemories(importance);
    importantMemories.forEach(memory => {
      this.globalMemory.addMemory(
        memory.type,
        memory.content,
        memory.importance,
        [...memory.tags, 'transferred'],
        { ...memory.metadata, originalSession: sessionId }
      );
    });
  }

  releaseSession(sessionId: string, transferImportant: boolean = true): boolean {
    if (transferImportant) {
      this.transferToGlobal(sessionId);
    }
    return this.sessionMemories.delete(sessionId);
  }

  getActiveSessionCount(): number {
    return this.sessionMemories.size;
  }

  getAllSessionIds(): string[] {
    return Array.from(this.sessionMemories.keys());
  }
}