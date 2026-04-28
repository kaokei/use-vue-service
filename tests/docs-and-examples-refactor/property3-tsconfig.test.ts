import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 属性 3：示例 tsconfig.json 统一配置
 *
 * 对于任意示例的 tsconfig.json，compilerOptions 应包含：
 * target: "ES2022"、module: "ESNext"、moduleResolution: "bundler"、
 * strict: true、useDefineForClassFields: true、jsx: "preserve"、noEmit: true。
 *
 * Validates: Requirements 7.3
 */

// Nuxt 示例使用不同的项目结构，不适用于 Vite 示例的通用规范检查
const EXCLUDED_DIRS = ['13-nuxt-decorators', '19-nuxt-auto-imports'];

// 获取所有示例目录（匹配 XX-name 模式，排除非 Vite 示例）
const examplesDir = path.resolve(__dirname, '../../examples');
const exampleDirs = fs.readdirSync(examplesDir).filter((dir) => {
  const fullPath = path.join(examplesDir, dir);
  return fs.statSync(fullPath).isDirectory() && /^\d{2}-/.test(dir) && !EXCLUDED_DIRS.includes(dir);
});

// fast-check 生成器：从实际示例目录中随机选取
const exampleDirArb = fc.constantFrom(...exampleDirs);

describe('Feature: docs-and-examples-refactor, Property 3: 示例 tsconfig.json 统一配置', () => {
  it('所有示例的 tsconfig.json 应包含统一的编译选项', () => {
    fc.assert(
      fc.property(exampleDirArb, (dirName) => {
        const tsconfigPath = path.join(examplesDir, dirName, 'tsconfig.json');

        // 验证 tsconfig.json 存在
        expect(fs.existsSync(tsconfigPath), `${dirName}/tsconfig.json 应存在`).toBe(true);

        // 读取并解析 tsconfig.json
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
        const opts = tsconfig.compilerOptions;

        expect(opts, `${dirName}: compilerOptions 应存在`).toBeDefined();

        // 验证各编译选项
        expect(opts.target, `${dirName}: target 应为 "ES2022"`).toBe('ES2022');
        expect(opts.module, `${dirName}: module 应为 "ESNext"`).toBe('ESNext');
        expect(opts.moduleResolution, `${dirName}: moduleResolution 应为 "bundler"`).toBe('bundler');
        expect(opts.strict, `${dirName}: strict 应为 true`).toBe(true);
        expect(opts.useDefineForClassFields, `${dirName}: useDefineForClassFields 应为 true`).toBe(true);
        expect(opts.jsx, `${dirName}: jsx 应为 "preserve"`).toBe('preserve');
        expect(opts.noEmit, `${dirName}: noEmit 应为 true`).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
