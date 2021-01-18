// eslint-disable-next-line @typescript-eslint/no-var-requires
const vue = require('vue');

const context = {};

vue.inject = jest.fn(() => context);

// vue.reactive = jest.fn(arg => arg);

module.exports = vue;
