import { Component, CallOptions } from './component';

/**
 * 可调用组件接口
 * 定义可被调用执行的组件，是框架中所有可执行组件的基础
 */
export interface Callable<Input = any, Output = any> extends Component {
  /**
   * 调用组件执行逻辑
   * @param input 输入数据
   * @param options 调用选项
   * @returns 输出数据的Promise
   */
  call(input: Input, options?: CallOptions): Promise<Output>;
}

/**
 * 可组合组件接口
 * 定义可与其他组件组合的组件，支持链式调用
 */
export interface Composable<Input = any, Output = any> extends Callable<Input, Output> {
  /**
   * 将当前组件与下一个组件组合，形成处理管道
   * @param next 下一个要执行的组件
   * @returns 组合后的新组件
   */
  pipe<NewOutput>(next: Callable<Output, NewOutput>): Composable<Input, NewOutput>;
}

/**
 * 组合操作符命名空间
 * 提供各种组合组件的操作符函数
 */
export namespace Compose {
  /**
   * 顺序组合操作符
   * 将两个组件按顺序组合，第一个组件的输出作为第二个组件的输入
   */
  export function sequence<Input, Intermediate, Output>(
    first: Callable<Input, Intermediate>,
    second: Callable<Intermediate, Output>
  ): Composable<Input, Output> {
    return {
      id: `sequence-${first.id}-${second.id}`,
      name: `Sequence(${first.name}, ${second.name})`,
      description: `Sequential composition of ${first.name} and ${second.name}`,
      async call(input: Input, options?: CallOptions): Promise<Output> {
        const intermediate = await first.call(input, options);
        return second.call(intermediate, options);
      },
      pipe<NewOutput>(next: Callable<Output, NewOutput>): Composable<Input, NewOutput> {
        return sequence(this, next);
      }
    };
  }

  /**
   * 并行组合操作符
   * 并行执行两个组件，将相同的输入传递给两个组件，并将两个组件的输出合并为一个数组
   */
  export function parallel<Input, Output1, Output2>(
    first: Callable<Input, Output1>,
    second: Callable<Input, Output2>
  ): Composable<Input, [Output1, Output2]> {
    return {
      id: `parallel-${first.id}-${second.id}`,
      name: `Parallel(${first.name}, ${second.name})`,
      description: `Parallel composition of ${first.name} and ${second.name}`,
      async call(input: Input, options?: CallOptions): Promise<[Output1, Output2]> {
        const [output1, output2] = await Promise.all([
          first.call(input, options),
          second.call(input, options)
        ]);
        return [output1, output2];
      },
      pipe<NewOutput>(next: Callable<[Output1, Output2], NewOutput>): Composable<Input, NewOutput> {
        return sequence(this, next);
      }
    };
  }

  /**
   * 条件组合操作符
   * 根据条件函数的结果决定执行哪个组件
   */
  export function condition<Input, Output>(
    condition: (input: Input) => boolean,
    trueCallable: Callable<Input, Output>,
    falseCallable: Callable<Input, Output>
  ): Composable<Input, Output> {
    return {
      id: `condition-${trueCallable.id}-${falseCallable.id}`,
      name: `Condition(${trueCallable.name}, ${falseCallable.name})`,
      description: `Conditional composition of ${trueCallable.name} and ${falseCallable.name}`,
      async call(input: Input, options?: CallOptions): Promise<Output> {
        if (condition(input)) {
          return trueCallable.call(input, options);
        } else {
          return falseCallable.call(input, options);
        }
      },
      pipe<NewOutput>(next: Callable<Output, NewOutput>): Composable<Input, NewOutput> {
        return sequence(this, next);
      }
    };
  }

  /**
   * 重试组合操作符
   * 为组件添加重试逻辑
   */
  export function retry<Input, Output>(
    callable: Callable<Input, Output>,
    options: { maxAttempts: number, delay?: number }
  ): Composable<Input, Output> {
    return {
      id: `retry-${callable.id}`,
      name: `Retry(${callable.name})`,
      description: `Retry wrapper for ${callable.name} with max ${options.maxAttempts} attempts`,
      async call(input: Input, callOptions?: CallOptions): Promise<Output> {
        let lastError: Error | undefined;
        
        for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
          try {
            return await callable.call(input, callOptions);
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            
            if (attempt < options.maxAttempts) {
              const delay = options.delay || Math.pow(2, attempt) * 100; // 指数退避
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        
        throw lastError || new Error(`Failed after ${options.maxAttempts} attempts`);
      },
      pipe<NewOutput>(next: Callable<Output, NewOutput>): Composable<Input, NewOutput> {
        return sequence(this, next);
      }
    };
  }
}