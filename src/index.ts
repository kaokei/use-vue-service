// 导出依赖注入需要的装饰器
export * from '@kaokei/di';

// 声明服务提供者
export { declareProviders, declareRootProviders } from './declareProviders';

// 获取服务实例
export { useService, useRootService } from './useService';

// 以下导出不是面向普通用户使用的
// 而是面向第三方库的开发者，比如自己开发的支持类组件的库
export { INJECTOR_KEY } from './constants';

export { DEFAULT_INJECTOR } from './defaultInjector';

export { inject } from './fakeInject';

export { createInjector, getServiceFromInjector } from './utils';
