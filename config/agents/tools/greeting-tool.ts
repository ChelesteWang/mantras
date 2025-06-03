// /Users/bytedance/Desktop/trae/mantras/config/agents/tools/greeting-tool.ts
import { IMantra, IDEContext, IRule } from '../../../src/interfaces'; // Adjust path as needed
import { Logger } from '../../../src/core/logger'; // Adjust path as needed

/**
 * GreetingTool
 * needs to be exported for default import
 * A simple tool to greet the user.
 */
export default class GreetingTool implements IMantra {
  id: string = 'item-001-greet';
  name: string = 'Greeter Tool';
  description: string = 'A simple tool to greet the user.';
  metadata: Record<string, any> = {
    version: '1.0.0',
    tags: ['greeting', 'utility'],
  };

  async execute(
    ideContext?: IDEContext,
    rules?: IRule[],
    params?: any
  ): Promise<string> {
    const userName = params?.userName || ideContext?.user?.name || 'User';
    const message = `Hello, ${userName}! This is the ${this.name} (ID: ${this.id}) speaking.`;
    Logger.log(message);
    if (ideContext) {
      Logger.log('IDE Context available:', ideContext);
    }
    if (rules) {
      Logger.log('Rules to follow:', rules);
    }
    return message;
  }
}

// Optional: Export an instance if you want to directly use it without instantiation elsewhere,
// or if your dynamic loading mechanism expects a pre-instantiated object.
// export const greetingToolInstance = new GreetingTool();