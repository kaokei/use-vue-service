import type { Plugin } from 'vite'

export default function devtoolsPlugin(): Plugin {
  return {
    name: 'vite-plugin-use-vue-service-devtools',
    apply: 'serve',
    transformIndexHtml() {
      // TODO: 注入悬浮面板 UI（待 devtools 面板功能开发后实现）
      return []
    },
  }
}
