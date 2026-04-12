import { Token } from '@kaokei/di';
import type { Container } from '@kaokei/di';
import type { InjectionKey } from 'vue';
import type { FindChildService, FindChildrenServices } from './interface.ts';

// 给依赖注入库使用的token
export const FIND_CHILD_SERVICE = new Token<FindChildService>(
  'FIND_CHILD_SERVICE'
);

// 给依赖注入库使用的token
export const FIND_CHILDREN_SERVICES = new Token<FindChildrenServices>(
  'FIND_CHILDREN_SERVICES'
);

// 每个实例对象自身维护的effectScope的key
export const SCOPE_KEY = Symbol('SCOPE_KEY');

// 给vue的provide/inject使用的token
export const CONTAINER_TOKEN: InjectionKey<Container> =
  Symbol('CONTAINER_TOKEN');
