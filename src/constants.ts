import { type Container, Token } from '@kaokei/di';
import type { ComponentInternalInstance } from 'vue';
import { createContainer } from './utils';

// 给依赖注入库使用的token
export const CURRENT_COMPONENT = new Token<ComponentInternalInstance>(
  'USE_VUE_SERVICE_CURRENT_COMPONENT'
);

// 给依赖注入库使用的token
export const CURRENT_CONTAINER = new Token<Container>(
  'USE_VUE_SERVICE_CURRENT_CONTAINER'
);

// 给vue的provide/inject使用的token
export const CONTAINER_TOKEN = 'USE_VUE_SERVICE_CONTAINER_TOKEN';

// 默认Container，对应declareRootProviders/useRootService
export const DEFAULT_CONTAINER = createContainer();
