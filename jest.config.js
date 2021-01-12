module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  transform: {
    '^.+\\.vue$': 'vue-jest',
  },
  globals: {
    'vue-jest': {
      babelConfig: './babel.config.js',
    },
  },
};
