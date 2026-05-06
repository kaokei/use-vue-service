import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { babel } from '@rollup/plugin-babel';
import VueDevTools from 'vite-plugin-vue-devtools';
import { useVueServiceDevtools } from '@kaokei/devtools-use-vue-service/vite';

export default defineConfig({
  plugins: [
    vue(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      plugins: [['@babel/plugin-proposal-decorators', { version: '2023-11' }]],
    }),
    VueDevTools(),
    useVueServiceDevtools(),
  ],
});
