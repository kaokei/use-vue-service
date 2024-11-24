/// <reference types="vitest/config" />

// 参考：https://innei.in/posts/tech/write-a-universally-compatible-js-library-with-fully-types
// 参考：https://arethetypeswrong.github.io/
// 作为library是没有必要压缩的，除非需要输出umd格式给浏览器端使用
// 当前库因为依赖inversify，所以没有输出给浏览器使用的umd版本
// 注意inversify，reflect-metadata，vue等库都是peerDependencies，不应该打包到当前库中
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      // rollupTypes: true,
      tsconfigPath: './tsconfig.app.json',
      beforeWriteFile: (filePath, content) => {
        writeFileSync(filePath.replace('.d.ts', '.d.cts'), content);
        return { filePath, content };
      },
    }),
  ],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'UseVueService',
      // the proper extensions will be added
      fileName: 'index',
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'reflect-metadata', 'inversify'],
      output: {
        compact: true,
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      include: ['src/**/*.ts'],
      reporter: ['text', 'lcov'],
    },
  },
});
