// src/interfaces/item-config.interface.ts

/**
 * Represents the configuration for an Item (e.g., Mantra, Tool).
 * This interface is designed to hold key information suitable for YAML or Markdown representation.
 */
export interface ItemConfig {
  /**
   * A unique identifier for the Item.
   */
  id: string;

  /**
   * A human-readable name for the Item.
   */
  name: string;

  /**
   * A description of what this Item does or enables.
   */
  description: string;

  /**
   * Optional: Path to the TypeScript file that implements this item's execution logic.
   * This helps in linking the configuration to the actual executable code.
   */
  executionPath?: string;

  /**
   * Optional: Any metadata associated with the Item,
   * e.g., version, dependencies, required agent capabilities, supported languages, tags.
   * This should be simple key-value pairs suitable for YAML.
   */
  metadata?: Record<string, any>;
}