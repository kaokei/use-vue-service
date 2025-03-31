import { ComponentInternalInstance } from 'vue';
import { Container } from '@kaokei/di';

const key = Symbol('container');

export function setContainer(
  component: ComponentInternalInstance,
  container: Container
) {
  (component as any)[key] = container;
}

export function getContainer(component: ComponentInternalInstance) {
  return (component as any)[key];
}
