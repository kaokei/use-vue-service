import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 属性 3：示例 tsconfig.json 统一配置
 *
 * 对于任意示例的 tsconfig.json，根据项目类型验证不同的配置。
 *
 * Vite 项目：compilerOptions 应包含 target: "ES2022"、module: "ESNext"、
 *   moduleResolution: "bundler"、strict: true、useDefineForClassFields: true、
 *   jsx: "preserve"、noEmit: true。
 *
 * Nuxt 项目：extends 应为 "./.nuxt/tsconfig.json"（由 Nuxt 自动生成的类型配置）。
 *
 * Validates: Requirements 7.3
 */

/** 检测项目类型：存在 nuxt.config.ts 则为 Nuxt 项目，否则为 Vite 项目 */
function detectProjectType(dirPath: string): 'vite' | 'nuxt' {
  return fs.existsSync(path.join(dirPath, 'nuxt.config.ts')) ? 'nuxt' : 'vite';
}

// 获取所有示例目录（匹配 XX-name 模式）
const examplesDir = path.resolve(__dirname, '../../examples');
const exampleDirs = fs.readdirSync(examplesDir).filter((dir) => {
  const fullPath = path.join(examplesDir, dir);
  return fs.statSync(fullPath).isDirectory() && /^\d{2}-/.test(dir);
});

// fast-check 生成器：从实际示例目录中随机选取
const exampleDirArb = fc.constantFrom(...exampleDirs);

describe('Feature: docs-and-examples-refactor, Property 3: 示例 tsconfig.json 统一配置', () => {
  it('所有示例的 tsconfig.json 应包含统一的编译选项', () => {
    fc.assert(
      fc.property(exampleDirArb, (dirName) => {
        const dirPath = path.join(examplesDir, dirName);
        const projectType = detectProjectType(dirPath);

        const tsconfigPath = path.join(dirPath, 'tsconfig.json');
        expect(fs.existsSync(tsconfigPath), `${dirName}/tsconfig.json 应存在`).toBe(true);

        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));

        if (projectType === 'vite') {
          const opts = tsconfig.compilerOptions;
          expect(opts, `${dirName}: compilerOptions 应存在`).toBeDefined();

          expect(opts.target, `${dirName}: target 应为 "ES2022"`).toBe('ES2022');
          expect(opts.module, `${dirName}: module 应为 "ESNext"`).toBe('ESNext');
          expect(opts.moduleResolution, `${dirName}: moduleResolution 应为 "bundler"`).toBe('bundler');
          expect(opts.strict, `${dirName}: strict 应为 true`).toBe(true);
          expect(opts.useDefineForClassFields, `${dirName}: useDefineForClassFields 应为 true`).toBe(true);
          expect(opts.jsx, `${dirName}: jsx 应为 "preserve"`).toBe('preserve');
          expect(opts.noEmit, `${dirName}: noEmit 应为 true`).toBe(true);
        } else {
          expect(
            tsconfig.extends,
            `${dirName}: Nuxt 项目 tsconfig 应 extends "./.nuxt/tsconfig.json"`,
          ).toBe('./.nuxt/tsconfig.json');
        }
      }),
      { numRuns: 100 },
    );
  });
});
