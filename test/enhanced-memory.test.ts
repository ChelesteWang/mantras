import { SessionMemory, PersistentMemoryManager, MemoryEntry, ConversationEntry, ContextMemory } from '../src/memory';

describe('Enhanced SessionMemory', () => {
  let memory: SessionMemory;

  beforeEach(() => {
    memory = new SessionMemory();
  });

  describe('Basic functionality', () => {
    it('should set and get a value', () => {
      memory.set('name', 'John Doe');
      expect(memory.get('name')).toBe('John Doe');
    });

    it('should return undefined for a non-existent key', () => {
      expect(memory.get('nonexistent')).toBeUndefined();
    });

    it('should correctly check for the existence of a key', () => {
      memory.set('age', 30);
      expect(memory.has('age')).toBe(true);
      expect(memory.has('nonexistent')).toBe(false);
    });

    it('should delete a key-value pair', () => {
      memory.set('city', 'New York');
      expect(memory.has('city')).toBe(true);
      const result = memory.delete('city');
      expect(result).toBe(true);
      expect(memory.has('city')).toBe(false);
    });

    it('should clear all data', () => {
      memory.set('a', 1);
      memory.addConversation('user', 'Hello');
      memory.addMemory('fact', 'Important fact', 8);
      
      memory.clear();
      
      expect(memory.has('a')).toBe(false);
      expect(memory.getConversationHistory()).toHaveLength(0);
      expect(memory.getMemoryStats().totalMemories).toBe(0);
    });
  });

  describe('Conversation history', () => {
    it('should add and retrieve conversation history', () => {
      memory.addConversation('user', 'Hello, how are you?');
      memory.addConversation('assistant', 'I am doing well, thank you!');
      memory.addConversation('user', 'What can you help me with?');

      const history = memory.getConversationHistory();
      expect(history).toHaveLength(3);
      expect(history[0].role).toBe('user');
      expect(history[0].content).toBe('Hello, how are you?');
      expect(history[1].role).toBe('assistant');
      expect(history[2].role).toBe('user');
    });

    it('should limit conversation history', () => {
      // Add more than the limit
      for (let i = 0; i < 150; i++) {
        memory.addConversation('user', `Message ${i}`);
      }

      const history = memory.getConversationHistory();
      expect(history.length).toBeLessThanOrEqual(100);
      expect(history[history.length - 1].content).toBe('Message 149');
    });

    it('should get limited conversation history', () => {
      for (let i = 0; i < 10; i++) {
        memory.addConversation('user', `Message ${i}`);
      }

      const recentHistory = memory.getConversationHistory(3);
      expect(recentHistory).toHaveLength(3);
      expect(recentHistory[0].content).toBe('Message 7');
      expect(recentHistory[2].content).toBe('Message 9');
    });

    it('should get recent conversations by time', () => {
      // Add old message first
      memory.addConversation('user', 'Old message');
      
      // Wait a bit to ensure different timestamps
      const now = Date.now();
      
      // Mock the old conversation to be older
      const history = memory.getConversationHistory();
      if (history.length > 0) {
        // Manually set old timestamp (1 hour ago)
        (history[0] as any).timestamp = new Date(now - 60 * 60 * 1000);
      }
      
      // Add recent message
      memory.addConversation('user', 'Recent message');

      const recentConversations = memory.getRecentConversations(30); // Last 30 minutes
      expect(recentConversations).toHaveLength(1);
      expect(recentConversations[0].content).toBe('Recent message');
    });
  });

  describe('Memory entries', () => {
    it('should add and retrieve memory entries', () => {
      const memoryId = memory.addMemory('fact', 'The sky is blue', 7, ['color', 'nature']);
      
      expect(memoryId).toBeDefined();
      expect(memoryId).toMatch(/^mem_/);
      
      const stats = memory.getMemoryStats();
      expect(stats.totalMemories).toBe(1);
    });

    it('should get memories by type', () => {
      memory.addMemory('fact', 'Fact 1', 5);
      memory.addMemory('preference', 'Preference 1', 6);
      memory.addMemory('fact', 'Fact 2', 7);

      const facts = memory.getMemoriesByType('fact');
      expect(facts).toHaveLength(2);
      expect(facts.every(m => m.type === 'fact')).toBe(true);
    });

    it('should get memories by tag', () => {
      memory.addMemory('fact', 'Tagged fact', 5, ['important', 'science']);
      memory.addMemory('task', 'Tagged task', 6, ['important', 'work']);
      memory.addMemory('fact', 'Untagged fact', 7);

      const importantMemories = memory.getMemoriesByTag('important');
      expect(importantMemories).toHaveLength(2);
    });

    it('should get important memories', () => {
      memory.addMemory('fact', 'Low importance', 3);
      memory.addMemory('fact', 'Medium importance', 6);
      memory.addMemory('fact', 'High importance', 9);

      const importantMemories = memory.getImportantMemories(7);
      expect(importantMemories).toHaveLength(1);
      expect(importantMemories[0].content).toBe('High importance');
    });

    it('should search memories', () => {
      memory.addMemory('fact', 'JavaScript is a programming language', 7, ['programming']);
      memory.addMemory('fact', 'Python is also a programming language', 8, ['programming']);
      memory.addMemory('task', 'Learn TypeScript', 6, ['learning']);

      const results = memory.searchMemories('programming');
      expect(results).toHaveLength(2); // 2 content matches (both have 'programming' in content and tags)
    });

    it('should sort memories by importance', () => {
      memory.addMemory('fact', 'Low', 3);
      memory.addMemory('fact', 'High', 9);
      memory.addMemory('fact', 'Medium', 6);

      const stats = memory.getMemoryStats();
      expect(stats.totalMemories).toBe(3);
      
      // Memories should be sorted by importance (high to low)
      // Use getImportantMemories with minImportance 1 to get all memories
      const allMemories = memory.getImportantMemories(1);
      expect(allMemories).toHaveLength(3);
      expect(allMemories[0].importance).toBe(9);
      expect(allMemories[1].importance).toBe(6);
      expect(allMemories[2].importance).toBe(3);
    });
  });

  describe('Context memory', () => {
    it('should update and get context', () => {
      const updates = {
        currentTopic: 'AI Development',
        activeProjects: ['Project A', 'Project B']
      };

      memory.updateContext(updates);
      const context = memory.getContext();

      expect(context.currentTopic).toBe('AI Development');
      expect(context.activeProjects).toEqual(['Project A', 'Project B']);
    });

    it('should set current topic', () => {
      memory.setCurrentTopic('Machine Learning');
      
      const context = memory.getContext();
      expect(context.currentTopic).toBe('Machine Learning');
      
      // Should also create a memory entry
      const topicMemories = memory.getMemoriesByTag('topic');
      expect(topicMemories).toHaveLength(1);
    });

    it('should add active projects', () => {
      memory.addActiveProject('Project Alpha');
      memory.addActiveProject('Project Beta');
      memory.addActiveProject('Project Alpha'); // Duplicate should not be added

      const context = memory.getContext();
      expect(context.activeProjects).toEqual(['Project Alpha', 'Project Beta']);
    });

    it('should manage recent files', () => {
      memory.addRecentFile('/path/to/file1.ts');
      memory.addRecentFile('/path/to/file2.ts');
      memory.addRecentFile('/path/to/file1.ts'); // Should move to front

      const context = memory.getContext();
      expect(context.recentFiles[0]).toBe('/path/to/file1.ts');
      expect(context.recentFiles[1]).toBe('/path/to/file2.ts');
    });

    it('should manage preferences', () => {
      memory.setPreference('theme', 'dark');
      memory.setPreference('language', 'typescript');

      expect(memory.getPreference('theme')).toBe('dark');
      expect(memory.getPreference('language')).toBe('typescript');
      
      const context = memory.getContext();
      expect(context.preferences.theme).toBe('dark');
    });
  });

  describe('Smart memory retrieval', () => {
    beforeEach(() => {
      memory.addMemory('fact', 'TypeScript is a superset of JavaScript', 8, ['typescript', 'programming']);
      memory.addMemory('task', 'Learn React hooks', 7, ['react', 'learning']);
      memory.addMemory('preference', 'Prefer functional programming', 6, ['programming', 'style']);
      memory.addMemory('context', { topic: 'web development' }, 5, ['web', 'development']);
    });

    it('should get relevant memories based on context', () => {
      const relevantMemories = memory.getRelevantMemories('typescript programming', 3);
      
      expect(relevantMemories.length).toBeGreaterThan(0);
      expect(relevantMemories.length).toBeLessThanOrEqual(3);
      
      // Should prioritize TypeScript-related memory
      expect(relevantMemories[0].tags).toContain('typescript');
    });

    it('should consider importance in relevance scoring', () => {
      memory.addMemory('fact', 'High importance typescript fact', 10, ['typescript']);
      memory.addMemory('fact', 'Low importance typescript fact', 2, ['typescript']);

      const relevantMemories = memory.getRelevantMemories('typescript', 2);
      
      // Higher importance should come first
      expect(relevantMemories[0].importance).toBeGreaterThan(relevantMemories[1].importance);
    });
  });

  describe('Memory statistics', () => {
    it('should provide comprehensive memory statistics', () => {
      memory.addMemory('fact', 'Fact 1', 5);
      memory.addMemory('fact', 'Fact 2', 7);
      memory.addMemory('task', 'Task 1', 6);
      memory.addConversation('user', 'Hello');

      const stats = memory.getMemoryStats();

      expect(stats.totalMemories).toBe(3);
      expect(stats.conversationCount).toBe(1);
      expect(stats.memoryByType.fact).toBe(2);
      expect(stats.memoryByType.task).toBe(1);
      expect(stats.averageImportance).toBe(6);
      expect(stats.oldestMemory).toBeDefined();
      expect(stats.newestMemory).toBeDefined();
    });
  });

  describe('Memory export and import', () => {
    it('should export and import memory data', () => {
      memory.set('key', 'value');
      memory.addConversation('user', 'Hello');
      memory.addMemory('fact', 'Important fact', 8);
      memory.setCurrentTopic('Testing');

      const exported = memory.exportMemory();
      
      expect(exported.memory.key).toBe('value');
      expect(exported.conversationHistory).toHaveLength(1);
      expect(exported.memoryEntries).toHaveLength(2); // fact + topic memory
      expect(exported.contextMemory.currentTopic).toBe('Testing');

      const newMemory = new SessionMemory();
      newMemory.importMemory(exported);

      expect(newMemory.get('key')).toBe('value');
      expect(newMemory.getConversationHistory()).toHaveLength(1);
      expect(newMemory.getMemoryStats().totalMemories).toBe(2);
      expect(newMemory.getContext().currentTopic).toBe('Testing');
    });
  });

  describe('Memory cleanup', () => {
    it('should cleanup old memories', () => {
      // Add some old memories (simulate by manipulating timestamps)
      const oldMemoryId = memory.addMemory('fact', 'Old fact', 5);
      const importantOldMemoryId = memory.addMemory('fact', 'Important old fact', 9);
      const recentMemoryId = memory.addMemory('fact', 'Recent fact', 6);

      // Simulate old timestamps
      const memoryStats = memory.getMemoryStats();
      
      const cleanedCount = memory.cleanupOldMemories(1); // Keep only 1 day
      
      // Important memories should be preserved regardless of age
      const remainingMemories = memory.getImportantMemories(1);
      expect(remainingMemories.some(m => m.importance === 9)).toBe(true);
    });
  });
});

