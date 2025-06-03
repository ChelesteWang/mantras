// src/index.ts
import { mantraRegistry as registry } from './core/mantra-registry'; // Import the singleton instance
import { BaseAgent } from './agents/base.agent';
import { CodeFormatterMantra } from './mantras/code-formatter.mantra';
import { IAgent, IMantra, IDEContext, IRule } from './interfaces/index';

async function main() {
  console.log('Initializing Mantra System...');

  // MantraRegistry is already a singleton instance, directly use it.

  // 2. Create and register a Mantra instance
  const codeFormatter = new CodeFormatterMantra();
  registry.registerMantra(codeFormatter);
  console.log(`Registered Mantra: ${codeFormatter.name}`);

  // 3. Create an Agent instance
  const agentSmith: IAgent = new BaseAgent('agent-007', 'Agent Smith');
  console.log(`Created Agent: ${agentSmith.name}`);

  // 4. Agent learns a Mantra from the registry
  const mantraToLearn = registry.getMantra('code-formatter');
  if (mantraToLearn) {
    await agentSmith.learnMantra(mantraToLearn);
  } else {
    console.error('Could not find code-formatter mantra in registry.');
    return;
  }

  // 5. Define sample IDEContext and Rules
  const sampleIDEContext: IDEContext = {
    workspaceRoot: '/Users/bytedance/Desktop/trae/mantras',
    currentFilePath: '/Users/bytedance/Desktop/trae/mantras/src/dummy.ts',
    currentFileLanguageId: 'typescript',
    currentFileContent: 'const  badlyFormatted = ( arg1:string, arg2:number):void => {console.log(arg1, arg2);};',
    selectedText: 'arg1:string, arg2:number',
    cursorPosition: { line: 1, column: 30 },
    customIdeProperty: 'VSCode_1.80.0'
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
    console.log(`Agent ${agentSmith.name} will execute ${codeFormatter.name} with IDE context, rules, and code: "${codeToFormat.substring(0,30)}..."`);
    
    const formattedCode = await agentSmith.executeMantra(
      'code-formatter',
      sampleIDEContext,
      sampleRules,
      { code: codeToFormat }
    );
    console.log(`Execution Result (Formatted Code):\n${formattedCode}`);

    // Example: Execute using code from IDEContext if no direct code is passed
    console.log(`\nAgent ${agentSmith.name} will execute ${codeFormatter.name} using code from IDEContext...`);
    const formattedFromContext = await agentSmith.executeMantra(
      'code-formatter',
      sampleIDEContext, // Pass context
      [sampleRules[1]]  // Pass only the line ending rule
      // No params.code, so it should use ideContext.currentFileContent
    );
    console.log(`Execution Result (Formatted from Context):\n${formattedFromContext}`);


  } catch (error) {
    console.error(`Error during Mantra execution by ${agentSmith.name}:`, error);
  }

  // ... (rest of the demo: forget mantra, try executing again, unregister)
  console.log('\n--- Continuing with original demo flow ---');
  try {
    await agentSmith.forgetMantra('code-formatter');
    console.log(`Agent ${agentSmith.name} has forgotten ${codeFormatter.name}.`);
  } catch (error) {
    console.error(`Error while ${agentSmith.name} tried to forget a mantra:`, error);
  }

  // Try executing again (should fail)
  try {
    console.log(`Agent ${agentSmith.name} will attempt to execute ${codeFormatter.name} again (should fail).`);
    await agentSmith.executeMantra('code-formatter', sampleIDEContext, sampleRules, { code: 'let x = 1;' });
  } catch (error) {
    console.error(`Expected error after forgetting Mantra:`, error);
  }

  // Unregister Mantra
  registry.unregisterMantra('code-formatter');
  console.log(`Unregistered Mantra: ${codeFormatter.name}`);
  console.log('Available Mantras after unregistering:', registry.listMantras().map((m: IMantra) => m.name));


  console.log('Mantra system demo finished.');
}

main().catch(error => {
  console.error('Unhandled error in main:', error);
});