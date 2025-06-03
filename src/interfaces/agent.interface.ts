// src/interfaces/agent.interface.ts
import { IMantra } from './mantra.interface';
import { IDEContext, IRule } from './ide.interface';

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
   * A list of Mantras the Agent has currently learned or is equipped with.
   */
  learnedMantras: IMantra[];

  /**
   * Allows the Agent to learn a new Mantra.
   * @param mantra - The Mantra to be learned.
   * @returns A promise that resolves when the Mantra is successfully learned, or rejects on failure.
   */
  learnMantra(mantra: IMantra): Promise<void>;

  /**
   * Allows the Agent to forget or unlearn a Mantra.
   * @param mantraId - The ID of the Mantra to forget.
   * @returns A promise that resolves when the Mantra is successfully forgotten, or rejects if not found.
   */
  forgetMantra(mantraId: string): Promise<void>;

  /**
   * Executes a learned Mantra by its ID, providing IDE context and rules.
   * @param mantraId - The ID of the Mantra to execute.
   * @param ideContext - The current context from the IDE.
   * @param rules - An optional array of rules to adhere to during execution.
   * @param params - Optional parameters specific to the Mantra's execution.
   * @returns A promise that resolves with the result of the Mantra's execution.
   * @throws Error if the Mantra is not found or cannot be executed.
   */
  executeMantra(
    mantraId: string,
    ideContext?: IDEContext,
    rules?: IRule[],
    params?: any
  ): Promise<any | void>;

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