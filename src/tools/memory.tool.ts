import { ActionableTool } from '../types';
import { z } from 'zod';
import { PersonaSummoner } from '../core/personas/persona-summoner';

// 记忆管理工具
export class MemoryManagementTool implements ActionableTool {
  id = 'memory-management';
  type = 'tool' as const;
  name = 'Memory Management';
  description = 'Manage agent memory including conversations, context, and long-term memories';
  
  parameters = z.object({
    action: z.enum(['add_memory', 'search_memories', 'get_stats', 'add_conversation', 'get_conversation_history', 'set_context', 'get_context']),
    sessionId: z.string().optional(),
    memoryType: z.enum(['conversation', 'context', 'preference', 'fact', 'task']).optional(),
    content: z.any().optional(),
    importance: z.number().min(1).max(10).optional(),
    tags: z.array(z.string()).optional(),
    query: z.string().optional(),
    role: z.enum(['user', 'assistant', 'system']).optional(),
    limit: z.number().optional(),
    contextUpdates: z.record(z.any()).optional(),
    metadata: z.record(z.any()).optional()
  });

  constructor(private personaSummoner: PersonaSummoner) {}

  async execute(args: z.infer<typeof this.parameters>): Promise<any> {
    const { action, sessionId, memoryType, content, importance, tags, query, role, limit, contextUpdates, metadata } = args;

    switch (action) {
      case 'add_memory':
        if (!sessionId || !memoryType || content === undefined) {
          throw new Error('sessionId, memoryType, and content are required for add_memory action');
        }
        return this.addMemory(sessionId, memoryType, content, importance || 5, tags || [], metadata);

      case 'search_memories':
        if (!query) {
          throw new Error('query is required for search_memories action');
        }
        return this.searchMemories(query, sessionId);

      case 'get_stats':
        return this.getMemoryStats(sessionId);

      case 'add_conversation':
        if (!sessionId || !role || !content) {
          throw new Error('sessionId, role, and content are required for add_conversation action');
        }
        return this.addConversation(sessionId, role, content, metadata);

      case 'get_conversation_history':
        if (!sessionId) {
          throw new Error('sessionId is required for get_conversation_history action');
        }
        return this.getConversationHistory(sessionId, limit);

      case 'set_context':
        if (!sessionId || !contextUpdates) {
          throw new Error('sessionId and contextUpdates are required for set_context action');
        }
        return this.setContext(sessionId, contextUpdates);

      case 'get_context':
        if (!sessionId) {
          throw new Error('sessionId is required for get_context action');
        }
        return this.getContext(sessionId);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private addMemory(sessionId: string, type: any, content: any, importance: number, tags: string[], metadata?: Record<string, any>): any {
    const session = this.personaSummoner.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const memoryId = session.memory.addMemory(type, content, importance, tags, metadata);
    return {
      success: true,
      memoryId,
      message: `Memory added to session ${sessionId}`
    };
  }

  private searchMemories(query: string, sessionId?: string): any {
    if (sessionId) {
      const session = this.personaSummoner.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }
      return {
        sessionId,
        memories: session.memory.searchMemories(query)
      };
    } else {
      return {
        allSessions: true,
        memories: this.personaSummoner.searchMemoriesAcrossSessions(query)
      };
    }
  }

  private getMemoryStats(sessionId?: string): any {
    if (sessionId) {
      const session = this.personaSummoner.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }
      return {
        sessionId,
        stats: session.memory.getMemoryStats()
      };
    } else {
      return this.personaSummoner.getMemoryStatistics();
    }
  }

  private addConversation(sessionId: string, role: 'user' | 'assistant' | 'system', content: string, metadata?: Record<string, any>): any {
    this.personaSummoner.addConversationToSession(sessionId, role, content, metadata);
    return {
      success: true,
      message: `Conversation added to session ${sessionId}`
    };
  }

  private getConversationHistory(sessionId: string, limit?: number): any {
    const history = this.personaSummoner.getSessionConversationHistory(sessionId, limit);
    return {
      sessionId,
      conversationHistory: history
    };
  }

