#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * 资产清理工具 - 删除已有对应 Markdown 文件的 JSON 文件
 */
class AssetCleanupTool {
  constructor() {
    this.assetsDir = './assets';
  }

  async run() {
    console.log('🧹 Mantras 资产清理工具');
    console.log('===================================\n');
    
    try {
      // 分析需要清理的文件
      const cleanupPlan = await this.analyzeCleanup();
      
      if (cleanupPlan.totalToClean === 0) {
        console.log('🎉 没有需要清理的重复文件！');
        return;
      }
      
      // 显示清理计划
      this.displayCleanupPlan(cleanupPlan);
      
      // 执行清理
      await this.executeCleanup(cleanupPlan);
      
      console.log('\n✅ 清理完成！');
      console.log('📝 现在只保留 Markdown 格式的资产文件');
      
    } catch (error) {
      console.error('❌ 清理失败:', error.message);
      process.exit(1);
    }
  }

  async analyzeCleanup() {
    console.log('🔍 分析需要清理的文件...\n');
    
    const assetTypes = ['personas', 'prompt-templates', 'prompts'];
    const cleanupPlan = {
      byType: {},
      totalToClean: 0,
      files: []
    };
    
    for (const assetType of assetTypes) {
      const typeDir = path.join(this.assetsDir, assetType);
      
      try {
        const files = await fs.readdir(typeDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        const toClean = [];
        
        for (const jsonFile of jsonFiles) {
          const mdFile = jsonFile.replace('.json', '.md');
          const mdPath = path.join(typeDir, mdFile);
          
          try {
            await fs.access(mdPath);
            // MD 文件存在，JSON 文件可以删除
            toClean.push({
              jsonFile,
              jsonPath: path.join(typeDir, jsonFile),
              mdFile,
              mdPath
            });
          } catch {
            // MD 文件不存在，保留 JSON 文件
            console.log(`⚠️  保留 ${assetType}/${jsonFile} (没有对应的 MD 文件)`);
          }
        }
        
        if (toClean.length > 0) {
          cleanupPlan.byType[assetType] = toClean;
          cleanupPlan.totalToClean += toClean.length;
          cleanupPlan.files.push(...toClean);
          
          console.log(`📁 ${assetType}: ${toClean.length} 个文件可以清理`);
          toClean.forEach(item => {
            console.log(`   - ${item.jsonFile} (有对应的 ${item.mdFile})`);
          });
        } else {
          console.log(`📁 ${assetType}: 无需清理`);
        }
        
      } catch (error) {
        console.log(`⚠️  跳过 ${assetType}: ${error.message}`);
      }
    }
    
    return cleanupPlan;
  }

  displayCleanupPlan(cleanupPlan) {
    console.log('\n📋 清理计划:');
    console.log(`总共需要删除 ${cleanupPlan.totalToClean} 个 JSON 文件\n`);
    
    for (const [assetType, files] of Object.entries(cleanupPlan.byType)) {
      console.log(`🗂️  ${assetType}:`);
      files.forEach(item => {
        console.log(`   🗑️  删除 ${item.jsonFile}`);
        console.log(`   ✅ 保留 ${item.mdFile}`);
      });
      console.log('');
    }
  }

  async executeCleanup(cleanupPlan) {
    console.log('🧹 开始清理...\n');
    
    let deleted = 0;
    let failed = 0;
    
    for (const item of cleanupPlan.files) {
      try {
        await fs.unlink(item.jsonPath);
        console.log(`✅ 删除: ${item.jsonFile}`);
        deleted++;
      } catch (error) {
        console.error(`❌ 删除失败 ${item.jsonFile}:`, error.message);
        failed++;
      }
    }
    
    console.log(`\n📊 清理结果:`);
    console.log(`   成功删除: ${deleted}`);
    console.log(`   删除失败: ${failed}`);
  }
}

// 运行清理工具
if (require.main === module) {
  const cleanupTool = new AssetCleanupTool();
  cleanupTool.run().catch(console.error);
}

module.exports = AssetCleanupTool;