export * from '@kaokei/di';

export {
  CURRENT_COMPONENT,
  CURRENT_CONTAINER,
  FIND_CHILD_SERVICE,
  FIND_CHILDREN_SERVICES,
} from './constants.ts';

export {
  declareProviders,
  declareAppProviders,
  declareAppProvidersPlugin,
  declareRootProviders,
  useService,
  useAppService,
  useRootService,
} from './core.ts';

export { Computed } from './computed.ts';

export { getEffectScope } from './scope.ts';
