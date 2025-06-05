/**
 * 事件类型枚举
 */
export enum EventType {
  START = 'start',
  END = 'end',
  ERROR = 'error',
  TOOL_START = 'tool_start',
  TOOL_END = 'tool_end',
  AGENT_ACTION = 'agent_action',
  AGENT_OBSERVATION = 'agent_observation',
  LLM_NEW_TOKEN = 'llm_new_token',
  MEMORY_UPDATE = 'memory_update',
}

/**
 * 事件接口
 */
export interface Event {
  /**
   * 事件类型
   */
  type: EventType | string;
  
  /**
   * 事件时间戳
   */
  timestamp: number;
  
  /**
   * 运行ID
   */
  runId: string;
  
  /**
   * 事件数据
   */
  data: any;
}

/**
 * 事件处理器接口
 */
export interface EventHandler {
  /**
   * 处理事件
   * @param event 事件对象
   */
  handleEvent(event: Event): void | Promise<void>;
}

/**
 * 可观察接口
 */
export interface Observable {
  /**
   * 添加事件处理器
   * @param handler 事件处理器
   */
  addHandler(handler: EventHandler): void;
  
  /**
   * 移除事件处理器
   * @param handler 事件处理器
   */
  removeHandler(handler: EventHandler): void;
  
  /**
   * 通知所有处理器
   * @param event 事件对象
   */
  notify(event: Event): void | Promise<void>;
}

/**
 * 事件总线类
 * 实现事件的发布和订阅
 */
export class EventBus implements Observable {
  /**
   * 事件处理器集合
   */
  private handlers: Set<EventHandler> = new Set();
  
  /**
   * 按事件类型分组的处理器
   */
  private typeHandlers: Map<string, Set<EventHandler>> = new Map();
  
  /**
   * 添加事件处理器
   * @param handler 事件处理器
   * @param eventTypes 要处理的事件类型，如果不指定则处理所有事件
   */
  addHandler(handler: EventHandler, eventTypes?: Array<EventType | string>): void {
    if (!eventTypes) {
      // 处理所有事件
      this.handlers.add(handler);
      return;
    }
    
    // 处理特定类型的事件
    for (const type of eventTypes) {
      if (!this.typeHandlers.has(type)) {
        this.typeHandlers.set(type, new Set());
      }
      this.typeHandlers.get(type)!.add(handler);
    }
  }
  
  /**
   * 移除事件处理器
   * @param handler 事件处理器
   * @param eventTypes 要移除的事件类型，如果不指定则移除所有事件
   */
  removeHandler(handler: EventHandler, eventTypes?: Array<EventType | string>): void {
    if (!eventTypes) {
      // 移除所有事件的处理
      this.handlers.delete(handler);
      
      // 从所有类型处理器中移除
      for (const handlers of this.typeHandlers.values()) {
        handlers.delete(handler);
      }
      
      return;
    }
    
    // 移除特定类型的事件处理
    for (const type of eventTypes) {
      const handlers = this.typeHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    }
  }
  
  /**
   * 通知所有处理器
   * @param event 事件对象
   */
  async notify(event: Event): Promise<void> {
    // 获取该事件类型的处理器
    const typeHandlers = this.typeHandlers.get(event.type) || new Set<EventHandler>();
    
    // 合并通用处理器和类型处理器
    const allHandlers = new Set([...this.handlers, ...typeHandlers]);
    
    // 调用所有处理器
    const promises: Array<void | Promise<void>> = [];
    
    for (const handler of allHandlers) {
      try {
        const result = handler.handleEvent(event);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        console.error('Error in event handler:', error);
      }
    }
    
    // 等待所有异步处理器完成
    await Promise.all(promises);
  }
  
  /**
   * 发布事件
   * @param type 事件类型
   * @param runId 运行ID
   * @param data 事件数据
   */
  async emit(type: EventType | string, runId: string, data: any): Promise<void> {
    const event: Event = {
      type,
      timestamp: Date.now(),
      runId,
      data,
    };
    
    await this.notify(event);
  }
  
  /**
   * 清空所有处理器
   */
  clear(): void {
    this.handlers.clear();
    this.typeHandlers.clear();
  }
}

/**
 * 默认事件总线实例
 */
export const eventBus = new EventBus();