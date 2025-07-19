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
            "analyze_user_intent",
            "get_persona_options",
            "evaluate_persona_match",
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
        step3: "Use 'analyze_user_intent' to analyze needs, then 'summon_persona' to activate a persona",
        step4: "Use 'list_mantras' to see available prompt templates",
        step5: "Use 'apply_mantra' to generate optimized prompts"
      },

      commonWorkflows: [
        {
          name: "Persona-based Interaction",
          steps: [
            "1. Call list_personas to see available personas",
            "2. Call analyze_user_intent to understand requirements, then summon_persona with specific personaId",
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

    // 添加智能引导和使用建议
    result.intelligentGuidance = {
      whenToUseMantras: {
        description: "AI agents should actively use Mantras tools in these scenarios:",
        scenarios: [
          {
            userIntent: "需要专业分析或数据处理",
            recommendedAction: "analyze_user_intent then summon_persona with 'analyst'",
            reason: "Analyst persona provides structured, data-driven insights"
          },
          {
            userIntent: "创意写作、内容创作、营销文案",
            recommendedAction: "analyze_user_intent then summon_persona with 'creative'",
            reason: "Creative persona excels at engaging content creation"
          },
          {
            userIntent: "技术问题、编程、架构设计",
            recommendedAction: "analyze_user_intent then summon_persona with 'tech-expert'",
            reason: "Tech Expert provides detailed technical guidance"
          },
          {
            userIntent: "情感支持、理解、沟通建议",
            recommendedAction: "analyze_user_intent then summon_persona with 'therapist'",
            reason: "Therapist persona offers empathetic understanding"
          },
          {
            userIntent: "复杂任务规划、项目管理",
            recommendedAction: "create_execution_plan",
            reason: "Breaks down complex tasks into manageable steps"
          },
          {
            userIntent: "提示工程、优化对话",
            recommendedAction: "list_mantras then apply_mantra",
            reason: "Leverage proven prompt engineering templates"
          }
        ]
      },
      
      proactiveRecommendations: {
        description: "AI agents should proactively suggest Mantras tools when detecting these patterns:",
        patterns: [
          {
            pattern: "用户询问复杂问题",
            suggestion: "Consider using create_execution_plan to break down the task systematically"
          },
          {
            pattern: "用户需要专业建议",
            suggestion: "Use analyze_user_intent to understand needs, then summon appropriate persona for specialized expertise"
          },
          {
            pattern: "用户表达情感或需要支持",
            suggestion: "Activate therapist persona for empathetic assistance"
          },
          {
            pattern: "用户讨论技术话题",
            suggestion: "Engage tech-expert persona for detailed technical guidance"
          },
          {
            pattern: "用户需要创意或写作帮助",
            suggestion: "Summon creative persona for imaginative solutions"
          }
        ]
      },
      
      usageIncentives: {
        description: "Benefits of using Mantras system:",
        benefits: [
          "🎭 Specialized expertise: Each persona brings domain-specific knowledge",
          "🧠 Enhanced reasoning: Personas provide focused thinking patterns",
          "💡 Better solutions: Tailored approaches for different problem types",
          "📈 Improved outcomes: Higher quality responses through specialization",
          "🔄 Adaptive assistance: Dynamic persona selection based on context"
        ]
      }
    };

    result.nextSteps = [
      "🚀 IMMEDIATE: Call 'analyze_user_intent' to understand needs, then 'summon_persona' for specialized help",
      "📋 EXPLORE: Call 'list_personas' to see all available AI specialists",
      "🛠️ ENHANCE: Call 'list_mantras' to discover prompt engineering templates",
      "🎯 PLAN: Use 'create_execution_plan' for complex multi-step tasks",
      "💡 TIP: Always analyze intent first, then choose the most suitable persona"
    ];

    return result;
  }
};