// eslint-disable-next-line @typescript-eslint/no-var-requires
const vue = require('vue');

vue.inject = jest.fn(() => ({}));

// vue.reactive = jest.fn(arg => arg);

module.exports = vue;
