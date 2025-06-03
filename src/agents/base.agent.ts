// src/agents/base.agent.ts
import { IAgent, IMantra, IDEContext, IRule } from '../interfaces/index';

/**
 * A base implementation of the IAgent interface.
 * Provides common functionality for learning, forgetting, and executing Mantras.
 */
export class BaseAgent implements IAgent {
  public id: string;
  public name: string;
  public learnedMantras: IMantra[];
  public status?: string;
  public capabilities?: string[];

  constructor(
    id: string,
    name: string,
    initialMantras: IMantra[] = [],
    status: string = 'idle',
    capabilities: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.learnedMantras = initialMantras;
    this.status = status;
    this.capabilities = capabilities;
    console.log(`Agent ${this.name} (ID: ${this.id}) initialized.`);
  }

  async learnMantra(mantra: IMantra): Promise<void> {
    if (this.learnedMantras.find((m) => m.id === mantra.id)) {
      console.warn(
        `Agent ${this.name} already knows Mantra ${mantra.name} (ID: ${mantra.id}).`
      );
      return;
    }
    this.learnedMantras.push(mantra);
    console.log(
      `Agent ${this.name} learned Mantra: ${mantra.name} (ID: ${mantra.id}).`
    );
  }

  async forgetMantra(mantraId: string): Promise<void> {
    const mantraIndex = this.learnedMantras.findIndex((m) => m.id === mantraId);
    if (mantraIndex === -1) {
      console.warn(
        `Agent ${this.name} does not know Mantra with ID: ${mantraId}.`
      );
      throw new Error(`Mantra with ID ${mantraId} not found.`);
    }
    const forgottenMantra = this.learnedMantras.splice(mantraIndex, 1)[0];
    console.log(
      `Agent ${this.name} forgot Mantra: ${forgottenMantra.name} (ID: ${forgottenMantra.id}).`
    );
  }

  async executeMantra(
    mantraId: string,
    ideContext?: IDEContext,
    rules?: IRule[],
    params?: any
  ): Promise<any | void> {
    this.status = 'processing';
    console.log(
      `Agent ${this.name} is attempting to execute Mantra ID: ${mantraId}.`
    );
    if (ideContext) {
      console.log('With IDE Context:', ideContext);
    }
    if (rules && rules.length > 0) {
      console.log('Following Rules:', rules);
    }

    const mantra = this.learnedMantras.find((m) => m.id === mantraId);
    if (!mantra) {
      this.status = 'idle';
      console.error(
        `Agent ${this.name} does not know Mantra with ID: ${mantraId}.`
      );
      throw new Error(`Mantra with ID ${mantraId} not found or not learned.`);
    }

    try {
      console.log(`Executing Mantra: ${mantra.name}...`);
      // Pass ideContext, rules, and params to the mantra's execute method
      const result = await mantra.execute(ideContext, rules, params);
      console.log(`Mantra ${mantra.name} executed successfully.`);
      this.status = 'idle';
      return result;
    } catch (error) {
      this.status = 'idle';
      console.error(
        `Error executing Mantra ${mantra.name} (ID: ${mantraId}) for Agent ${this.name}:`,
        error
      );
      throw error;
    }
  }
}