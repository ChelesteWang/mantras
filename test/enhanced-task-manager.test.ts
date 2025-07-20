import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  TaskQueueManager,
  EnhancedTaskManagerTool,
  TaskStatus,
  TaskPriority,
} from '../src/tools/enhanced-task-manager.tool';

describe('Enhanced Task Manager Tool', () => {
  let taskManager: TaskQueueManager;
  let enhancedTool: EnhancedTaskManagerTool;

  beforeEach(() => {
    taskManager = new TaskQueueManager();
    enhancedTool = new EnhancedTaskManagerTool(taskManager);
  });

  describe('TaskQueueManager', () => {
    test('should create a task with proper structure', () => {
      const task = taskManager.createTask({
        title: '测试任务',
        description: '这是一个测试任务',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        dependencies: [],
        tags: ['test'],
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('测试任务');
      expect(task.status).toBe(TaskStatus.PENDING);
      expect(task.priority).toBe(TaskPriority.MEDIUM);
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    test('should decompose debug task correctly', () => {
      const tasks = taskManager.decomposeTask('调试JavaScript性能问题');

      expect(tasks).toHaveLength(4);
      expect(tasks[0].title).toBe('问题分析');
      expect(tasks[1].title).toBe('解决方案设计');
      expect(tasks[2].title).toBe('实施修复');
      expect(tasks[3].title).toBe('测试验证');

      // 检查依赖关系
      expect(tasks[1].dependencies).toContain('问题分析');
      expect(tasks[2].dependencies).toContain('解决方案设计');
      expect(tasks[3].dependencies).toContain('实施修复');
    });

    test('should decompose implementation task correctly', () => {
      const tasks = taskManager.decomposeTask('实现用户认证系统');

      expect(tasks).toHaveLength(5);
      expect(tasks[0].title).toBe('需求分析');
      expect(tasks[1].title).toBe('架构设计');
      expect(tasks[2].title).toBe('核心实现');
      expect(tasks[3].title).toBe('测试编写');
      expect(tasks[4].title).toBe('文档更新');
    });

    test('should manage task queue correctly', () => {
      // 创建有依赖关系的任务
      const task1 = taskManager.createTask({
        title: '任务1',
        description: '第一个任务',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        dependencies: [],
        tags: ['test'],
      });

      const task2 = taskManager.createTask({
        title: '任务2',
        description: '依赖任务1的任务',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        dependencies: [task1.id],
        tags: ['test'],
      });

      // 检查队列
      const queue = taskManager.getTaskQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe(task1.id);

      // 完成任务1
      taskManager.updateTask(task1.id, { status: TaskStatus.COMPLETED });

      // 检查队列更新
      const updatedQueue = taskManager.getTaskQueue();
      expect(updatedQueue).toHaveLength(1);
      expect(updatedQueue[0].id).toBe(task2.id);
    });

    test('should calculate statistics correctly', () => {
      // 创建不同状态的任务
      taskManager.createTask({
        title: '任务1',
        description: '待处理任务',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        dependencies: [],
        tags: ['test'],
      });

      taskManager.createTask({
        title: '任务2',
        description: '进行中任务',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dependencies: [],
        tags: ['test'],
      });

      taskManager.createTask({
        title: '任务3',
        description: '已完成任务',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.LOW,
        dependencies: [],
        tags: ['test'],
      });

      const stats = taskManager.getTaskStatistics();
      expect(stats.total).toBe(3);
      expect(stats.byStatus[TaskStatus.PENDING]).toBe(1);
      expect(stats.byStatus[TaskStatus.IN_PROGRESS]).toBe(1);
      expect(stats.byStatus[TaskStatus.COMPLETED]).toBe(1);
      expect(stats.byPriority[TaskPriority.HIGH]).toBe(1);
      expect(stats.byPriority[TaskPriority.MEDIUM]).toBe(1);
      expect(stats.byPriority[TaskPriority.LOW]).toBe(1);
    });
  });

  describe('EnhancedTaskManagerTool', () => {
    test('should create execution plan with auto decomposition', async () => {
      const result = await enhancedTool.createExecutionPlan({
        userRequest: '调试React应用性能问题',
        includeContext: true,
        autoDecompose: true,
      });

      expect(result.plan).toBeDefined();
      expect(result.plan.tasks).toHaveLength(4);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.nextActions).toBeInstanceOf(Array);
      expect(result.plan.title).toContain('调试React应用性能问题');
    });

    test('should execute plan and track progress', async () => {
      // 先创建一个计划
      const createResult = await enhancedTool.createExecutionPlan({
        userRequest: '实现API接口',
        autoDecompose: true,
      });

      const planId = createResult.plan.id;

      // 执行计划
      const executeResult = await enhancedTool.executePlan({
        planId,
        autoProgress: true,
      });

      expect(executeResult.plan).toBeDefined();
      expect(executeResult.progress).toBeDefined();
      expect(executeResult.progress.total).toBeGreaterThan(0);
      expect(executeResult.nextSteps).toBeInstanceOf(Array);
    });

    test('should get task status correctly', async () => {
      // 创建一些任务
      const task = taskManager.createTask({
        title: '测试任务',
        description: '用于测试状态获取',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        dependencies: [],
        tags: ['test'],
      });

      const result = await enhancedTool.getTaskStatus({
        taskId: task.id,
      });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].id).toBe(task.id);
      expect(result.statistics).toBeDefined();
      expect(result.queue).toBeInstanceOf(Array);
    });

    test('should update task status and track affected tasks', async () => {
      // 创建有依赖关系的任务
      const task1 = taskManager.createTask({
        title: '基础任务',
        description: '其他任务依赖的基础任务',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        dependencies: [],
        tags: ['base'],
      });

      const task2 = taskManager.createTask({
        title: '依赖任务',
        description: '依赖基础任务的任务',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        dependencies: [task1.id],
        tags: ['dependent'],
      });

      // 更新基础任务状态为完成
      const result = await enhancedTool.updateTaskStatus({
        taskId: task1.id,
        status: TaskStatus.COMPLETED,
        notes: '任务已完成',
      });

      expect(result.task).toBeDefined();
      expect(result.task!.status).toBe(TaskStatus.COMPLETED);
      expect(result.affectedTasks).toHaveLength(1);
      expect(result.affectedTasks[0].id).toBe(task2.id);
      expect(result.recommendations).toContain('任务完成！现在可以执行 1 个依赖任务');
    });

    test('should handle non-existent plan execution', async () => {
      const result = await enhancedTool.executePlan({
        planId: 'non-existent-plan',
        autoProgress: false,
      });

      expect(result.plan).toBeNull();
      expect(result.progress.total).toBe(0);
      expect(result.nextSteps).toContain('计划不存在');
    });

    test('should handle non-existent task status update', async () => {
      const result = await enhancedTool.updateTaskStatus({
        taskId: 'non-existent-task',
        status: TaskStatus.COMPLETED,
      });

      expect(result.task).toBeNull();
      expect(result.affectedTasks).toHaveLength(0);
      expect(result.recommendations).toContain('任务不存在');
    });
  });

  describe('Task Priority and Queue Management', () => {
    test('should prioritize urgent tasks in queue', () => {
      const urgentTask = taskManager.createTask({
        title: '紧急任务',
        description: '需要立即处理',
        status: TaskStatus.PENDING,
        priority: TaskPriority.URGENT,
        dependencies: [],
        tags: ['urgent'],
      });

      const lowTask = taskManager.createTask({
        title: '低优先级任务',
        description: '可以稍后处理',
        status: TaskStatus.PENDING,
        priority: TaskPriority.LOW,
        dependencies: [],
        tags: ['low'],
      });

      const queue = taskManager.getTaskQueue();
      expect(queue[0].id).toBe(urgentTask.id);
      expect(queue[1].id).toBe(lowTask.id);
    });

    test('should handle blocked tasks correctly', () => {
      const blockedTask = taskManager.createTask({
        title: '被阻塞的任务',
        description: '依赖未完成的任务',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        dependencies: ['non-existent-dependency'],
        tags: ['blocked'],
      });

      const executableTasks = taskManager.getExecutableTasks();
      expect(executableTasks).not.toContain(blockedTask);

      const stats = taskManager.getTaskStatistics();
      expect(stats.blocked).toBe(1);
    });
  });
});
