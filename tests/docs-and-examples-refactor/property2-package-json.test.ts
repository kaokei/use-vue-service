import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 属性 2：示例 package.json 规范性
 *
 * 对于任意示例的 package.json，dependencies 中应包含
 * @kaokei/di: ^5.0.0、@kaokei/use-vue-service: ^4.0.0、vue: ^3.5.13；
 * devDependencies 中应包含 @vitejs/plugin-vue: ^6.0.0、vite: ^6.0.0；
 * description 字段应存在且为非空字符串（中文描述）。
 *
 * Validates: Requirements 5.2, 7.2
 */

// Nuxt 示例使用不同的项目结构，不适用于 Vite 示例的通用规范检查
const EXCLUDED_DIRS = ['13-nuxt-decorators'];

// 获取所有示例目录（匹配 XX-name 模式，排除非 Vite 示例）
const examplesDir = path.resolve(__dirname, '../../examples');
const exampleDirs = fs.readdirSync(examplesDir).filter((dir) => {
  const fullPath = path.join(examplesDir, dir);
  return fs.statSync(fullPath).isDirectory() && /^\d{2}-/.test(dir) && !EXCLUDED_DIRS.includes(dir);
});

// fast-check 生成器：从实际示例目录中随机选取
const exampleDirArb = fc.constantFrom(...exampleDirs);

describe('Feature: docs-and-examples-refactor, Property 2: 示例 package.json 规范性', () => {
  it('所有示例的 package.json 应包含正确的依赖版本和描述字段', () => {
    fc.assert(
      fc.property(exampleDirArb, (dirName) => {
        const pkgPath = path.join(examplesDir, dirName, 'package.json');
        expect(fs.existsSync(pkgPath), `${dirName}/package.json 应存在`).toBe(true);

        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

        // 验证 dependencies 包含 @kaokei/di: ^5.0.0
        expect(pkg.dependencies, `${dirName}: dependencies 应存在`).toBeDefined();
        expect(
          pkg.dependencies['@kaokei/di'],
          `${dirName}: dependencies 应包含 @kaokei/di: ^5.0.0`,
        ).toBe('^5.0.0');

        // 验证 dependencies 包含 @kaokei/use-vue-service: ^4.0.0
        expect(
          pkg.dependencies['@kaokei/use-vue-service'],
          `${dirName}: dependencies 应包含 @kaokei/use-vue-service: ^4.0.0`,
        ).toBe('^4.0.0');

        // 验证 dependencies 包含 vue: ^3.5.13
        expect(
          pkg.dependencies['vue'],
          `${dirName}: dependencies 应包含 vue: ^3.5.13`,
        ).toBe('^3.5.13');

        // 验证 devDependencies 包含 @vitejs/plugin-vue: ^6.0.0
        expect(pkg.devDependencies, `${dirName}: devDependencies 应存在`).toBeDefined();
        expect(
          pkg.devDependencies['@vitejs/plugin-vue'],
          `${dirName}: devDependencies 应包含 @vitejs/plugin-vue: ^6.0.0`,
        ).toBe('^6.0.0');

        // 验证 devDependencies 包含 vite: ^6.0.0
        expect(
          pkg.devDependencies['vite'],
          `${dirName}: devDependencies 应包含 vite: ^6.0.0`,
        ).toBe('^6.0.0');

        // 验证 description 字段存在且为非空字符串
        expect(
          typeof pkg.description === 'string' && pkg.description.length > 0,
          `${dirName}: description 应为非空字符串`,
        ).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
