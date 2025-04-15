export * from '@kaokei/di';

export {
  CURRENT_COMPONENT,
  CURRENT_CONTAINER,
  FIND_SERVICE,
  FIND_ALL_SERVICES,
} from './constants';

export {
  declareProviders,
  declareAppProviders,
  declareAppProvidersPlugin,
  declareRootProviders,
  useService,
  useAppService,
  useRootService,
} from './core';

export { Computed } from './computed';

// 不建议业务直接使用
// 建议使用useService(FIND_SERVICE)和useService(FIND_ALL_SERVICES)
export { findService, findAllServices } from './find-service';
