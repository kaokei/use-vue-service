import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'vite-plugin': 'src/vite-plugin.ts',
        'nuxt-plugin': 'src/nuxt-plugin.ts',
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'vue',
        '@vue/devtools-api',
        'vite',
        '@kaokei/di',
        '@kaokei/use-vue-service',
      ],
    },
  },
})
