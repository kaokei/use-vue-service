import path from 'path';
import { defineConfig } from 'vitepress';

const REPO_ROOT = path.resolve(__dirname, '../..');
const GITHUB_BASE = 'https://github.com/kaokei/use-vue-service/blob/main';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  markdown: {
    config(md) {
      // 将 docs/ 之外的相对路径链接转换为 GitHub URL
      const defaultRender =
        md.renderer.rules.link_open ||
        function (tokens, idx, options, _env, self) {
          return self.renderToken(tokens, idx, options);
        };

      md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const hrefIndex = token.attrIndex('href');
        if (hrefIndex >= 0) {
          const href = token.attrs![hrefIndex][1];
          // 只处理相对路径，且解析后落在 docs/ 目录之外
          // filePath 是绝对路径（VitePress 构建时注入）
          const filePath: string | undefined = env.filePath ?? env.realPath;
          if (
            href &&
            !href.startsWith('http') &&
            !href.startsWith('#') &&
            filePath
          ) {
            const mdDir = path.dirname(filePath);
            const resolved = path.resolve(mdDir, href);
            const docsDir = path.resolve(REPO_ROOT, 'docs');
            if (
              !resolved.startsWith(docsDir + path.sep) &&
              !resolved.startsWith(docsDir + '/')
            ) {
              const repoRelative = path.relative(REPO_ROOT, resolved);
              token.attrs![hrefIndex][1] = `${GITHUB_BASE}/${repoRelative}`;
            }
          }
        }
        return defaultRender(tokens, idx, options, env, self);
      };
    },
  },
  title: '@kaokei/use-vue-service',
  description:
    'Lightweight Vue 3 state management with dependency injection, inspired by Angular services.',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Decorator', link: '/decorator/' },
      { text: 'Example', link: '/examples' },
      { text: 'Note', link: '/note/00.README' },
    ],

    sidebar: {
      '/note/': [
        {
          text: '核心概念',
          items: [
            { text: '组件和服务互相访问', link: '/note/00.README' },
            { text: '不同场景', link: '/note/01.不同场景' },
            { text: '父组件与子组件的理解', link: '/note/02.父组件与子组件的理解' },
            { text: '子组件获取父组件服务', link: '/note/03.子组件获取父组件服务' },
            { text: '父组件获取子组件服务', link: '/note/04.父组件获取子组件服务' },
          ],
        },
        {
          text: '响应式与装饰器',
          items: [
            { text: '响应式方案', link: '/note/05.响应式方案' },
            { text: '装饰器', link: '/note/06.装饰器' },
            { text: 'TC39-Stage3-装饰器类型详解', link: '/note/07.TC39-Stage3-装饰器类型详解' },
            { text: 'Legacy-experimentalDecorators-装饰器类型详解', link: '/note/08.Legacy-experimentalDecorators-装饰器类型详解' },
            { text: 'Computed装饰器只适用于getter属性', link: '/note/09.Computed装饰器只适用于getter属性' },
            { text: 'computed缓存陷阱', link: '/note/10.computed缓存陷阱' },
            { text: 'computed-comparison', link: '/note/11.computed-comparison' },
          ],
        },
        {
          text: 'SSR',
          items: [
            { text: 'SSR', link: '/note/12.SSR' },
            { text: 'SSR-deepseek', link: '/note/13.SSR-deepseek' },
            { text: 'SSR-angular', link: '/note/14.SSR-angular' },
            { text: 'SSR-pinia', link: '/note/15.SSR-pinia' },
            { text: 'SSR完整分析与Hydration方案', link: '/note/16.SSR完整分析与Hydration方案' },
            { text: 'SSR最佳实践', link: '/note/17.SSR最佳实践' },
          ],
        },
        {
          text: '最佳实践与架构',
          items: [
            { text: '最佳实践', link: '/note/18.最佳实践' },
            { text: '组件间通信方式', link: '/note/19.组件间通信方式' },
            { text: '组件与服务', link: '/note/20.组件与服务' },
            { text: '服务间通信方案', link: '/note/21.服务间通信方案' },
            { text: 'autobind的必要性分析', link: '/note/22.autobind的必要性分析' },
            { text: '响应式实现分析', link: '/note/23.响应式实现分析' },
          ],
        },
        {
          text: '背景知识',
          items: [
            { text: '前端框架浅显对比', link: '/note/24.前端框架浅显对比' },
            { text: '前端发展各个阶段', link: '/note/25.前端发展各个阶段' },
            { text: '前端常见库的理解', link: '/note/26.前端常见库的理解' },
            { text: '代码批判性分析与改进建议', link: '/note/27.代码批判性分析与改进建议' },
          ],
        },
        {
          text: '工具',
          items: [
            { text: '基本命令', link: '/note/99.基本命令' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/kaokei/use-vue-service' },
    ],
  },
});
