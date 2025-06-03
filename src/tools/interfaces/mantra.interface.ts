// src/interfaces/mantra.interface.ts
import { IDEContext, IRule } from '../../interfaces/ide.interface';

/**
 * Represents a "Mantra" - a specific skill, capability, or tool an Agent can learn and use.
 * This interface can also serve as a base for more generic "Items" or "Tools".
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
   * Method to activate or apply the Mantra's (or Item's/Tool's) capability.
   * This can now accept IDE context and a list of rules to follow.
   * @param ideContext - The current context from the IDE.
   * @param rules - An optional array of rules to adhere to during execution.
   * @param params - Optional parameters specific to the Mantra's (or Item's/Tool's) execution.
   * @returns A promise that resolves with the result of the execution, or void.
   */
  execute(
    ideContext?: IDEContext,
    rules?: IRule[],
    params?: any
  ): Promise<any | void>;

  /**
   * Optional: Any metadata associated with the Mantra (or Item/Tool), 
   * e.g., version, dependencies, required agent capabilities, supported languages, tags.
   */
  metadata?: Record<string, any>;
}