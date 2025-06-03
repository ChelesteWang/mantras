// src/interfaces/registry.interface.ts
import { IItem } from './index'; // Or directly from './mantra.interface' if IItem is only IMantra

/**
 * Defines the contract for a registry that manages items (Mantras, Tools, etc.).
 */
export interface IRegistry {
  /**
   * Registers an item in the registry.
   * @param item - The item to register.
   */
  registerItem(item: IItem): void;

  /**
   * Retrieves an item by its ID.
   * @param itemId - The ID of the item to retrieve.
   * @returns The item instance, or undefined if not found.
   */
  getItem(itemId: string): IItem | undefined;

  /**
   * Unregisters an item from the registry.
   * @param itemId - The ID of the item to unregister.
   * @returns True if the item was found and unregistered, false otherwise.
   */
  unregisterItem(itemId: string): boolean;

  /**
   * Lists all registered items.
   * @returns An array of all item instances.
   */
  listItems(): IItem[];

  /**
   * Clears all items from the registry.
   */
  clearAllItems(): void;
}