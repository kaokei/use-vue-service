import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { babel } from '@rollup/plugin-babel';

export default defineConfig({
  plugins: [
    vue(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      plugins: [
        ['@babel/plugin-proposal-decorators', { version: '2023-11' }],
      ],
    }),
  ],
});