  private setContext(sessionId: string, contextUpdates: Record<string, any>): any {
    const session = this.personaSummoner.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.memory.updateContext(contextUpdates);
    
    // 为重要的上下文更新添加记忆
    Object.entries(contextUpdates).forEach(([key, value]) => {
      session.memory.addMemory('context', { [key]: value }, 6, ['context', key]);
    });

    return {
      success: true,
      message: `Context updated for session ${sessionId}`,
      updatedContext: session.memory.getContext()
    };
  }

  private getContext(sessionId: string): any {
    const session = this.personaSummoner.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    return {
      sessionId,
      context: session.memory.getContext()
    };
  }
}

// 记忆分析工具
export class MemoryAnalysisTool implements ActionableTool {
  id = 'memory-analysis';
  type = 'tool' as const;
  name = 'Memory Analysis';
  description = 'Analyze and provide insights about agent memory patterns and content';
  
  parameters = z.object({
    action: z.enum(['analyze_patterns', 'get_insights', 'find_connections', 'memory_timeline']),
    sessionId: z.string().optional(),
    timeRange: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional(),
    minImportance: z.number().min(1).max(10).optional(),
    tags: z.array(z.string()).optional()
  });

  constructor(private personaSummoner: PersonaSummoner) {}

  async execute(args: z.infer<typeof this.parameters>): Promise<any> {
    const { action, sessionId, timeRange, minImportance, tags } = args;

    switch (action) {
      case 'analyze_patterns':
        return this.analyzePatterns(sessionId, timeRange);

      case 'get_insights':
        return this.getInsights(sessionId, minImportance);

      case 'find_connections':
        return this.findConnections(sessionId, tags);

      case 'memory_timeline':
        return this.getMemoryTimeline(sessionId, timeRange);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private analyzePatterns(sessionId?: string, timeRange?: { start?: string; end?: string }): any {
    const stats = sessionId 
      ? this.getSessionStats(sessionId)
      : this.personaSummoner.getMemoryStatistics();

    const patterns = {
      mostCommonTypes: this.getMostCommonTypes(stats),
      averageImportance: this.getAverageImportance(stats),
      activityPatterns: this.getActivityPatterns(stats),
      topTags: this.getTopTags(sessionId)
    };

    return {
      sessionId: sessionId || 'all',
      timeRange,
      patterns
    };
  }

  private getInsights(sessionId?: string, minImportance: number = 7): any {
    const memories = sessionId 
      ? this.getSessionMemories(sessionId, minImportance)
      : this.getAllImportantMemories(minImportance);

    const insights = {
      keyTopics: this.extractKeyTopics(memories),
      importantFacts: this.extractImportantFacts(memories),
      preferences: this.extractPreferences(memories),
      recommendations: this.generateRecommendations(memories)
    };

    return {
      sessionId: sessionId || 'all',
      minImportance,
      insights
    };
  }

  private findConnections(sessionId?: string, tags?: string[]): any {
    const memories = sessionId 
      ? this.getSessionMemoriesByTags(sessionId, tags)
      : this.getAllMemoriesByTags(tags);

    const connections = this.analyzeConnections(memories);

    return {
      sessionId: sessionId || 'all',
      tags,
      connections
    };
  }

  private getMemoryTimeline(sessionId?: string, timeRange?: { start?: string; end?: string }): any {
    const memories = sessionId 
      ? this.getSessionMemoriesInRange(sessionId, timeRange)
      : this.getAllMemoriesInRange(timeRange);

    const timeline = memories
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(memory => ({
        timestamp: memory.timestamp,
        type: memory.type,
        importance: memory.importance,
        tags: memory.tags,
        summary: this.summarizeMemory(memory)
      }));

    return {
      sessionId: sessionId || 'all',
      timeRange,
      timeline
    };
  }

  // Helper methods
  private getSessionStats(sessionId: string): any {
    const session = this.personaSummoner.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return session.memory.getMemoryStats();
  }

  private getSessionMemories(sessionId: string, minImportance: number): any[] {
    const session = this.personaSummoner.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return session.memory.getImportantMemories(minImportance);
  }

  private getAllImportantMemories(minImportance: number): any[] {
    const globalMemory = this.personaSummoner.getMemoryManager().getGlobalMemory();
    return globalMemory.getImportantMemories(minImportance);
  }

  private getSessionMemoriesByTags(sessionId: string, tags?: string[]): any[] {
    const session = this.personaSummoner.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    if (!tags || tags.length === 0) {
      return session.memory.getMemoryStats().totalMemories > 0 ? [] : [];
    }

    return tags.flatMap(tag => session.memory.getMemoriesByTag(tag));
  }

  private getAllMemoriesByTags(tags?: string[]): any[] {
    if (!tags || tags.length === 0) return [];
    
    const globalMemory = this.personaSummoner.getMemoryManager().getGlobalMemory();
    return tags.flatMap(tag => globalMemory.getMemoriesByTag(tag));
  }

  private getSessionMemoriesInRange(sessionId: string, timeRange?: { start?: string; end?: string }): any[] {
    // Implementation would filter memories by time range
    return this.getSessionMemories(sessionId, 1);
  }

  private getAllMemoriesInRange(timeRange?: { start?: string; end?: string }): any[] {
    // Implementation would filter memories by time range
    return this.getAllImportantMemories(1);
  }

  private getMostCommonTypes(stats: any): any {
    return stats.memoryByType || {};
  }

  private getAverageImportance(stats: any): number {
    return stats.averageImportance || 0;
  }

  private getActivityPatterns(stats: any): any {
    return {
      totalMemories: stats.totalMemories || 0,
      conversationCount: stats.conversationCount || 0,
      timeSpan: stats.oldestMemory && stats.newestMemory 
        ? new Date(stats.newestMemory).getTime() - new Date(stats.oldestMemory).getTime()
        : 0
    };
  }

  private getTopTags(sessionId?: string): string[] {
    // Implementation would analyze tag frequency
    return [];
  }

  private extractKeyTopics(memories: any[]): string[] {
    // Implementation would extract key topics from memory content
    return memories
      .filter(m => m.type === 'context' && m.content.topic)
      .map(m => m.content.topic);
  }

  private extractImportantFacts(memories: any[]): any[] {
    return memories.filter(m => m.type === 'fact');
  }

  private extractPreferences(memories: any[]): any[] {
    return memories.filter(m => m.type === 'preference');
  }

  private generateRecommendations(memories: any[]): string[] {
    const recommendations = [];
    
    if (memories.length > 50) {
      recommendations.push('Consider cleaning up old memories to improve performance');
    }
    
    const lowImportanceCount = memories.filter(m => m.importance < 5).length;
    if (lowImportanceCount > memories.length * 0.5) {
      recommendations.push('Many memories have low importance scores - consider reviewing importance criteria');
    }
    
    return recommendations;
  }

  private analyzeConnections(memories: any[]): any {
    // Implementation would find connections between memories
    return {
      sharedTags: this.findSharedTags(memories),
      relatedContent: this.findRelatedContent(memories),
      temporalConnections: this.findTemporalConnections(memories)
    };
  }

  private findSharedTags(memories: any[]): any {
    const tagCounts: Record<string, number> = {};
    memories.forEach(memory => {
      memory.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return tagCounts;
  }

  private findRelatedContent(memories: any[]): any[] {
    // Implementation would find content similarities
    return [];
  }

  private findTemporalConnections(memories: any[]): any[] {
    // Implementation would find time-based patterns
    return [];
  }

  private summarizeMemory(memory: any): string {
    if (typeof memory.content === 'string') {
      return memory.content.substring(0, 100) + (memory.content.length > 100 ? '...' : '');
    }
    return JSON.stringify(memory.content).substring(0, 100) + '...';
  }
}