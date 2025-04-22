import { type Container, Token } from '@kaokei/di';
import type { ComponentInternalInstance } from 'vue';
import { createContainer } from './utils.ts';
import type { FindChildService, FindChildrenServices } from './interface.ts';

// 给依赖注入库使用的token
export const CURRENT_COMPONENT = new Token<ComponentInternalInstance>(
  'USE_VUE_SERVICE_CURRENT_COMPONENT'
);

// 给依赖注入库使用的token
export const CURRENT_CONTAINER = new Token<Container>(
  'USE_VUE_SERVICE_CURRENT_CONTAINER'
);

// 给依赖注入库使用的token
export const FIND_CHILD_SERVICE = new Token<FindChildService>(
  'USE_REACT_SERVICE_FIND_CHILD_SERVICE'
);

// 给依赖注入库使用的token
export const FIND_CHILDREN_SERVICES = new Token<FindChildrenServices>(
  'USE_REACT_SERVICE_FIND_CHILDREN_SERVICES'
);

// 给vue的provide/inject使用的token
export const CONTAINER_TOKEN = 'USE_VUE_SERVICE_CONTAINER_TOKEN';

// 默认Container，对应declareRootProviders/useRootService
export const DEFAULT_CONTAINER = createContainer();
