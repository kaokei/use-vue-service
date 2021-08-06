// 导出依赖注入需要的装饰器
export {
  Inject,
  Self,
  Skip,
  Optional,
  Injectable,
  forwardRef,
} from '@kaokei/di';

// setup中声明服务提供者
export { declareProviders } from './declareProviders';

// setup中获取服务实例
export { useService } from './useService';

// 在createApp返回的app实例上挂载Injector
export { createVuePlugin } from './createVuePlugin';

// 以下到处不是面向普通用户使用的
// 而是面向第三方库的开发者，比如我开发的支持类组件的库
export { INJECTOR_KEY, DEFAULT_INJECTOR } from './constants';
export { injectFromSelf } from './fakeInject';
