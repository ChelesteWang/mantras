// src/tools/code-formatter.tool.ts
import { IMantra, IDEContext, IRule } from '../interfaces/index'; // IMantra might be replaced by a more generic ITool later
import { Logger } from '../core/logger'; // Import Logger

/**
 * A Tool for formatting code.
 * This version can receive IDE context and rules.
 */
export class CodeFormatterTool implements IMantra { // Implementing IMantra for now, could be ITool
  public readonly id = 'code-formatter-tool'; // Changed ID to reflect it's a tool
  public readonly name = 'Code Formatter Tool'; // Changed name
  public readonly description =
    'Formats a given code string. Can utilize IDE context and adhere to rules. This is a tool.';
  public readonly metadata = {
    version: '1.0.0', // Reset version for the new tool
    author: 'AI Assistant',
    tags: ['code', 'formatting', 'utility', 'ide-aware', 'tool'], // Added 'tool' tag
  };

  /**
   * Executes the code formatting logic.
   * @param ideContext - The current context from the IDE.
   * @param rules - An optional array of rules to adhere to during execution.
   * @param params - Should contain a `code` property with the string to format.
   * @returns A promise that resolves with the formatted code string.
   */
  async execute(
    ideContext?: IDEContext,
    rules?: IRule[],
    params?: { code?: string }
  ): Promise<string | void> {
    Logger.log(`CodeFormatterTool: Executing...`);

    if (ideContext) {
      Logger.log('Received IDE Context:', JSON.stringify(ideContext, null, 2));
      // Example: Use current file path from context if no code is passed directly
      if (!params?.code && ideContext.currentFileContent) {
        Logger.log('CodeFormatterTool: Using code from IDE context (currentFileContent).');
        params = { ...params, code: ideContext.currentFileContent };
      }
    }

    if (rules && rules.length > 0) {
      Logger.log('Received Rules:', JSON.stringify(rules, null, 2));
      // Example: A rule could specify indentation type or max line length
      const formattingRule = rules.find(rule => rule.id === 'indentation-style');
      if (formattingRule) {
        Logger.log(`Applying rule: ${formattingRule.name} - ${formattingRule.definition}`);
      }
    }

    if (!params || typeof params.code !== 'string') {
      Logger.warn('CodeFormatterTool: No code provided to format.');
      return 'Error: No code provided or code is not a string.';
    }

    const originalCode = params.code;
    let formattedCode = originalCode.trim(); // Basic formatting

    // Simulate applying a rule if present
    const lineEndingRule = rules?.find(rule => rule.id === 'line-ending');
    if (lineEndingRule?.definition === 'LF') {
        formattedCode = formattedCode.replace(/\r\n/g, '\n');
        Logger.log('Applied LF line endings rule.');
    } else if (lineEndingRule?.definition === 'CRLF') {
        formattedCode = formattedCode.replace(/(?:\r\n|\r|\n)/g, '\r\n');
        Logger.log('Applied CRLF line endings rule.');
    }

    formattedCode = `// Formatted by CodeFormatterTool (v1.0.0)
// IDE Context Path: ${ideContext?.currentFilePath || 'N/A'}
${formattedCode}`;

    Logger.log(
      `CodeFormatterTool: Original code snippet (first 50 chars):
"${originalCode.substring(0,50)}..."
Formatted code snippet (first 70 chars):
"${formattedCode.substring(0,70)}..."`
    );
    return formattedCode;
  }
}