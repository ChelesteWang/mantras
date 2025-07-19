#!/usr/bin/env node

/**
 * 架构验证和快速开始脚本
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ArchitectureValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
  }

  /**
   * 运行完整验证
   */
  async validate() {
    console.log('🔍 开始架构验证...\n');

    this.checkProjectStructure();
    this.checkDependencies();
    this.checkConfiguration();
    this.checkCodeQuality();
    this.generateReport();
  }

  /**
   * 检查项目结构
   */
  checkProjectStructure() {
    console.log('📁 检查项目结构...');

    const requiredDirs = [
      'src/shared/container',
      'src/presentation/mcp',
      'src/shared/errors',
      'src/config',
      'docs'
    ];

    const requiredFiles = [
      'src/shared/container/di-container.ts',
      'src/presentation/mcp/tool-registry.ts',
      'src/shared/errors/error-handler.ts',
      'src/config/environment.ts',
      'src/server.ts',
      'docs/architecture-optimization-plan.md',
      'docs/implementation-guide.md'
    ];

    // 检查目录
    requiredDirs.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        this.errors.push(`缺少目录: ${dir}`);
      } else {
        console.log(`  ✅ ${dir}`);
      }
    });

    // 检查文件
    requiredFiles.forEach(file => {
      const fullPath = path.join(this.projectRoot, file);
      if (!fs.existsSync(fullPath)) {
        this.errors.push(`缺少文件: ${file}`);
      } else {
        console.log(`  ✅ ${file}`);
      }
    });

    // 检查待创建的工具文件
    const toolFiles = [
      'src/tools/asset.tools.ts',
      'src/tools/persona.tools.ts',
      'src/tools/mantra.tools.ts',
      'src/tools/memory.tools.ts'
    ];

    toolFiles.forEach(file => {
      const fullPath = path.join(this.projectRoot, file);
      if (!fs.existsSync(fullPath)) {
        this.suggestions.push(`建议创建: ${file}`);
      }
    });

    console.log('');
  }

  /**
   * 检查依赖项
   */
  checkDependencies() {
    console.log('📦 检查依赖项...');

    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
      );

      const requiredDeps = [
        '@modelcontextprotocol/sdk',
        'commander',
        'winston',
        'zod'
      ];

      const recommendedDeps = [
        'inversify',
        'reflect-metadata',
        'node-cache',
        'pino'
      ];

      // 检查必需依赖
      requiredDeps.forEach(dep => {
        if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
          console.log(`  ✅ ${dep}`);
        } else {
          this.errors.push(`缺少必需依赖: ${dep}`);
        }
      });

      // 检查推荐依赖
      recommendedDeps.forEach(dep => {
        if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
          console.log(`  ✅ ${dep} (推荐)`);
        } else {
          this.suggestions.push(`建议添加依赖: ${dep}`);
        }
      });

    } catch (error) {
      this.errors.push(`无法读取 package.json: ${error.message}`);
    }

    console.log('');
  }

  /**
   * 检查配置
   */
  checkConfiguration() {
    console.log('⚙️ 检查配置...');

    // 检查 TypeScript 配置
    const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      console.log('  ✅ tsconfig.json');
      
      try {
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
        
        // 检查推荐的编译选项
        const recommendedOptions = {
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        };

        Object.entries(recommendedOptions).forEach(([option, value]) => {
          if (tsconfig.compilerOptions?.[option] === value) {
            console.log(`    ✅ ${option}: ${value}`);
          } else {
            this.warnings.push(`建议设置 tsconfig.json 中的 ${option}: ${value}`);
          }
        });

      } catch (error) {
        this.warnings.push(`无法解析 tsconfig.json: ${error.message}`);
      }
    } else {
      this.errors.push('缺少 tsconfig.json');
    }

    // 检查 Jest 配置
    const jestConfigPath = path.join(this.projectRoot, 'jest.config.cjs');
    if (fs.existsSync(jestConfigPath)) {
      console.log('  ✅ jest.config.cjs');
    } else {
      this.warnings.push('建议添加 Jest 配置文件');
    }

    console.log('');
  }

  /**
   * 检查代码质量
   */
  checkCodeQuality() {
    console.log('🔍 检查代码质量...');

    try {
      // 检查 TypeScript 编译
      console.log('  检查 TypeScript 编译...');
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      console.log('    ✅ TypeScript 编译通过');
    } catch (error) {
      this.warnings.push('TypeScript 编译存在错误，请检查类型定义');
    }

    try {
      // 检查测试
      console.log('  检查测试...');
      execSync('npm test', { stdio: 'pipe' });
      console.log('    ✅ 测试通过');
    } catch (error) {
      this.warnings.push('部分测试失败，请检查测试用例');
    }

    console.log('');
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('📊 验证报告');
    console.log('='.repeat(50));

    if (this.errors.length === 0) {
      console.log('🎉 恭喜！架构验证通过！');
    } else {
      console.log('❌ 发现错误:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ 警告:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (this.suggestions.length > 0) {
      console.log('\n💡 建议:');
      this.suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
    }

    // 生成下一步行动建议
    console.log('\n🚀 下一步行动:');
    
    if (this.errors.length > 0) {
      console.log('  1. 修复上述错误');
      console.log('  2. 重新运行验证脚本');
    } else {
      console.log('  1. 创建缺失的工具文件');
      console.log('  2. 运行 npm run dev:refactored 测试新架构');
      console.log('  3. 编写单元测试');
      console.log('  4. 更新文档');
    }

    // 生成快速开始命令
    console.log('\n📋 快速开始命令:');
    console.log('  # 安装推荐依赖');
    console.log('  npm install inversify reflect-metadata node-cache pino');
    console.log('');
    console.log('  # 构建项目');
    console.log('  npm run build');
    console.log('');
    console.log('  # 运行新架构（开发模式）');
    console.log('  npm run dev:refactored');
    console.log('');
    console.log('  # 运行测试');
    console.log('  npm test');

    // 保存报告到文件
    this.saveReportToFile();
  }

  /**
   * 保存报告到文件
   */
  saveReportToFile() {
    const report = {
      timestamp: new Date().toISOString(),
      errors: this.errors,
      warnings: this.warnings,
      suggestions: this.suggestions,
      summary: {
        totalIssues: this.errors.length + this.warnings.length,
        criticalIssues: this.errors.length,
        passed: this.errors.length === 0
      }
    };

    const reportPath = path.join(this.projectRoot, 'docs', 'validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🏗️ Mantras MCP 架构验证工具');
  console.log('='.repeat(50));
  console.log('');

  const validator = new ArchitectureValidator();
  await validator.validate();
}

// 运行验证
if (require.main === module) {
  main().catch(error => {
    console.error('💥 验证过程中发生错误:', error);
    process.exit(1);
  });
}

module.exports = { ArchitectureValidator };