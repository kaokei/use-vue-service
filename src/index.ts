export * from '@kaokei/di';

export {
  useService,
  declareProviders,
  useRootService,
  declareRootProviders,
  useAppService,
  declareAppProviders,
  declareAppProvidersPlugin,
} from './core.ts';

export { FIND_CHILD_SERVICE, FIND_CHILDREN_SERVICES, CONTAINER_TOKEN } from './constants.ts';

export type { FindChildService, FindChildrenServices } from './interface.ts';

// use-vue-service 专属装饰器
// autobind 放在 export * from '@kaokei/di' 之后，覆盖 di 的同名导出
export { autobind } from './autobind.ts';
export { Computed } from './computed.ts';
export { Raw } from './raw.ts';
export { RunInScope } from './effect-scope.ts';
