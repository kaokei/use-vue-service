import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 属性 2：示例 package.json 规范性
 *
 * 对于任意示例的 package.json，根据项目类型验证不同的依赖。
 *
 * 通用验证（Vite 和 Nuxt 均需满足）：
 * - description 字段存在且为非空字符串
 * - dependencies 应包含 @kaokei/use-vue-service: ^4.0.0
 * - dependencies 应包含 vue: ^3.5.13
 *
 * Vite 项目特有：
 * - dependencies 应包含 @kaokei/di: ^5.0.0
 * - devDependencies 应包含 @vitejs/plugin-vue: ^6.0.0
 * - devDependencies 应包含 vite: ^6.0.0
 *
 * Nuxt 项目特有：
 * - dependencies 应包含 nuxt（版本号以 ^4 开头）
 * - devDependencies 应包含 typescript（版本号以 ^5 开头）
 *
 * Validates: Requirements 5.2, 7.2
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

describe('Feature: docs-and-examples-refactor, Property 2: 示例 package.json 规范性', () => {
  it('所有示例的 package.json 应包含正确的依赖版本和描述字段', () => {
    fc.assert(
      fc.property(exampleDirArb, (dirName) => {
        const dirPath = path.join(examplesDir, dirName);
        const projectType = detectProjectType(dirPath);

        const pkgPath = path.join(dirPath, 'package.json');
        expect(fs.existsSync(pkgPath), `${dirName}/package.json 应存在`).toBe(true);

        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

        // ===== 通用验证 =====

        // description 字段存在且为非空字符串
        expect(pkg.description, `${dirName}: description 应存在`).toBeDefined();
        expect(typeof pkg.description, `${dirName}: description 应为字符串`).toBe('string');
        expect(pkg.description.length, `${dirName}: description 不应为空`).toBeGreaterThan(0);

        // dependencies 应包含 @kaokei/use-vue-service: ^4.0.0
        expect(pkg.dependencies, `${dirName}: dependencies 应存在`).toBeDefined();
        expect(
          pkg.dependencies['@kaokei/use-vue-service'],
          `${dirName}: dependencies 应包含 @kaokei/use-vue-service: ^4.0.0`,
        ).toBe('^4.0.0');

        // dependencies 应包含 vue: ^3.5.13
        expect(
          pkg.dependencies['vue'],
          `${dirName}: dependencies 应包含 vue: ^3.5.13`,
        ).toBe('^3.5.13');

        // ===== 项目类型特有验证 =====

        if (projectType === 'vite') {
          // dependencies 应包含 @kaokei/di: ^5.0.0
          expect(
            pkg.dependencies['@kaokei/di'],
            `${dirName}: Vite 项目 dependencies 应包含 @kaokei/di: ^5.0.0`,
          ).toBe('^5.0.0');

          // devDependencies 应包含 @vitejs/plugin-vue: ^6.0.0
          expect(pkg.devDependencies, `${dirName}: devDependencies 应存在`).toBeDefined();
          expect(
            pkg.devDependencies['@vitejs/plugin-vue'],
            `${dirName}: Vite 项目 devDependencies 应包含 @vitejs/plugin-vue: ^6.0.0`,
          ).toBe('^6.0.0');

          // devDependencies 应包含 vite: ^6.0.0
          expect(
            pkg.devDependencies['vite'],
            `${dirName}: Vite 项目 devDependencies 应包含 vite: ^6.0.0`,
          ).toBe('^6.0.0');
        } else {
          // dependencies 应包含 nuxt（版本号以 ^4 开头）
          expect(
            pkg.dependencies['nuxt'],
            `${dirName}: Nuxt 项目 dependencies 应包含 nuxt`,
          ).toBeDefined();
          expect(
            pkg.dependencies['nuxt'],
            `${dirName}: Nuxt 项目 nuxt 版本应以 ^4 开头`,
          ).toMatch(/^\^4/);

          // devDependencies 应包含 typescript（版本号以 ^5 开头）
          expect(pkg.devDependencies, `${dirName}: devDependencies 应存在`).toBeDefined();
          expect(
            pkg.devDependencies['typescript'],
            `${dirName}: Nuxt 项目 devDependencies 应包含 typescript`,
          ).toBeDefined();
          expect(
            pkg.devDependencies['typescript'],
            `${dirName}: Nuxt 项目 typescript 版本应以 ^5 开头`,
          ).toMatch(/^\^5/);
        }
      }),
      { numRuns: 100 },
    );
  });
});
