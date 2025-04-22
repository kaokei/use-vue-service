import { Container, type Context } from '@kaokei/di';
import { reactive, type ComponentInternalInstance, markRaw } from 'vue';
import {
  CURRENT_COMPONENT,
  CURRENT_CONTAINER,
  FIND_CHILD_SERVICE,
  FIND_CHILDREN_SERVICES,
} from './constants';
import { findChildService, findChildrenServices } from './find-service.ts';
import type { FindChildService, FindChildrenServices } from './interface.ts';

function isObject(val: object) {
  return val !== null && typeof val === 'object';
}

function makeReactiveObject(_: any, obj: any) {
  return isObject(obj) ? reactive(obj) : obj;
}

function findChildServiceFactory({ container }: Context): FindChildService {
  return (token: any) => findChildService(token, container);
}

function findChildrenServicesFactory({
  container,
}: Context): FindChildrenServices {
  return (token: any) => findChildrenServices(token, container);
}

export function createContainer(
  parent?: Container,
  instance?: ComponentInternalInstance | null
) {
  let container: Container;

  if (parent) {
    container = parent.createChild();
  } else {
    container = new Container();
  }

  if (instance) {
    // 容器绑定组件实例-方便后续通过依赖注入获取当前组件实例
    container.bind(CURRENT_COMPONENT).toConstantValue(markRaw(instance));
  }
  // 容器绑定容器对象-方便后续通过依赖注入获取当前容器对象
  container.bind(CURRENT_CONTAINER).toConstantValue(markRaw(container));
  container.bind(FIND_CHILD_SERVICE).toDynamicValue(findChildServiceFactory);
  container
    .bind(FIND_CHILDREN_SERVICES)
    .toDynamicValue(findChildrenServicesFactory);

  // 通过onActivation钩子使得所有实例变成响应式对象
  container.onActivation(makeReactiveObject);
  return container;
}
