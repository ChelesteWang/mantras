// src/mantras/code-formatter.mantra.ts
import { IMantra, IDEContext, IRule } from '../interfaces';

/**
 * A Mantra for formatting code.
 * This version can receive IDE context and rules.
 */
export class CodeFormatterMantra implements IMantra {
  public readonly id = 'code-formatter';
  public readonly name = 'Code Formatter';
  public readonly description =
    'Formats a given code string. Can utilize IDE context and adhere to rules.';
  public readonly metadata = {
    version: '1.1.0',
    author: 'AI Assistant',
    tags: ['code', 'formatting', 'utility', 'ide-aware'],
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
    console.log(`CodeFormatterMantra: Executing...`);

    if (ideContext) {
      console.log('Received IDE Context:', JSON.stringify(ideContext, null, 2));
      // Example: Use current file path from context if no code is passed directly
      if (!params?.code && ideContext.currentFileContent) {
        console.log('Using code from IDE context (currentFileContent).');
        params = { ...params, code: ideContext.currentFileContent };
      }
    }

    if (rules && rules.length > 0) {
      console.log('Received Rules:', JSON.stringify(rules, null, 2));
      // Example: A rule could specify indentation type or max line length
      const formattingRule = rules.find(rule => rule.id === 'indentation-style');
      if (formattingRule) {
        console.log(`Applying rule: ${formattingRule.name} - ${formattingRule.definition}`);
      }
    }

    if (!params || typeof params.code !== 'string') {
      console.warn('CodeFormatterMantra: No code provided to format.');
      return 'Error: No code provided or code is not a string.';
    }

    const originalCode = params.code;
    let formattedCode = originalCode.trim(); // Basic formatting

    // Simulate applying a rule if present
    const lineEndingRule = rules?.find(rule => rule.id === 'line-ending');
    if (lineEndingRule?.definition === 'LF') {
        formattedCode = formattedCode.replace(/\r\n/g, '\n');
        console.log('Applied LF line endings rule.');
    } else if (lineEndingRule?.definition === 'CRLF') {
        formattedCode = formattedCode.replace(/(?:\r\n|\r|\n)/g, '\r\n');
        console.log('Applied CRLF line endings rule.');
    }

    formattedCode = `// Formatted by CodeFormatterMantra (v1.1.0)\n// IDE Context Path: ${ideContext?.currentFilePath || 'N/A'}\n${formattedCode}`;

    console.log(
      `CodeFormatterMantra: Original code snippet (first 50 chars):\n"${originalCode.substring(0,50)}..."\nFormatted code snippet (first 70 chars):\n"${formattedCode.substring(0,70)}..."`
    );
    return formattedCode;
  }
}