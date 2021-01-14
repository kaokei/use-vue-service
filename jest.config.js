module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  transform: {
    '^.+\\.vue$': 'vue-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/example/$1',
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@services/(.*)$': '<rootDir>/example/services/$1',
    '^@components/(.*)$': '<rootDir>/example/components/$1',
    '^@containers/(.*)$': '<rootDir>/example/containers/$1',
    '^react-native$': 'react-native-web',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
  globals: {
    'vue-jest': {
      babelConfig: './babel.config.js',
    },
  },
};
