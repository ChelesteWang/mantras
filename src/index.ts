// src/index.ts
import { registry } from './core/registry'; // Updated import for registry
import { Logger } from './core/logger'; // Import the new Logger using named import
import { BaseAgent } from './agents/core/base.agent'; // Updated import path for BaseAgent
import { CodeFormatterTool } from './tools/code-formatter.tool'; // Updated import for CodeFormatterTool
import { IAgent, IMantra, IDEContext, IRule } from './interfaces/index';

async function main() {
  Logger.log('Initializing Mantra System...');

  // MantraRegistry is already a singleton instance, directly use it.

  // 2. Create and register a Tool instance
  const codeFormatter = new CodeFormatterTool(); // Use new class name
  registry.registerItem(codeFormatter); // Use new method name
  Logger.log(`Registered Tool: ${codeFormatter.name}`);

  // 3. Create an Agent instance
  const agentSmith: IAgent = new BaseAgent('agent-007', 'Agent Smith');
  Logger.log(`Created Agent: ${agentSmith.name}`);

  // 4. Agent learns an Item from the registry
  const itemToLearn = registry.getItem(codeFormatter.id); // Use new method name and correct ID
  if (itemToLearn) {
    await agentSmith.learnItem(itemToLearn as IMantra); // Use new method name, cast as IMantra for now
  } else {
    Logger.error(`Could not find ${codeFormatter.id} item in registry.`);
    return;
  }

  // 5. Define sample IDEContext and Rules
  const sampleIDEContext: IDEContext = {
    currentFilePath: '/Users/bytedance/Desktop/trae/mantras/src/example.ts',
    projectRootPath: '/Users/bytedance/Desktop/trae/mantras',
    currentSelection: undefined,
    currentFileContent: 'const  badlyFormatted = ( arg1:string, arg2:number):void => {Logger.log(arg1, arg2);};',
    fileLanguage: 'typescript',
    clipboardContent: ''
  };

  const sampleRules: IRule[] = [
    {
      id: 'indentation-style',
      name: 'Indentation Style',
      description: 'Specifies the indentation style to be used (e.g., 2 spaces, 4 spaces, tabs).',
      definition: { type: 'spaces', size: 2 },
      severity: 'warning',
      scope: 'file'
    },
    {
      id: 'line-ending',
      name: 'Line Ending Convention',
      description: 'Specifies the line ending convention (LF or CRLF).',
      definition: 'LF', // or 'CRLF'
      severity: 'error',
      scope: 'project'
    }
  ];

  // 6. Agent executes the learned Mantra with IDEContext and Rules
  try {
    const codeToFormat = 'function hello() { console.log("Hello, world!"); } // A comment\r\nlet anotherLine = true;';
    Logger.log(`Agent ${agentSmith.name} will execute ${codeFormatter.name} with IDE context, rules, and code: "${codeToFormat.substring(0, 30)}..."`);

    const formattedCode = await agentSmith.executeRegisteredItem( // Use new method name
      codeFormatter.id, // Use correct ID
      sampleIDEContext,
      sampleRules,
      { code: codeToFormat }
    );
    Logger.log(`Execution Result (Formatted Code):${formattedCode}`);
    Logger.log(`Agent's last execution result property:${agentSmith.lastItemExecutionResult}`); // Use new property name

    // Example: Execute using code from IDEContext if no direct code is passed
    Logger.log(`\nAgent ${agentSmith.name} will execute ${codeFormatter.name} using code from IDEContext...`);
    const formattedFromContext = await agentSmith.executeRegisteredItem( // Use new method name
      codeFormatter.id, // Use correct ID
      sampleIDEContext, // Pass context
      [sampleRules[1]]  // Pass only the line ending rule
      // No params.code, so it should use ideContext.currentFileContent
    );
    Logger.log(`Execution Result (Formatted from Context):${formattedFromContext}`);
    Logger.log(`Agent's last execution result property (from context):${agentSmith.lastItemExecutionResult}`); // Use new property name


  } catch (error) {
    Logger.error(`Error during Mantra execution by ${agentSmith.name}:`, error);
  }

  // ... (rest of the demo: forget item, try executing again, unregister)
  Logger.log('\n--- Continuing with original demo flow ---');
  try {
    await agentSmith.forgetItem(codeFormatter.id); // Use new method name and correct ID
    Logger.log(`Agent ${agentSmith.name} has forgotten ${codeFormatter.name}.`);
  } catch (error) {
    Logger.error(`Error while ${agentSmith.name} tried to forget an item:`, error);
  }

  // Try executing again (should fail if agent forgot it AND it's not in registry, or succeed if in registry)
  try {
    Logger.log(`Agent ${agentSmith.name} will attempt to execute ${codeFormatter.name} again (should use registry if available).`);
    await agentSmith.executeRegisteredItem(codeFormatter.id, sampleIDEContext, sampleRules, { code: 'let x = 1;' }); // Use new method name
  } catch (error) {
    Logger.error(`Error executing after forgetting:`, error);
  }

  // Unregister Item
  registry.unregisterItem(codeFormatter.id); // Use new method name
  Logger.log(`Unregistered Item: ${codeFormatter.name}`);
  Logger.log('Available Items after unregistering:', registry.listItems().map((item: IMantra) => item.name)); // Use new method name


  Logger.log('Mantra system demo finished.');
}

main().catch(error => {
  Logger.error('Unhandled error in main:', error);
});