// src/interfaces/agent-config.interface.ts
import { ItemConfig } from '../../tools/interfaces/item-config.interface';

/**
 * Represents the configuration for an Agent.
 * This interface is designed to hold key information suitable for YAML or Markdown representation.
 */
export interface AgentConfig {
  /**
   * A unique identifier for the Agent.
   */
  id: string;

  /**
   * A human-readable name for the Agent.
   */
  name: string;

  /**
   * The current status of the Agent (e.g., 'idle', 'processing').
   */
  status?: string;

  /**
   * A list of capabilities or skills the Agent possesses.
   */
  capabilities?: string[];

  /**
   * A list of configurations for items (e.g., Mantras, Tools) that this Agent is pre-configured with.
   * These items might be fully defined here or reference existing item configurations.
   */
  items?: ItemConfig[];
}