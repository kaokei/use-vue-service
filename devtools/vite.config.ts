import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'cjs' ? 'index.cjs' : 'index.js',
    },
    rollupOptions: {
      external: ['vue', '@vue/devtools-api'],
    },
  },
})