describe('PersistentMemoryManager', () => {
  let manager: PersistentMemoryManager;

  beforeEach(() => {
    manager = new PersistentMemoryManager();
  });

  it('should create and manage session memories', () => {
    const sessionId1 = 'session1';
    const sessionId2 = 'session2';

    const memory1 = manager.getSessionMemory(sessionId1);
    const memory2 = manager.getSessionMemory(sessionId2);

    expect(memory1).toBeDefined();
    expect(memory2).toBeDefined();
    expect(memory1).not.toBe(memory2);

    // Getting the same session should return the same memory
    const memory1Again = manager.getSessionMemory(sessionId1);
    expect(memory1Again).toBe(memory1);
  });

  it('should provide access to global memory', () => {
    const globalMemory = manager.getGlobalMemory();
    expect(globalMemory).toBeDefined();
    
    // Should always return the same instance
    const globalMemoryAgain = manager.getGlobalMemory();
    expect(globalMemoryAgain).toBe(globalMemory);
  });

  it('should transfer important memories to global', () => {
    const sessionId = 'test-session';
    const sessionMemory = manager.getSessionMemory(sessionId);
    const globalMemory = manager.getGlobalMemory();

    // Add memories to session
    sessionMemory.addMemory('fact', 'Important session fact', 9, ['important']);
    sessionMemory.addMemory('fact', 'Unimportant session fact', 3, ['unimportant']);

    const initialGlobalCount = globalMemory.getMemoryStats().totalMemories;

    // Transfer important memories (importance >= 7)
    manager.transferToGlobal(sessionId, 7);

    const finalGlobalCount = globalMemory.getMemoryStats().totalMemories;
    expect(finalGlobalCount).toBe(initialGlobalCount + 1);

    // Check that the important memory was transferred
    const transferredMemories = globalMemory.getMemoriesByTag('transferred');
    expect(transferredMemories).toHaveLength(1);
    expect(transferredMemories[0].content).toBe('Important session fact');
  });

  it('should release sessions and optionally transfer memories', () => {
    const sessionId = 'test-session';
    const sessionMemory = manager.getSessionMemory(sessionId);
    
    sessionMemory.addMemory('fact', 'Important fact', 9);
    
    expect(manager.getActiveSessionCount()).toBe(1);
    expect(manager.getAllSessionIds()).toContain(sessionId);

    // Release with transfer
    const released = manager.releaseSession(sessionId, true);
    
    expect(released).toBe(true);
    expect(manager.getActiveSessionCount()).toBe(0);
    expect(manager.getAllSessionIds()).not.toContain(sessionId);

    // Check that memory was transferred to global
    const globalMemory = manager.getGlobalMemory();
    const transferredMemories = globalMemory.getMemoriesByTag('transferred');
    expect(transferredMemories.length).toBeGreaterThan(0);
  });

  it('should track active sessions', () => {
    expect(manager.getActiveSessionCount()).toBe(0);
    expect(manager.getAllSessionIds()).toEqual([]);

    manager.getSessionMemory('session1');
    manager.getSessionMemory('session2');
    manager.getSessionMemory('session3');

    expect(manager.getActiveSessionCount()).toBe(3);
    expect(manager.getAllSessionIds()).toEqual(['session1', 'session2', 'session3']);

    manager.releaseSession('session2');

    expect(manager.getActiveSessionCount()).toBe(2);
    expect(manager.getAllSessionIds()).toEqual(['session1', 'session3']);
  });
});