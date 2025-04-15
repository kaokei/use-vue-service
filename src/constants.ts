import { type Container, Token } from '@kaokei/di';
import type { ComponentInternalInstance } from 'vue';
import { createContainer } from './utils';
import type { FindService, FindAllServices } from './interface.ts';

// 给依赖注入库使用的token
export const CURRENT_COMPONENT = new Token<ComponentInternalInstance>(
  'USE_VUE_SERVICE_CURRENT_COMPONENT'
);

// 给依赖注入库使用的token
export const CURRENT_CONTAINER = new Token<Container>(
  'USE_VUE_SERVICE_CURRENT_CONTAINER'
);

// 给依赖注入库使用的token
export const FIND_SERVICE = new Token<FindService>(
  'USE_REACT_SERVICE_FIND_SERVICE'
);
// 给依赖注入库使用的token
export const FIND_ALL_SERVICES = new Token<FindAllServices>(
  'USE_REACT_SERVICE_FIND_ALL_SERVICES'
);

// 给vue的provide/inject使用的token
export const CONTAINER_TOKEN = 'USE_VUE_SERVICE_CONTAINER_TOKEN';

// 默认Container，对应declareRootProviders/useRootService
export const DEFAULT_CONTAINER = createContainer();
