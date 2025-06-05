import * as path from 'path';
import { logger, config } from '@mantras-next/core';
import { CodeFormatterTool, FileReaderTool } from '@mantras-next/tools';
import { AgentManager, SimpleMemory } from '@mantras-next/agents';

/**
 * 简单示例应用
 * 演示如何使用Mantras-Next框架的核心功能
 */
async function main() {
  try {
    // 设置日志级别
    logger.setLevel(config.get('logLevel', 0)); // 0: DEBUG
    
    logger.info('启动Mantras-Next示例应用...');
    
    // 定义配置路径
    const configDir = path.join(__dirname, 'configs');
    logger.info(`配置目录: ${configDir}`);
    
    // 创建工具实例
    const codeFormatter = new CodeFormatterTool();
    const fileReader = new FileReaderTool();
    
    logger.info('已创建工具实例:');
    logger.info(`- ${codeFormatter.name} (${codeFormatter.id})`);
    logger.info(`- ${fileReader.name} (${fileReader.id})`);
    
    // 创建记忆系统
    const memory = new SimpleMemory({
      id: 'simple-memory-001',
      name: '简单记忆系统',
      description: '一个基本的记忆实现，使用Map存储数据',
      maxSize: 100,
      ttl: 3600000 // 1小时
    });
    
    logger.info(`已创建记忆系统: ${memory.name} (${memory.id})`);
    
    // 创建智能体管理器
    const agentManager = new AgentManager(configDir);
    
    // 列出所有加载的智能体
    const agents = agentManager.getAllAgents();
    logger.info(`已加载 ${agents.length} 个智能体:`);
    
    for (const agent of agents) {
      logger.info(`- ${agent.name} (${agent.id})`);
      
      // 添加工具
      agent.addTool(codeFormatter);
      agent.addTool(fileReader);
      
      // 设置记忆系统
      agent.setMemory(memory);
    }
    
    // 获取示例智能体
    const sampleAgentId = 'sample-agent-001';
    const sampleAgent = agentManager.getAgent(sampleAgentId);
    
    if (sampleAgent) {
      logger.info(`找到智能体: ${sampleAgent.name} (${sampleAgent.id})`);
      
      // 准备IDE上下文
      const ideContext = {
        workspace: {
          rootPath: process.cwd(),
          name: 'mantras-next'
        },
        currentFile: {
          path: __filename,
          language: 'typescript',
          content: '// 这是一个示例文件\nconsole.log("Hello, Mantras-Next!");'
        },
        project: {
          rootPath: process.cwd(),
          name: 'mantras-next',
          language: 'typescript'
        },
        user: {
          id: 'user-001',
          name: '示例用户'
        }
      };
      
      // 执行智能体
      logger.info('执行智能体任务...');
      
      const result = await sampleAgent.call({
        task: '格式化当前文件中的代码',
        ideContext,
        maxIterations: 5
      });
      
      // 输出结果
      logger.info('智能体执行结果:');
      logger.info(JSON.stringify(result.result, null, 2));
      
      // 输出执行步骤
      logger.info(`执行了 ${result.steps.length} 个步骤:`);
      
      for (const step of result.steps) {
        logger.info(`- 工具: ${step.action.tool}`);
        logger.info(`  思考: ${step.thought}`);
        logger.info(`  输入: ${JSON.stringify(step.action.input)}`);
        logger.info(`  观察: ${JSON.stringify(step.observation)}`);
      }
      
      // 输出指标
      logger.info('执行指标:');
      logger.info(`- 总Token数: ${result.metrics.totalTokens || 'N/A'}`);
      logger.info(`- 执行时长: ${result.metrics.duration}ms`);
      logger.info(`- 迭代次数: ${result.metrics.iterations}`);
      
      // 保存到记忆
      await memory.save('last_result', result);
      await memory.addContext({
        task: '格式化当前文件中的代码',
        result: result.result,
        timestamp: Date.now()
      });
      
      // 生成Markdown文档
      logger.info('生成智能体Markdown文档...');
      const docsDir = path.join(__dirname, 'docs');
      agentManager.generateAllAgentsMarkdown(docsDir);
      logger.info(`Markdown文档已生成到: ${docsDir}`);
    } else {
      logger.error(`未找到智能体: ${sampleAgentId}`);
    }
    
    logger.info('Mantras-Next示例应用执行完毕');
  } catch (error) {
    logger.error('执行过程中出错:', error);
    process.exit(1);
  }
}

// 执行主函数
main().catch(error => {
  console.error('未捕获的错误:', error);
  process.exit(1);
});