// src/interfaces/mantra.interface.ts
import { IDEContext, IRule } from './ide.interface';

/**
 * Represents a "Mantra" - a specific skill or capability an Agent can learn.
 */
export interface IMantra {
  /**
   * A unique identifier for the Mantra.
   */
  id: string;

  /**
   * A human-readable name for the Mantra.
   */
  name: string;

  /**
   * A description of what this Mantra does or enables.
   */
  description: string;

  /**
   * Method to activate or apply the Mantra's capability.
   * This can now accept IDE context and a list of rules to follow.
   * @param ideContext - The current context from the IDE.
   * @param rules - An optional array of rules to adhere to during execution.
   * @param params - Optional parameters specific to the Mantra's execution.
   * @returns A promise that resolves with the result of the Mantra's execution, or void.
   */
  execute(
    ideContext?: IDEContext,
    rules?: IRule[],
    params?: any
  ): Promise<any | void>;

  /**
   * Optional: Any metadata associated with the Mantra, 
   * e.g., version, dependencies, required agent capabilities, supported languages.
   */
  metadata?: Record<string, any>;
}