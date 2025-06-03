// src/agents/core/base.agent.ts
import { IAgent, IMantra, IDEContext, IRule } from '../../interfaces/index'; // IMantra might be replaced by a more generic ITool or IItem
import { registry } from '../../core/registry'; // Import the renamed registry
import { Logger } from '../../core/logger'; // Import Logger

/**
 * A base implementation of the IAgent interface.
 * Provides common functionality for learning, forgetting, and executing Mantras.
 */
export class BaseAgent implements IAgent { // IAgent interface itself will be updated below
  public id: string;
  public name: string;
  public learnedItems: IMantra[]; // Renamed from learnedMantras
  public lastItemExecutionResult?: any; // Renamed from lastMantraExecutionResult
  public status?: string;
  public capabilities?: string[];

  constructor(
    id: string,
    name: string,
    initialItems: IMantra[] = [], // Renamed from initialMantras
    status: string = 'idle',
    capabilities: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.learnedItems = initialItems; // Updated to use learnedItems
    this.status = status;
    this.capabilities = capabilities;
    Logger.log(`Agent ${this.name} (ID: ${this.id}) initialized.`);
  }

  async learnItem(item: IMantra): Promise<void> { // Renamed from learnMantra
    if (this.learnedItems.find((i) => i.id === item.id)) {
      Logger.warn(
        `Agent ${this.name} already knows Item ${item.name} (ID: ${item.id}).`
      );
      return;
    }
    this.learnedItems.push(item);
    Logger.log(
      `Agent ${this.name} learned Item: ${item.name} (ID: ${item.id}).`
    );
    // Also register with the global registry
    try {
      registry.registerItem(item);
      Logger.log(
        `Item ${item.name} (ID: ${item.id}) also registered in global registry by Agent ${this.name}.`
      );
    } catch (error: any) {
      // If already registered globally, the agent still learns it locally.
      Logger.log(
        `Item ${item.name} (ID: ${item.id}) was already in the global registry (Agent ${this.name} still learned it).`
      );
    }
  }

  async forgetItem(itemId: string): Promise<void> { // Renamed from forgetMantra
    const itemIndex = this.learnedItems.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) {
      Logger.warn(
        `Agent ${this.name} does not know Item with ID: ${itemId}.`
      );
      throw new Error(`Item with ID ${itemId} not found.`);
    }
    const forgottenItem = this.learnedItems.splice(itemIndex, 1)[0];
    Logger.log(
      `Agent ${this.name} forgot Item: ${forgottenItem.name} (ID: ${forgottenItem.id}).`
    );
    // Note: This does not unregister from the global registry
    // as other agents/systems might still be using it.
  }

  async executeRegisteredItem(
    itemId: string,
    ideContext?: IDEContext,
    rules?: IRule[],
    params?: any
  ): Promise<any | void> { // Renamed from executeMantra
    this.status = 'processing';
    Logger.log(
      `Agent ${this.name} is attempting to execute Item ID: ${itemId}.`
    );
    if (ideContext) {
      Logger.log('With IDE Context:', ideContext);
    }
    if (rules && rules.length > 0) {
      Logger.log('Following Rules:', rules);
    }

    let itemToExecute = this.learnedItems.find((i) => i.id === itemId);
    if (!itemToExecute) {
      // If not learned by agent, try to get from global registry
      itemToExecute = registry.getItem(itemId) as IMantra; // Assuming items in registry are IMantra compatible
    }

    if (!itemToExecute) {
      this.status = 'idle';
      Logger.error(
        `Agent ${this.name} does not know Item with ID: ${itemId}, and it's not in the global registry.`
      );
      throw new Error(`Item with ID ${itemId} not found.`);
    }

    try {
      Logger.log(`Executing Item: ${itemToExecute.name}...`);
      // Pass ideContext, rules, and params to the item's execute method
      const result = await itemToExecute.execute(ideContext, rules, params);
      Logger.log(`Item ${itemToExecute.name} executed successfully.`);
      this.lastItemExecutionResult = result; // Store the result
      this.status = 'idle';
      return result;
    } catch (error) {
      this.status = 'idle';
      Logger.error(
        `Error executing Item ${itemToExecute.name} (ID: ${itemId}) for Agent ${this.name}:`,
        error
      );
      throw error;
    }
  }
}

// Update IAgent interface definition if it's in the same file or a shared one
// For this example, assuming IAgent is defined elsewhere and its methods will be updated accordingly.
// If IAgent is defined in this file, it should be:
/*
export interface IAgent {
  id: string;
  name: string;
  learnedItems: IMantra[];
  lastItemExecutionResult?: any;
  status?: string;
  capabilities?: string[];
  learnItem(item: IMantra): Promise<void>;
  forgetItem(itemId: string): Promise<void>;
  executeRegisteredItem(
    itemId: string,
    ideContext?: IDEContext,
    rules?: IRule[],
    params?: any
  ): Promise<any | void>;
}
*/