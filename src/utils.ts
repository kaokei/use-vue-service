import { Container } from '@kaokei/di';
import { reactive, type ComponentInternalInstance, markRaw } from 'vue';
import { setContainer } from './component-container';
import { CURRENT_COMPONENT, CURRENT_CONTAINER } from './constants';

function isObject(val: object) {
  return val !== null && typeof val === 'object';
}

function makeReactiveObject(_: any, obj: any) {
  return isObject(obj) ? reactive(obj) : obj;
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
    // 组件实例绑定容器-方便后续通过组件实例获取容器对象
    // 目前只是提供给findService使用
    setContainer(instance, container);
    // 容器绑定组件实例-方便后续通过依赖注入获取当前组件实例
    container.bind(CURRENT_COMPONENT).toConstantValue(markRaw(instance));
    // 容器绑定容器对象-方便后续通过依赖注入获取当前容器对象
    container.bind(CURRENT_CONTAINER).toConstantValue(markRaw(container));
  }
  // 通过onActivation钩子使得所有实例变成响应式对象
  container.onActivation(makeReactiveObject);
  return container;
}
