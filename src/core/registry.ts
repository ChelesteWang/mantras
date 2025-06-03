// src/core/registry.ts
import { IMantra } from '../tools/interfaces/mantra.interface';
import { IItem } from '../interfaces'; // Assuming IItem is a more general interface still in src/interfaces or needs to be moved/created
import { IRegistry } from '../interfaces/registry.interface'; // This path seems correct if IRegistry remains in src/interfaces
import { Logger } from './logger';

/**
 * A generic registry to manage and provide access to items (e.g., Mantras, Tools, Services).
 */
export class Registry {
  private items: Map<string, any> = new Map(); // Using 'any' for now, can be a generic type T

  /**
   * Registers a new Mantra in the registry.
   * @param mantra - The Mantra instance to register.
   * @throws Error if a Mantra with the same ID already exists.
   */
  registerItem(item: any): void { // Assuming 'item' has an 'id' and 'name' property like IMantra
    if (this.items.has(item.id)) {
      throw new Error(`Item with ID "${item.id}" already registered.`);
    }
    this.items.set(item.id, item);
    Logger.log(`Item registered: ${item.name} (ID: ${item.id})`);
  }

  /**
   * Retrieves a Mantra by its ID.
   * @param mantraId - The ID of the Mantra to retrieve.
   * @returns The Mantra instance, or undefined if not found.
   */
  getItem(itemId: string): any | undefined {
    return this.items.get(itemId);
  }

  /**
   * Unregisters a Mantra from the registry.
   * @param mantraId - The ID of the Mantra to unregister.
   * @returns True if the Mantra was found and unregistered, false otherwise.
   */
  unregisterItem(itemId: string): boolean {
    if (this.items.has(itemId)) {
      const itemName = this.items.get(itemId)?.name || 'Unknown Item';
      this.items.delete(itemId);
      Logger.log(`Item unregistered: ${itemName} (ID: ${itemId})`);
      return true;
    }
    return false;
  }

  /**
   * Lists all registered Mantras.
   * @returns An array of all Mantra instances.
   */
  listItems(): any[] {
    return Array.from(this.items.values());
  }

  /**
   * Clears all Mantras from the registry.
   */
  public clearAllItems(): void {
    this.items.clear();
    Logger.log("All items cleared from registry.");
  }
}

// Export a singleton instance of the registry
export const registry = new Registry();