#!/usr/bin/env node

/**
 * 性能监控和健康检查脚本
 */

import { performance } from 'perf_hooks';
import { readFileSync, statSync } from 'fs';
import { join } from 'path';

interface PerformanceMetrics {
  memoryUsage: NodeJS.MemoryUsage;
  loadTime: number;
  bundleSize: number;
  testCoverage?: number;
}

class PerformanceMonitor {
  private startTime: number;

  constructor() {
    this.startTime = performance.now();
  }

  async checkHealth(): Promise<PerformanceMetrics> {
    const loadTime = performance.now() - this.startTime;
    const memoryUsage = process.memoryUsage();
    const bundleSize = this.getBundleSize();

    return {
      memoryUsage,
      loadTime,
      bundleSize,
    };
  }

  private getBundleSize(): number {
    try {
      const serverPath = join(process.cwd(), 'dist', 'server.js');
      const stats = statSync(serverPath);
      return stats.size;
    } catch (error) {
      console.warn('Could not determine bundle size:', error);
      return 0;
    }
  }

  async generateReport(): Promise<void> {
    const metrics = await this.checkHealth();
    
    console.log('🔍 Performance Health Check Report');
    console.log('=====================================');
    console.log(`📊 Memory Usage:`);
    console.log(`   RSS: ${(metrics.memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Heap Used: ${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Heap Total: ${(metrics.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`⚡ Load Time: ${metrics.loadTime.toFixed(2)} ms`);
    console.log(`📦 Bundle Size: ${(metrics.bundleSize / 1024).toFixed(2)} KB`);
    
    // Performance thresholds
    const warnings: string[] = [];
    if (metrics.loadTime > 1000) {
      warnings.push('⚠️  Load time exceeds 1 second');
    }
    if (metrics.memoryUsage.heapUsed > 100 * 1024 * 1024) {
      warnings.push('⚠️  High memory usage detected');
    }
    if (metrics.bundleSize > 5 * 1024 * 1024) {
      warnings.push('⚠️  Large bundle size detected');
    }

    if (warnings.length > 0) {
      console.log('\n🚨 Performance Warnings:');
      warnings.forEach(warning => console.log(`   ${warning}`));
    } else {
      console.log('\n✅ All performance metrics are within acceptable ranges');
    }
  }
}

// Run health check if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new PerformanceMonitor();
  monitor.generateReport().catch(console.error);
}

export { PerformanceMonitor };