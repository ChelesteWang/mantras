// src/core/mantra-registry.ts
import { IMantra } from '../interfaces/mantra.interface';

/**
 * A registry to manage and provide access to available Mantras.
 */
export class MantraRegistry {
  private mantras: Map<string, IMantra> = new Map();

  /**
   * Registers a new Mantra in the registry.
   * @param mantra - The Mantra instance to register.
   * @throws Error if a Mantra with the same ID already exists.
   */
  registerMantra(mantra: IMantra): void {
    if (this.mantras.has(mantra.id)) {
      throw new Error(`Mantra with ID "${mantra.id}" already registered.`);
    }
    this.mantras.set(mantra.id, mantra);
    console.log(`Mantra registered: ${mantra.name} (ID: ${mantra.id})`);
  }

  /**
   * Retrieves a Mantra by its ID.
   * @param mantraId - The ID of the Mantra to retrieve.
   * @returns The Mantra instance, or undefined if not found.
   */
  getMantra(mantraId: string): IMantra | undefined {
    return this.mantras.get(mantraId);
  }

  /**
   * Unregisters a Mantra from the registry.
   * @param mantraId - The ID of the Mantra to unregister.
   * @returns True if the Mantra was found and unregistered, false otherwise.
   */
  unregisterMantra(mantraId: string): boolean {
    if (this.mantras.has(mantraId)) {
      const mantraName = this.mantras.get(mantraId)?.name;
      this.mantras.delete(mantraId);
      console.log(`Mantra unregistered: ${mantraName} (ID: ${mantraId})`);
      return true;
    }
    return false;
  }

  /**
   * Lists all registered Mantras.
   * @returns An array of all Mantra instances.
   */
  listMantras(): IMantra[] {
    return Array.from(this.mantras.values());
  }

  /**
   * Clears all Mantras from the registry.
   */
  clearAllMantras(): void {
    this.mantras.clear();
    console.log("All Mantras cleared from registry.");
  }
}

// Export a singleton instance of the registry
export const mantraRegistry = new MantraRegistry();