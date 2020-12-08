module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    extraFileExtensions: ['.vue'],
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    //启用一组全局变量
    browser: true,
    es6: true,
    node: true,
    worker: true,
    jest: true,
  },
  globals: {
    //自定义的全局变量
    window: true,
    require: true,
    process: true,
    localStorage: true,
    chrome: true,
  },
  settings: {
    //自动发现React的版本，从而进行规范react代码
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  rules: {
    'no-debugger': 2,
    'no-console': 0,
    'ban-ts-ignore': 0,
    'react/prop-types': 0,
    'react/display-name': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
  },
  overrides: [
    //定制一组文件的规则
    {
      files: ['src/**/*.d.ts'],
      rules: {
        'no-unused-vars': 0,
        '@typescript-eslint/no-unused-vars': 0,
        '@typescript-eslint/triple-slash-reference': 0,
      },
    },
  ],
};
