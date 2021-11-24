// 导出依赖注入需要的装饰器
export * from '@kaokei/di';

// setup中声明服务提供者
export { declareProviders } from './declareProviders';

// setup中获取服务实例
export { useService, useRootService, declareRootProviders } from './useService';

// 包装createApp的执行环境
// 从而可以达到所有应用的数据都是来源于service
// 这里获取和注册的服务是默认injector中的
export { bootstrap } from './bootstrap';

// 以下导出不是面向普通用户使用的
// 而是面向第三方库的开发者，比如自己开发的支持类组件的库
export { INJECTOR_KEY } from './constants';

export { DEFAULT_INJECTOR } from './defaultInjector';

export { injectFromSelf } from './fakeInject';
