import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '@kaokei/use-vue-service',
  description:
    'Lightweight Vue 3 state management with dependency injection, inspired by Angular services.',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Note', link: '/note/00.README' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: '快速开始', link: '/guide/' },
            { text: 'CodeSandbox 在线示例', link: '/guide/EXAMPLES' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API',
          items: [
            { text: 'API 文档', link: '/api/' },
          ],
        },
      ],
      '/note/': [
        {
          text: 'Note',
          items: [
            { text: '组件和服务互相访问', link: '/note/00.README' },
            { text: '不同场景', link: '/note/01.不同场景' },
            {
              text: '父组件与子组件的理解',
              link: '/note/02.父组件与子组件的理解',
            },
            {
              text: '子组件获取父组件服务',
              link: '/note/03.子组件获取父组件服务',
            },
            {
              text: '父组件获取子组件服务',
              link: '/note/04.父组件获取子组件服务',
            },
            { text: '响应式方案', link: '/note/05.响应式方案' },
            { text: '装饰器', link: '/note/06.装饰器' },
            { text: 'SSR-deepseek', link: '/note/07.SSR-deepseek' },
            { text: 'SSR-angular', link: '/note/08.SSR-angular' },
            { text: 'SSR-pinia', link: '/note/09.SSR-pinia' },
            { text: 'SSR', link: '/note/10.SSR' },
            { text: 'computed缓存陷阱', link: '/note/11.computed缓存陷阱' },
            { text: 'TC39-Stage3-装饰器类型详解', link: '/note/12.TC39-Stage3-装饰器类型详解' },
            { text: 'Legacy-experimentalDecorators-装饰器类型详解', link: '/note/13.Legacy-experimentalDecorators-装饰器类型详解' },
            { text: 'Computed装饰器只适用于getter属性', link: '/note/14.Computed装饰器只适用于getter属性' },
            { text: 'computed-comparison', link: '/note/15.computed-comparison' },
            { text: '最佳实践', link: '/note/16.最佳实践' },
            { text: '前端框架浅显对比', link: '/note/17.前端框架浅显对比' },
            { text: '前端发展各个阶段', link: '/note/18.前端发展各个阶段' },
            { text: '前端常见库的理解', link: '/note/19.前端常见库的理解' },
            { text: '组件间通信方式', link: '/note/20.组件间通信方式' },
            { text: '组件与服务', link: '/note/21.组件与服务' },
            { text: '响应式实现分析', link: '/note/22.响应式实现分析' },
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
