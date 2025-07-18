import { ActionableTool } from '../types.js';

export const initTool: ActionableTool = {
  id: 'init',
  type: 'tool',
  name: 'Mantra MCP System Initializer',
  description: 'Initialize and provide comprehensive overview of the Mantra MCP system for AI agents',
  parameters: {
    type: 'object',
    properties: {
      includeExamples: {
        type: 'boolean',
        description: 'Whether to include usage examples',
        default: true
      },
      includeArchitecture: {
        type: 'boolean', 
        description: 'Whether to include system architecture details',
        default: false
      }
    },
    required: []
  },
  async execute(args: { includeExamples?: boolean; includeArchitecture?: boolean }): Promise<any> {
    const { includeExamples = true, includeArchitecture = false } = args;

    const systemOverview = {
      name: "Mantra MCP (Model Context Protocol) System",
      version: "2.0.0",
      description: "A comprehensive AI asset management and persona summoning system",
      
      coreCapabilities: {
        assetManagement: {
          description: "Manage and retrieve various AI assets",
          types: ["personas", "prompts", "tools", "prompt-templates"],
          tools: ["list_assets", "get_asset"]
        },
        
        personaSystem: {
          description: "Summon and manage AI personas with specific capabilities",
          features: [
            "Persona summoning by ID or intent",
            "Session management",
            "Persona synthesis (combining multiple personas)",
            "Active session tracking"
          ],
          tools: [
            "list_personas",
            "summon_persona", 
            "summon_by_intent",
            "list_active_sessions",
            "get_session",
            "release_session",
            "synthesize_persona"
          ]
        },
        
        mantraTemplates: {
          description: "Apply prompt engineering templates and techniques",
          features: [
            "Template-based prompt generation",
            "Category-based filtering",
            "Dynamic parameter substitution"
          ],
          tools: ["list_mantras", "apply_mantra"]
        },
        
        executionPlanning: {
          description: "Create and execute complex task plans",
          features: [
            "Automatic plan generation",
            "Context-aware planning",
            "Step-by-step execution"
          ],
          tools: ["create_execution_plan", "execute_plan", "get_project_context"]
        }
      },

      quickStart: {
        step1: "Use 'list_assets' to see all available resources",
        step2: "Use 'list_personas' to see available AI personas", 
        step3: "Use 'summon_persona' or 'summon_by_intent' to activate a persona",
        step4: "Use 'list_mantras' to see available prompt templates",
        step5: "Use 'apply_mantra' to generate optimized prompts"
      },

      commonWorkflows: [
        {
          name: "Persona-based Interaction",
          steps: [
            "1. Call list_personas to see available personas",
            "2. Call summon_persona with specific personaId or summon_by_intent with your goal",
            "3. Use the summoned persona for specialized tasks",
            "4. Call release_session when done"
          ]
        },
        {
          name: "Prompt Engineering",
          steps: [
            "1. Call list_mantras to see available templates",
            "2. Call apply_mantra with template name and required inputs",
            "3. Use the generated prompt for your specific task"
          ]
        },
        {
          name: "Complex Task Planning",
          steps: [
            "1. Call create_execution_plan with your task description",
            "2. Review the generated plan",
            "3. Call execute_plan to run the plan step by step"
          ]
        }
      ]
    };

    let result: any = {
      status: "Mantra MCP System Initialized",
      timestamp: new Date().toISOString(),
      overview: systemOverview
    };

    if (includeExamples) {
      result.examples = {
        summonPersona: {
          description: "Summon a technical expert persona",
          call: "summon_persona",
          parameters: {
            intent: "technical",
            customParams: { expertise: "software_development" }
          }
        },
        
        applyMantra: {
          description: "Apply a Chain of Thought template",
          call: "apply_mantra", 
          parameters: {
            templateName: "chain_of_thought",
            inputs: {
              problem: "How to optimize database queries",
              context: "E-commerce application with high traffic"
            }
          }
        },
        
        createPlan: {
          description: "Create execution plan for a complex task",
          call: "create_execution_plan",
          parameters: {
            userRequest: "Build a REST API for user management",
            includeContext: true
          }
        }
      };
    }

    if (includeArchitecture) {
      result.architecture = {
        components: {
          assetRepository: "Manages storage and retrieval of all assets",
          personaSummoner: "Handles persona lifecycle and session management", 
          promptTemplates: "Provides prompt engineering templates",
          toolExecutor: "Executes registered tools and validates parameters",
          unifiedAssetManager: "Coordinates all asset types and operations"
        },
        
        dataFlow: [
          "1. Client calls MCP tool through server.tool() interface",
          "2. Server validates parameters using Zod schemas",
          "3. Tool logic accesses appropriate managers (PersonaSummoner, AssetRepository, etc.)",
          "4. Managers interact with data sources and apply business logic",
          "5. Results are formatted and returned to client"
        ],
        
        extensibility: {
          addingTools: "Implement ActionableTool interface and register in ToolExecutor",
          addingPersonas: "Add persona definitions to asset repository",
          addingTemplates: "Add templates to PROMPT_TEMPLATES constant"
        }
      };
    }

    result.nextSteps = [
      "Call 'list_assets' to explore available resources",
      "Call 'list_personas' to see AI personas you can summon",
      "Call 'list_mantras' to see prompt engineering templates",
      "Start with 'summon_by_intent' if you have a specific goal in mind"
    ];

    return result;
  }
};