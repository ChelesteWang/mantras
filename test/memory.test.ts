import { SessionMemory } from '../src/core/memory/memory';

describe('SessionMemory', () => {
  let memory: SessionMemory;

  beforeEach(() => {
    memory = new SessionMemory();
  });

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

  it('should return false when trying to delete a non-existent key', () => {
    const result = memory.delete('nonexistent');
    expect(result).toBe(false);
  });

  it('should clear all key-value pairs', () => {
    memory.set('a', 1);
    memory.set('b', 2);
    memory.clear();
    expect(memory.has('a')).toBe(false);
    expect(memory.has('b')).toBe(false);
  });

  it('should handle different data types', () => {
    const user = { id: 1, name: 'Jane' };
    memory.set('user', user);
    memory.set('numbers', [1, 2, 3]);
    memory.set('isActive', true);

    expect(memory.get('user')).toEqual(user);
    expect(memory.get('numbers')).toEqual([1, 2, 3]);
    expect(memory.get('isActive')).toBe(true);
  });
});