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
      { text: 'Note', link: '/note/' },
    ],

    sidebar: {
      '/note/': [
        {
          text: 'Note',
          link: '/note/',
          items: [
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
