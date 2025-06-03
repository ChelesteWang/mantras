// src/interfaces/ide.interface.ts

/**
 * Represents the context provided by the IDE environment.
 * This can include information about the current project, open files, user selections, etc.
 */
export interface IDEContext {
  /**
   * The absolute path to the root of the current workspace or project.
   */
  workspaceRoot?: string;

  /**
   * The absolute path to the currently active/open file in the editor.
   */
  currentFilePath?: string;

  /**
   * The language ID of the current file (e.g., 'typescript', 'python').
   */
  currentFileLanguageId?: string;

  /**
   * The content of the currently active file.
   */
  currentFileContent?: string;

  /**
   * The text currently selected by the user in the editor.
   */
  selectedText?: string;

  /**
   * Information about the cursor position (e.g., line number, column).
   */
  cursorPosition?: {
    line: number;
    column: number;
  };

  /**
   * Any other relevant information from the IDE.
   * This could be a flexible object પાણી specific IDE capabilities.
   */
  [key: string]: any; // Allows for additional, unspecified context properties
}

/**
 * Represents a rule or guideline that an Agent or Mantra should adhere to.
 */
export interface IRule {
  /**
   * A unique identifier for the rule.
   */
  id: string;

  /**
   * A human-readable name or title for the rule.
   */
  name: string;

  /**
   * A detailed description of the rule and its purpose.
   */
  description: string;

  /**
   * The actual rule definition or parameters.
   * This could be a string, a regular expression, a configuration object, etc.
   */
  definition: any;

  /**
   * The severity of the rule if violated (e.g., 'error', 'warning', 'info').
   */
  severity?: 'error' | 'warning' | 'info';

  /**
   * Optional: Scope of the rule (e.g., 'file', 'project', 'language:typescript').
   */
  scope?: string | string[];
}