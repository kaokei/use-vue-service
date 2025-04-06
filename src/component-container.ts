import type { ComponentInternalInstance } from 'vue';
import type { Container } from '@kaokei/di';

const map = new WeakMap<ComponentInternalInstance, Container>();

export function setContainer(
  component: ComponentInternalInstance,
  container: Container
) {
  map.set(component, container);
}

export function getContainer(component: ComponentInternalInstance) {
  return map.get(component);
}
