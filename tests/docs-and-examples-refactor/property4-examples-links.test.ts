import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 属性 examples/index.md 文档 CodeSandbox 链接格式正确性
 *
 * 对于 examples/index.md 文档中列出的任意 CodeSandbox 链接，其 URL 应匹配格式
 * `https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/<示例目录>`，
 * 且 `<示例目录>` 应对应 `examples/` 下实际存在的目录名。
 *
 * Validates: Requirements 6.3
 */

// 读取 examples/index.md 文件内容
const examplesDocPath = path.resolve(__dirname, '../../docs/examples/index.md');
const examplesDocContent = fs.readFileSync(examplesDocPath, 'utf-8');

// 提取所有实际的 CodeSandbox 链接（在 markdown 链接语法中的 URL，排除说明文字中的模板）
const urlRegex = /\(https:\/\/codesandbox\.io\/p\/sandbox\/github\/kaokei\/use-vue-service\/tree\/main\/examples\/([^\s)]+)\)/g;
const extractedUrls: string[] = [];
let match: RegExpExecArray | null;
while ((match = urlRegex.exec(examplesDocContent)) !== null) {
  extractedUrls.push(match[0].slice(1, -1)); // 去掉首尾括号，保留纯 URL
}

// examples 目录路径
const examplesDir = path.resolve(__dirname, '../../examples');

// 期望的 URL 前缀
const expectedPrefix = 'https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/';

// fast-check 生成器：从提取的 URL 中随机选取
const urlArb = fc.constantFrom(...extractedUrls);

describe('Feature: docs-and-examples-refactor, Property 4: examples/index.md 文档 CodeSandbox 链接格式正确性', () => {
  it('examples/index.md 中应包含 CodeSandbox 链接', () => {
    expect(extractedUrls.length, 'examples/index.md 中应至少包含一个 CodeSandbox 链接').toBeGreaterThan(0);
  });

  it('所有 CodeSandbox 链接应格式正确且对应实际存在的示例目录', () => {
    fc.assert(
      fc.property(urlArb, (url) => {
        // 验证 URL 匹配期望的前缀格式
        expect(url.startsWith(expectedPrefix), `URL 应以 "${expectedPrefix}" 开头：${url}`).toBe(true);

        // 提取示例目录名
        const exampleDirName = url.slice(expectedPrefix.length);

        // 验证目录名非空
        expect(exampleDirName.length, `URL 中的示例目录名不应为空：${url}`).toBeGreaterThan(0);

        // 验证目录名匹配编号命名模式（XX-name）
        expect(exampleDirName, `示例目录名应匹配编号命名模式：${exampleDirName}`).toMatch(/^\d{2}-[\w-]+$/);

        // 验证对应的目录在 examples/ 下实际存在
        const dirPath = path.join(examplesDir, exampleDirName);
        expect(fs.existsSync(dirPath), `示例目录应存在：examples/${exampleDirName}`).toBe(true);
        expect(fs.statSync(dirPath).isDirectory(), `应为目录：examples/${exampleDirName}`).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
