#!/usr/bin/env node

import { Command } from 'commander';
import { UnifiedAssetManager } from '../dist/core/assets/unified-asset-manager.js';
import { RemoteAssetRepository } from '../dist/core/assets/asset-repository.js';
import { AssetFactory } from '../dist/core/assets/asset-factory.js';
import { logger } from '../dist/infrastructure/logging/logger.js';
import * as fs from 'fs/promises';
import * as path from 'path';

const program = new Command();

// 初始化资产管理器
const repository = new RemoteAssetRepository();
const manager = new UnifiedAssetManager(repository);

program
  .name('mantras-cli')
  .description('Mantras资产管理命令行工具')
  .version('2.0.0');

// 列出所有资产
program
  .command('list')
  .description('列出所有资产')
  .option('-t, --type <type>', '按类型过滤 (persona|prompt-template|tool)')
  .option('-c, --category <category>', '按分类过滤')
  .action(async (options) => {
    try {
      await manager.loadAssets();
      let assets = manager.getAllAssets();
      
      if (options.type) {
        assets = manager.getAssetsByType(options.type);
      }
      
      if (options.category) {
        assets = assets.filter(asset => 
          asset.type === 'prompt-template' && asset.category === options.category
        );
      }
      
      console.table(assets.map(asset => ({
        ID: asset.id,
        类型: asset.type,
        名称: asset.name,
        描述: asset.description?.substring(0, 50) + '...'
      })));
      
      console.log(`\n总计: ${assets.length} 个资产`);
    } catch (error) {
      console.error('错误:', error.message);
    }
  });

// 验证资产
program
  .command('validate')
  .description('验证资产完整性')
  .option('-f, --file <file>', '验证指定文件')
  .option('-d, --dir <dir>', '验证指定目录')
  .action(async (options) => {
    try {
      let assets = [];
      
      if (options.file) {
        const content = await fs.readFile(options.file, 'utf-8');
        assets = [JSON.parse(content)];
      } else if (options.dir) {
        await manager.loadAssets();
        assets = manager.getAllAssets();
      } else {
        await manager.loadAssets();
        assets = manager.getAllAssets();
      }
      
      const results = assets.map(asset => {
        const validation = AssetFactory.validateAsset(asset);
        return {
          id: asset.id,
          valid: validation.valid,
          errors: validation.errors
        };
      });
      
      const validCount = results.filter(r => r.valid).length;
      const invalidCount = results.length - validCount;
      
      console.log(`验证结果:`);
      console.log(`✅ 有效: ${validCount}`);
      console.log(`❌ 无效: ${invalidCount}`);
      
      if (invalidCount > 0) {
        console.log('\n无效资产详情:');
        results.filter(r => !r.valid).forEach(result => {
          console.log(`\n❌ ${result.id}:`);
          result.errors.forEach(error => console.log(`   - ${error}`));
        });
      }
    } catch (error) {
      console.error('错误:', error.message);
    }
  });

// 创建新资产
program
  .command('create')
  .description('创建新资产')
  .option('-t, --type <type>', '资产类型 (persona|prompt-template|tool)', 'persona')
  .option('-i, --interactive', '交互式创建')
  .action(async (options) => {
    try {
      if (options.interactive) {
        // 交互式创建逻辑
        console.log('🎭 交互式资产创建向导');
        console.log('功能开发中...');
      } else {
        // 基于模板创建
        const templatePath = path.join(process.cwd(), 'templates', `${options.type}.template.json`);
        const template = await fs.readFile(templatePath, 'utf-8');
        const newAssetPath = path.join(process.cwd(), 'assets', `${options.type}s`, 'new-asset.json');
        
        await fs.writeFile(newAssetPath, template);
        console.log(`✅ 已创建新的${options.type}模板: ${newAssetPath}`);
        console.log('请编辑该文件并填入具体信息');
      }
    } catch (error) {
      console.error('错误:', error.message);
    }
  });

// 导入资产
program
  .command('import')
  .description('导入资产')
  .argument('<source>', '源文件或目录路径')
  .option('-v, --validate', '导入前验证', true)
  .action(async (source, options) => {
    try {
      let count = 0;
      const stats = await fs.stat(source);
      
      if (stats.isDirectory()) {
        count = await manager.importFromDirectory(source);
      } else {
        count = await manager.importFromFile(source);
      }
      
      console.log(`✅ 成功导入 ${count} 个资产`);
    } catch (error) {
      console.error('错误:', error.message);
    }
  });

// 导出资产
program
  .command('export')
  .description('导出资产')
  .argument('<output>', '输出文件或目录路径')
  .option('-t, --type <type>', '导出指定类型的资产')
  .option('--split', '按类型分别导出到不同文件')
  .action(async (output, options) => {
    try {
      await manager.loadAssets();
      
      if (options.split) {
        await manager.exportByType(output);
        console.log(`✅ 已按类型导出资产到: ${output}`);
      } else {
        await manager.exportToFile(output, options.type);
        console.log(`✅ 已导出资产到: ${output}`);
      }
    } catch (error) {
      console.error('错误:', error.message);
    }
  });

// 统计信息
program
  .command('stats')
  .description('显示资产统计信息')
  .action(async () => {
    try {
      await manager.loadAssets();
      const stats = manager.getAssetStats();
      
      console.log('📊 资产统计信息:');
      console.table(stats);
      
      const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
      console.log(`\n总计: ${total} 个资产`);
    } catch (error) {
      console.error('错误:', error.message);
    }
  });

// 搜索资产
program
  .command('search')
  .description('搜索资产')
  .argument('<query>', '搜索关键词')
  .option('-t, --type <type>', '限制搜索类型')
  .action(async (query, options) => {
    try {
      await manager.loadAssets();
      const results = manager.searchAssets(query, options.type);
      
      if (results.length === 0) {
        console.log('未找到匹配的资产');
        return;
      }
      
      console.log(`🔍 找到 ${results.length} 个匹配的资产:`);
      console.table(results.map(asset => ({
        ID: asset.id,
        类型: asset.type,
        名称: asset.name,
        描述: asset.description?.substring(0, 50) + '...'
      })));
    } catch (error) {
      console.error('错误:', error.message);
    }
  });

program.parse();