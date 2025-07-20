import { ActionableTool } from '../types.js';

export const initTool: ActionableTool = {
  id: 'init',
  type: 'tool',
  name: 'Mantra MCP System Initializer',
  description:
    'Initialize and provide comprehensive overview of the Mantra MCP system for AI agents',
  parameters: {
    type: 'object',
    properties: {
      includeExamples: {
        type: 'boolean',
        description: 'Whether to include usage examples',
        default: true,
      },
      includeArchitecture: {
        type: 'boolean',
        description: 'Whether to include system architecture details',
        default: false,
      },
      includePhilosophy: {
        type: 'boolean',
        description: 'Whether to include design philosophy and principles',
        default: true,
      },
    },
    required: [],
  },
  async execute(args: {
    includeExamples?: boolean;
    includeArchitecture?: boolean;
    includePhilosophy?: boolean;
  }): Promise<any> {
    const { includeExamples = true, includeArchitecture = false, includePhilosophy = true } = args;

    const systemOverview = {
      name: 'Mantra MCP (Model Context Protocol) System',
      version: '2.0.0',
      description: 'A comprehensive AI asset management and persona summoning system',

      coreCapabilities: {
        assetManagement: {
          description: 'Manage and retrieve various AI assets',
          types: ['personas', 'prompts', 'tools', 'prompt-templates'],
          tools: ['list_assets', 'get_asset'],
        },

        personaSystem: {
          description: 'Summon and manage AI personas with specific capabilities',
          features: [
            'Persona summoning by ID or intent',
            'Session management',
            'Persona synthesis (combining multiple personas)',
            'Active session tracking',
          ],
          tools: [
            'list_personas',
            'summon_persona',
            'analyze_user_intent',
            'get_persona_options',
            'evaluate_persona_match',
            'list_active_sessions',
            'get_session',
            'release_session',
            'synthesize_persona',
          ],
        },

        mantraTemplates: {
          description: 'Apply prompt engineering templates and techniques',
          features: [
            'Template-based prompt generation',
            'Category-based filtering',
            'Dynamic parameter substitution',
          ],
          tools: ['list_mantras', 'apply_mantra'],
        },

        executionPlanning: {
          description: 'Enhanced queue-based task management and execution planning',
          features: [
            'Automatic task decomposition',
            'Queue-based task management',
            'Dependency tracking',
            'Status monitoring',
            'Context-aware planning',
            'Step-by-step execution',
          ],
          tools: [
            'create_execution_plan',
            'execute_plan',
            'get_project_context',
            'get_task_status',
            'update_task_status',
          ],
        },
      },

      quickStart: {
        step1: "Use 'list_assets' to see all available resources",
        step2: "Use 'list_personas' to see available AI personas",
        step3:
          "Use 'analyze_user_intent' to analyze needs, then 'summon_persona' to activate a persona",
        step4: "Use 'list_mantras' to see available prompt templates",
        step5: "Use 'apply_mantra' to generate optimized prompts",
      },

      commonWorkflows: [
        {
          name: 'Persona-based Interaction',
          steps: [
            '1. Call list_personas to see available personas',
            '2. Call analyze_user_intent to understand requirements, then summon_persona with specific personaId',
            '3. Use the summoned persona for specialized tasks',
            '4. Call release_session when done',
          ],
        },
        {
          name: 'Prompt Engineering',
          steps: [
            '1. Call list_mantras to see available templates',
            '2. Call apply_mantra with template name and required inputs',
            '3. Use the generated prompt for your specific task',
          ],
        },
        {
          name: 'Complex Task Planning',
          steps: [
            '1. Call create_execution_plan with your task description',
            '2. Review the generated plan',
            '3. Call execute_plan to run the plan step by step',
          ],
        },
      ],
    };

    const result: any = {
      status: 'Mantra MCP System Initialized',
      timestamp: new Date().toISOString(),
      overview: systemOverview,
    };

    // 融入设计哲学理念
    if (includePhilosophy) {
      result.designPhilosophy = {
        coreMantra: '🌟 简约而不简单，智慧而不复杂 🌟',

        foundationalPrinciples: {
          occamsRazor: {
            principle: "如无必要，勿增实体 (Occam's Razor)",
            manifestation: '每个人格、工具和功能都有其独特价值，避免冗余和复杂性',
            implementation: [
              '🎭 8个精心设计的人格，各司其职，互不重叠',
              '🛠️ 最小化工具集，每个工具都有明确目的',
              '🧠 简洁的API设计，一个调用解决一个问题',
              '💡 智能推荐系统，自动选择最合适的工具',
            ],
            wisdom: '复杂性是设计的敌人，简约是智慧的体现',
          },

          designFirst: {
            principle: '设计先行 (Design First)',
            manifestation: '深思熟虑的架构设计，而非功能堆砌',
            implementation: [
              '🎯 意图分析驱动的交互模式',
              '🏗️ 模块化架构，清晰的职责分离',
              '🔄 可扩展的人格系统，支持动态组合',
              '📐 一致的接口设计，降低学习成本',
            ],
            wisdom: '好的设计是看不见的，用户只会感受到流畅和自然',
          },

          dualThinking: {
            principle: '快慢思考 (Fast & Slow Thinking)',
            manifestation: '系统一思维的快速响应 + 系统二思维的深度分析',
            implementation: [
              '⚡ 快速模式：即时人格召唤，直觉式工具推荐',
              '🧠 慢速模式：深度意图分析，复杂任务规划',
              '🔀 智能切换：根据任务复杂度自动选择思维模式',
              '🎭 人格协作：不同人格代表不同思维方式',
            ],
            wisdom: '有时需要闪电般的直觉，有时需要深海般的思考',
          },

          emergentComplexity: {
            principle: '涌现复杂性 (Emergent Complexity)',
            manifestation: '简单组件的智能组合产生复杂能力',
            implementation: [
              '🧩 人格合成：组合多个简单人格创造新能力',
              '🔗 工具链：简单工具的有序组合解决复杂问题',
              '🌊 上下文感知：系统随着使用变得更加智能',
              '🎨 创意涌现：不同领域知识的交叉融合',
            ],
            wisdom: '真正的智能不是预编程的，而是从交互中涌现的',
          },
        },

        practicalWisdom: {
          userExperience: {
            principle: '用户体验至上',
            practices: [
              '🎯 一次调用，精准满足需求',
              '🤖 智能推荐，减少选择负担',
              '💬 自然对话，降低技术门槛',
              '🔄 渐进式披露，避免信息过载',
            ],
          },

          systemResilience: {
            principle: '系统韧性设计',
            practices: [
              '🛡️ 优雅降级，核心功能始终可用',
              '🔧 自我修复，智能错误处理',
              '📊 持续学习，从使用中优化',
              '🌐 分布式思维，避免单点故障',
            ],
          },

          cognitiveErgonomics: {
            principle: '认知工效学',
            practices: [
              '🧠 符合人类思维模式的交互设计',
              '⚖️ 认知负荷的合理分配',
              '🎭 人格化交互，增强情感连接',
              '🔍 渐进式探索，支持不同熟练度用户',
            ],
          },
        },

        designMetaphors: {
          orchestra: '🎼 系统如交响乐团，每个人格都是专业乐手，协调演奏',
          garden: '🌱 功能如花园生态，简单元素组合成复杂美景',
          conversation: '💬 交互如深度对话，理解、共鸣、创造价值',
          journey: '🗺️ 使用如探索之旅，系统是智慧向导，用户是勇敢探险家',
        },

        philosophicalQuotes: [
          "💫 '简约是复杂的终极形式' - 达芬奇",
          "🎯 '设计不是外观，设计是工作原理' - 乔布斯",
          "🧠 '我们的思维有两套系统：快思考和慢思考' - 卡尼曼",
          "🌊 '整体大于部分之和' - 亚里士多德",
          "🎭 '技术的最高境界是让人忘记技术的存在' - 老子",
        ],
      };
    }

    if (includeExamples) {
      result.examples = {
        summonPersona: {
          description: 'Summon a technical expert persona',
          call: 'summon_persona',
          parameters: {
            intent: 'technical',
            customParams: { expertise: 'software_development' },
          },
        },

        applyMantra: {
          description: 'Apply a Chain of Thought template',
          call: 'apply_mantra',
          parameters: {
            templateName: 'chain_of_thought',
            inputs: {
              problem: 'How to optimize database queries',
              context: 'E-commerce application with high traffic',
            },
          },
        },

        createPlan: {
          description: 'Create execution plan for a complex task',
          call: 'create_execution_plan',
          parameters: {
            userRequest: 'Build a REST API for user management',
            includeContext: true,
          },
        },
      };
    }

    if (includeArchitecture) {
      result.architecture = {
        components: {
          assetRepository: 'Manages storage and retrieval of all assets',
          personaSummoner: 'Handles persona lifecycle and session management',
          promptTemplates: 'Provides prompt engineering templates',
          toolExecutor: 'Executes registered tools and validates parameters',
          unifiedAssetManager: 'Coordinates all asset types and operations',
        },

        dataFlow: [
          '1. Client calls MCP tool through server.tool() interface',
          '2. Server validates parameters using Zod schemas',
          '3. Tool logic accesses appropriate managers (PersonaSummoner, AssetRepository, etc.)',
          '4. Managers interact with data sources and apply business logic',
          '5. Results are formatted and returned to client',
        ],

        extensibility: {
          addingTools: 'Implement ActionableTool interface and register in ToolExecutor',
          addingPersonas: 'Add persona definitions to asset repository',
          addingTemplates: 'Add templates to PROMPT_TEMPLATES constant',
        },
      };
    }

    // 添加智能引导和使用建议
    result.intelligentGuidance = {
      whenToUseMantras: {
        description: 'AI agents should actively use Mantras tools in these scenarios:',
        scenarios: [
          {
            userIntent: '需要专业分析或数据处理',
            recommendedAction: "analyze_user_intent then summon_persona with 'analyst'",
            reason: 'Analyst persona provides structured, data-driven insights',
          },
          {
            userIntent: '创意写作、内容创作、营销文案',
            recommendedAction: "analyze_user_intent then summon_persona with 'creative'",
            reason: 'Creative persona excels at engaging content creation',
          },
          {
            userIntent: '技术问题、编程、架构设计',
            recommendedAction: "analyze_user_intent then summon_persona with 'tech-expert'",
            reason: 'Tech Expert provides detailed technical guidance',
          },
          {
            userIntent: '情感支持、理解、沟通建议',
            recommendedAction: "analyze_user_intent then summon_persona with 'therapist'",
            reason: 'Therapist persona offers empathetic understanding',
          },
          {
            userIntent: '复杂任务规划、项目管理',
            recommendedAction: 'create_execution_plan',
            reason: 'Breaks down complex tasks into manageable steps',
          },
          {
            userIntent: '提示工程、优化对话',
            recommendedAction: 'list_mantras then apply_mantra',
            reason: 'Leverage proven prompt engineering templates',
          },
        ],
      },

      proactiveRecommendations: {
        description:
          'AI agents should proactively suggest Mantras tools when detecting these patterns:',
        patterns: [
          {
            pattern: '用户询问复杂问题',
            suggestion:
              'Consider using create_execution_plan to break down the task systematically',
          },
          {
            pattern: '用户需要专业建议',
            suggestion:
              'Use analyze_user_intent to understand needs, then summon appropriate persona for specialized expertise',
          },
          {
            pattern: '用户表达情感或需要支持',
            suggestion: 'Activate therapist persona for empathetic assistance',
          },
          {
            pattern: '用户讨论技术话题',
            suggestion: 'Engage tech-expert persona for detailed technical guidance',
          },
          {
            pattern: '用户需要创意或写作帮助',
            suggestion: 'Summon creative persona for imaginative solutions',
          },
        ],
      },

      usageIncentives: {
        description: 'Benefits of using Mantras system:',
        benefits: [
          '🎭 Specialized expertise: Each persona brings domain-specific knowledge',
          '🧠 Enhanced reasoning: Personas provide focused thinking patterns',
          '💡 Better solutions: Tailored approaches for different problem types',
          '📈 Improved outcomes: Higher quality responses through specialization',
          '🔄 Adaptive assistance: Dynamic persona selection based on context',
        ],
      },
    };

    result.nextSteps = [
      "🚀 IMMEDIATE: Call 'analyze_user_intent' to understand needs, then 'summon_persona' for specialized help",
      "📋 EXPLORE: Call 'list_personas' to see all available AI specialists",
      "🛠️ ENHANCE: Call 'list_mantras' to discover prompt engineering templates",
      "🎯 PLAN: Use 'create_execution_plan' for complex multi-step tasks",
      '💡 TIP: Always analyze intent first, then choose the most suitable persona',
    ];

    return result;
  },
};
