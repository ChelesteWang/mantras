// src/interfaces/agent.interface.ts
import { IMantra } from '../../tools/interfaces/mantra.interface';
import { IDEContext, IRule } from '../../interfaces/ide.interface';

/**
 * Represents an "Agent" - an AI entity within the IDE capable of learning and using Mantras.
 */
export interface IAgent {
  /**
   * A unique identifier for the Agent.
   */
  id: string;

  /**
   * A human-readable name for the Agent.
   */
  name: string;

  /**
   * A list of Items (e.g., Mantras, Tools) the Agent has currently learned or is equipped with.
   */
  learnedItems: IMantra[]; // Renamed from learnedMantras, IMantra might become a generic IItem/ITool type

  /**
   * Stores the result of the last executed Item.
   */
  lastItemExecutionResult?: any; // Renamed from lastMantraExecutionResult

  /**
   * Allows the Agent to learn a new Item.
   * @param item - The Item to be learned.
   * @returns A promise that resolves when the Item is successfully learned, or rejects on failure.
   */
  learnItem(item: IMantra): Promise<void>; // Renamed from learnMantra

  /**
   * Allows the Agent to forget or unlearn an Item.
   * @param itemId - The ID of the Item to forget.
   * @returns A promise that resolves when the Item is successfully forgotten, or rejects if not found.
   */
  forgetItem(itemId: string): Promise<void>; // Renamed from forgetMantra

  /**
   * Executes a learned or registered Item by its ID, providing IDE context and rules.
   * @param itemId - The ID of the Item to execute.
   * @param ideContext - The current context from the IDE.
   * @param rules - An optional array of rules to adhere to during execution.
   * @param params - Optional parameters specific to the Item's execution.
   * @returns A promise that resolves with the result of the Item's execution.
   * @throws Error if the Item is not found or cannot be executed.
   */
  executeRegisteredItem(
    itemId: string,
    ideContext?: IDEContext,
    rules?: IRule[],
    params?: any
  ): Promise<any | void>; // Renamed from executeMantra

  /**
   * Optional: Current status or state of the Agent (e.g., 'idle', 'processing', 'learning').
   */
  status?: string;

  /**
   * Optional: Capabilities of the agent, beyond specific mantras.
   * e.g., ['code_understanding', 'file_system_access']
   */
  capabilities?: string[];
}