import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 属性 1：示例目录结构与配置完整性
 *
 * 对于任意示例目录，该目录应包含以下必需文件：
 * .codesandbox/tasks.json、index.html、package.json、tsconfig.json、vite.config.ts、src/ 目录；
 * 其中 vite.config.ts 应导入并使用 @vitejs/plugin-vue 插件；
 * .codesandbox/tasks.json 应配置 setupTasks 包含 pnpm install，tasks.start 包含 pnpm start 且 runAtStart 为 true。
 *
 * Validates: Requirements 5.1, 5.5, 5.6
 */

// 获取所有示例目录（匹配 XX-name 模式）
const examplesDir = path.resolve(__dirname, '../../examples');
const exampleDirs = fs.readdirSync(examplesDir).filter((dir) => {
  const fullPath = path.join(examplesDir, dir);
  return fs.statSync(fullPath).isDirectory() && /^\d{2}-/.test(dir);
});

// fast-check 生成器：从实际示例目录中随机选取
const exampleDirArb = fc.constantFrom(...exampleDirs);

describe('Feature: docs-and-examples-refactor, Property 1: 示例目录结构与配置完整性', () => {
  it('所有示例目录应包含必需文件和正确配置', () => {
    fc.assert(
      fc.property(exampleDirArb, (dirName) => {
        const dirPath = path.join(examplesDir, dirName);

        // 验证 .codesandbox/tasks.json 存在
        const tasksJsonPath = path.join(dirPath, '.codesandbox', 'tasks.json');
        expect(fs.existsSync(tasksJsonPath), `${dirName}/.codesandbox/tasks.json 应存在`).toBe(true);

        // 验证 .codesandbox/tasks.json 内容
        const tasksJson = JSON.parse(fs.readFileSync(tasksJsonPath, 'utf-8'));

        // setupTasks 应包含 "pnpm install"
        expect(tasksJson.setupTasks, `${dirName}: setupTasks 应存在`).toBeDefined();
        expect(Array.isArray(tasksJson.setupTasks), `${dirName}: setupTasks 应为数组`).toBe(true);
        const hasInstallTask = tasksJson.setupTasks.some(
          (task: { command: string }) => task.command === 'pnpm install',
        );
        expect(hasInstallTask, `${dirName}: setupTasks 应包含 "pnpm install" 命令`).toBe(true);

        // tasks.start 应包含 "pnpm start" 且 runAtStart 为 true
        expect(tasksJson.tasks, `${dirName}: tasks 应存在`).toBeDefined();
        expect(tasksJson.tasks.start, `${dirName}: tasks.start 应存在`).toBeDefined();
        expect(tasksJson.tasks.start.command, `${dirName}: tasks.start.command 应为 "pnpm start"`).toBe('pnpm start');
        expect(tasksJson.tasks.start.runAtStart, `${dirName}: tasks.start.runAtStart 应为 true`).toBe(true);

        // 验证 index.html 存在
        expect(fs.existsSync(path.join(dirPath, 'index.html')), `${dirName}/index.html 应存在`).toBe(true);

        // 验证 package.json 存在
        expect(fs.existsSync(path.join(dirPath, 'package.json')), `${dirName}/package.json 应存在`).toBe(true);

        // 验证 tsconfig.json 存在
        expect(fs.existsSync(path.join(dirPath, 'tsconfig.json')), `${dirName}/tsconfig.json 应存在`).toBe(true);

        // 验证 vite.config.ts 存在并导入 @vitejs/plugin-vue
        const viteConfigPath = path.join(dirPath, 'vite.config.ts');
        expect(fs.existsSync(viteConfigPath), `${dirName}/vite.config.ts 应存在`).toBe(true);

        const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf-8');
        expect(
          viteConfigContent.includes('@vitejs/plugin-vue'),
          `${dirName}/vite.config.ts 应导入 @vitejs/plugin-vue`,
        ).toBe(true);

        // 验证 src/ 目录存在
        const srcPath = path.join(dirPath, 'src');
        expect(fs.existsSync(srcPath), `${dirName}/src/ 目录应存在`).toBe(true);
        expect(fs.statSync(srcPath).isDirectory(), `${dirName}/src/ 应为目录`).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
