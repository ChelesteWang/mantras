/**
 * 任务状态枚举
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled',
}

/**
 * 任务优先级枚举
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * 任务接口定义
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dependencies: string[]; // 依赖的任务ID列表
  estimatedTime?: number; // 预估时间（分钟）
  actualTime?: number; // 实际时间（分钟）
  assignee?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * 执行计划接口定义
 */
export interface ExecutionPlan {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * 任务队列管理器
 */
export class TaskQueueManager {
  private tasks: Map<string, Task> = new Map();
  private plans: Map<string, ExecutionPlan> = new Map();
  private taskQueue: string[] = []; // 任务执行队列

  /**
   * 创建新任务
   */
  createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const task: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(task.id, task);
    this.updateTaskQueue();
    return task;
  }

  /**
   * 更新任务
   */
  updateTask(taskId: string, updates: Partial<Task>): Task | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date(),
    };

    // 状态变更时更新时间戳
    if (updates.status && updates.status !== task.status) {
      if (updates.status === TaskStatus.IN_PROGRESS) {
        updatedTask.startedAt = new Date();
      } else if (updates.status === TaskStatus.COMPLETED) {
        updatedTask.completedAt = new Date();
      }
    }

    this.tasks.set(taskId, updatedTask);
    this.updateTaskQueue();
    return updatedTask;
  }

  /**
   * 获取任务
   */
  getTask(taskId: string): Task | null {
    return this.tasks.get(taskId) || null;
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 删除任务
   */
  deleteTask(taskId: string): boolean {
    const deleted = this.tasks.delete(taskId);
    if (deleted) {
      this.updateTaskQueue();
    }
    return deleted;
  }

  /**
   * 创建执行计划
   */
  createExecutionPlan(
    planData: Omit<ExecutionPlan, 'id' | 'createdAt' | 'updatedAt'>
  ): ExecutionPlan {
    const plan: ExecutionPlan = {
      ...planData,
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 将计划中的任务添加到任务管理器
    plan.tasks.forEach(task => {
      this.tasks.set(task.id, task);
    });

    this.plans.set(plan.id, plan);
    this.updateTaskQueue();
    return plan;
  }

  /**
   * 获取执行计划
   */
  getExecutionPlan(planId: string): ExecutionPlan | null {
    return this.plans.get(planId) || null;
  }

  /**
   * 获取所有执行计划
   */
  getAllExecutionPlans(): ExecutionPlan[] {
    return Array.from(this.plans.values());
  }

  /**
   * 分解复杂任务为子任务
   */
  decomposeTask(description: string, _context?: string): Task[] {
    // 基于描述和上下文智能分解任务
    const subtasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    // 分析任务类型并生成相应的子任务
    if (description.toLowerCase().includes('debug') || description.toLowerCase().includes('调试')) {
      subtasks.push(
        {
          title: '问题分析',
          description: '分析和定位问题根源',
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          dependencies: [],
          tags: ['analysis', 'debugging'],
        },
        {
          title: '解决方案设计',
          description: '设计修复方案',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          dependencies: [],
          tags: ['design', 'debugging'],
        },
        {
          title: '实施修复',
          description: '实施修复方案',
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          dependencies: [],
          tags: ['implementation', 'debugging'],
        },
        {
          title: '测试验证',
          description: '验证修复效果',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          dependencies: [],
          tags: ['testing', 'verification'],
        }
      );
    } else if (
      description.toLowerCase().includes('implement') ||
      description.toLowerCase().includes('实现')
    ) {
      subtasks.push(
        {
          title: '需求分析',
          description: '分析功能需求和技术要求',
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          dependencies: [],
          tags: ['analysis', 'requirements'],
        },
        {
          title: '架构设计',
          description: '设计系统架构和接口',
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          dependencies: [],
          tags: ['architecture', 'design'],
        },
        {
          title: '核心实现',
          description: '实现核心功能逻辑',
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          dependencies: [],
          tags: ['implementation', 'core'],
        },
        {
          title: '测试编写',
          description: '编写单元测试和集成测试',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          dependencies: [],
          tags: ['testing', 'quality'],
        },
        {
          title: '文档更新',
          description: '更新相关文档',
          status: TaskStatus.PENDING,
          priority: TaskPriority.LOW,
          dependencies: [],
          tags: ['documentation'],
        }
      );
    } else {
      // 通用任务分解
      subtasks.push(
        {
          title: '任务分析',
          description: '分析任务要求和约束条件',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          dependencies: [],
          tags: ['analysis'],
        },
        {
          title: '方案设计',
          description: '设计实施方案',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          dependencies: [],
          tags: ['design'],
        },
        {
          title: '执行实施',
          description: '执行具体实施步骤',
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          dependencies: [],
          tags: ['implementation'],
        },
        {
          title: '结果验证',
          description: '验证执行结果',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          dependencies: [],
          tags: ['verification'],
        }
      );
    }

    // 设置依赖关系
    for (let i = 1; i < subtasks.length; i++) {
      subtasks[i].dependencies = [subtasks[i - 1].title];
    }

    return subtasks.map(subtask => this.createTask(subtask));
  }

  /**
   * 获取可执行的任务（没有未完成依赖的任务）
   */
  getExecutableTasks(): Task[] {
    return this.getAllTasks().filter(task => {
      if (task.status !== TaskStatus.PENDING) return false;

      // 检查所有依赖是否已完成
      return task.dependencies.every(depId => {
        const depTask = this.getTaskByTitle(depId) || this.getTask(depId);
        return depTask && depTask.status === TaskStatus.COMPLETED;
      });
    });
  }

  /**
   * 根据标题获取任务
   */
  private getTaskByTitle(title: string): Task | null {
    for (const task of this.tasks.values()) {
      if (task.title === title) return task;
    }
    return null;
  }

  /**
   * 更新任务队列
   */
  private updateTaskQueue(): void {
    const executableTasks = this.getExecutableTasks();

    // 按优先级和创建时间排序
    executableTasks.sort((a, b) => {
      const priorityOrder = {
        [TaskPriority.URGENT]: 4,
        [TaskPriority.HIGH]: 3,
        [TaskPriority.MEDIUM]: 2,
        [TaskPriority.LOW]: 1,
      };

      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    this.taskQueue = executableTasks.map(task => task.id);
  }

  /**
   * 获取任务队列
   */
  getTaskQueue(): Task[] {
    return this.taskQueue.map(id => this.getTask(id)!).filter(Boolean);
  }

  /**
   * 获取任务统计信息
   */
  getTaskStatistics(): {
    total: number;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
    executable: number;
    blocked: number;
  } {
    const tasks = this.getAllTasks();
    const byStatus = {} as Record<TaskStatus, number>;
    const byPriority = {} as Record<TaskPriority, number>;

    // 初始化计数器
    Object.values(TaskStatus).forEach(status => (byStatus[status] = 0));
    Object.values(TaskPriority).forEach(priority => (byPriority[priority] = 0));

    // 统计
    tasks.forEach(task => {
      byStatus[task.status]++;
      byPriority[task.priority]++;
    });

    return {
      total: tasks.length,
      byStatus,
      byPriority,
      executable: this.getExecutableTasks().length,
      blocked: tasks.filter(
        task => task.status === TaskStatus.PENDING && !this.getExecutableTasks().includes(task)
      ).length,
    };
  }
}

// 全局任务管理器实例
export const globalTaskManager = new TaskQueueManager();

/**
 * 增强的任务管理工具
 */
export class EnhancedTaskManagerTool {
  private taskManager: TaskQueueManager;

  constructor(taskManager: TaskQueueManager = globalTaskManager) {
    this.taskManager = taskManager;
  }

  /**
   * 创建执行计划（增强版）
   */
  async createExecutionPlan(input: {
    userRequest: string;
    includeContext?: boolean;
    autoDecompose?: boolean;
  }): Promise<{
    plan: ExecutionPlan;
    recommendations: string[];
    nextActions: string[];
  }> {
    const { userRequest, autoDecompose = true } = input;

    // 自动分解任务
    const tasks = autoDecompose
      ? this.taskManager.decomposeTask(userRequest)
      : [
          this.taskManager.createTask({
            title: userRequest,
            description: userRequest,
            status: TaskStatus.PENDING,
            priority: TaskPriority.MEDIUM,
            dependencies: [],
            tags: ['user-request'],
          }),
        ];

    // 创建执行计划
    const plan = this.taskManager.createExecutionPlan({
      title: `执行计划: ${userRequest}`,
      description: userRequest,
      tasks,
      status: 'active',
    });

    // 生成建议
    const recommendations = [
      '建议按照任务依赖顺序执行',
      '定期检查任务状态和进度',
      '遇到阻塞时及时调整计划',
    ];

    // 生成下一步行动
    const executableTasks = this.taskManager.getExecutableTasks();
    const nextActions =
      executableTasks.length > 0
        ? [`开始执行: ${executableTasks[0].title}`]
        : ['所有任务已完成或被阻塞'];

    return {
      plan,
      recommendations,
      nextActions,
    };
  }

  /**
   * 执行计划
   */
  async executePlan(input: { planId: string; autoProgress?: boolean }): Promise<{
    plan: ExecutionPlan | null;
    currentTask: Task | null;
    progress: {
      completed: number;
      total: number;
      percentage: number;
    };
    nextSteps: string[];
  }> {
    const { planId, autoProgress = false } = input;
    const plan = this.taskManager.getExecutionPlan(planId);

    if (!plan) {
      return {
        plan: null,
        currentTask: null,
        progress: { completed: 0, total: 0, percentage: 0 },
        nextSteps: ['计划不存在'],
      };
    }

    // 获取当前可执行任务
    const executableTasks = this.taskManager
      .getExecutableTasks()
      .filter(task => plan.tasks.some(planTask => planTask.id === task.id));

    const currentTask = executableTasks[0] || null;

    // 如果启用自动进度，将第一个可执行任务标记为进行中
    if (autoProgress && currentTask && currentTask.status === TaskStatus.PENDING) {
      this.taskManager.updateTask(currentTask.id, { status: TaskStatus.IN_PROGRESS });
    }

    // 计算进度
    const completedTasks = plan.tasks.filter(task => task.status === TaskStatus.COMPLETED);
    const progress = {
      completed: completedTasks.length,
      total: plan.tasks.length,
      percentage:
        plan.tasks.length > 0 ? Math.round((completedTasks.length / plan.tasks.length) * 100) : 0,
    };

    // 生成下一步建议
    const nextSteps = currentTask
      ? [`执行任务: ${currentTask.title}`, `描述: ${currentTask.description}`]
      : progress.percentage === 100
        ? ['所有任务已完成！']
        : ['检查任务依赖关系，解除阻塞'];

    return {
      plan,
      currentTask,
      progress,
      nextSteps,
    };
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(input: { taskId?: string; planId?: string }): Promise<{
    tasks: Task[];
    statistics: ReturnType<TaskQueueManager['getTaskStatistics']>;
    queue: Task[];
  }> {
    const { taskId, planId } = input;

    let tasks: Task[] = [];

    if (taskId) {
      const task = this.taskManager.getTask(taskId);
      tasks = task ? [task] : [];
    } else if (planId) {
      const plan = this.taskManager.getExecutionPlan(planId);
      tasks = plan ? plan.tasks : [];
    } else {
      tasks = this.taskManager.getAllTasks();
    }

    return {
      tasks,
      statistics: this.taskManager.getTaskStatistics(),
      queue: this.taskManager.getTaskQueue(),
    };
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(input: { taskId: string; status: TaskStatus; notes?: string }): Promise<{
    task: Task | null;
    affectedTasks: Task[];
    recommendations: string[];
  }> {
    const { taskId, status, notes } = input;

    const task = this.taskManager.updateTask(taskId, {
      status,
      metadata: notes ? { ...this.taskManager.getTask(taskId)?.metadata, notes } : undefined,
    });

    if (!task) {
      return {
        task: null,
        affectedTasks: [],
        recommendations: ['任务不存在'],
      };
    }

    // 查找受影响的任务（依赖此任务的其他任务）
    const affectedTasks = this.taskManager
      .getAllTasks()
      .filter(t => t.dependencies.includes(taskId) || t.dependencies.includes(task.title));

    // 生成建议
    const recommendations: string[] = [];
    if (status === TaskStatus.COMPLETED && affectedTasks.length > 0) {
      recommendations.push(`任务完成！现在可以执行 ${affectedTasks.length} 个依赖任务`);
    }
    if (status === TaskStatus.FAILED) {
      recommendations.push('任务失败，请检查依赖此任务的其他任务');
    }

    return {
      task,
      affectedTasks,
      recommendations,
    };
  }
}
