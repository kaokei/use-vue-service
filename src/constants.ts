import { Token } from '@kaokei/di';
import type { Container } from '@kaokei/di';
import type { InjectionKey } from 'vue';
import { createContainer } from './utils.ts';
import type { FindChildService, FindChildrenServices } from './interface.ts';

// 给依赖注入库使用的token
export const FIND_CHILD_SERVICE = new Token<FindChildService>(
  'USE_REACT_SERVICE_FIND_CHILD_SERVICE'
);

// 给依赖注入库使用的token
export const FIND_CHILDREN_SERVICES = new Token<FindChildrenServices>(
  'USE_REACT_SERVICE_FIND_CHILDREN_SERVICES'
);

// 每个实例对象自身维护的effectScope的key
export const SCOPE_KEY = Symbol();

// 给vue的provide/inject使用的token
export const CONTAINER_TOKEN: InjectionKey<Container> = Symbol('USE_VUE_SERVICE_CONTAINER_TOKEN');

// 默认Container，对应declareRootProviders/useRootService
export let DEFAULT_CONTAINER = createContainer();

// 重置默认容器，用于测试隔离
export function resetRootContainer(): void {
  DEFAULT_CONTAINER.destroy();
  DEFAULT_CONTAINER = createContainer();
}
