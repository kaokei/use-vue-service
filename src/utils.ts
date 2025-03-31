import type { CommonToken } from '@kaokei/di';
import {
  VNode,
  VNodeChild,
  VNodeArrayChildren,
  VNodeNormalizedChildren,
  ComponentInternalInstance,
} from 'vue';
import { getContainer } from './component-container';

/**
 * useService是从当前组件开始像父组件以及祖先组件查找服务实例
 * findService是从当前组件【不包含当前组件】向子组件以及后代组件查找服务实例
 * 可以通过component.container尝试获取该组件是否有绑定对应的inversify的container
 * 然后通过container.isBound(token)来判断是否有绑定对应的服务
 * 如果有绑定则通过container.get(token)来获取服务实例
 * 注意component.subTree.children是当前组件的子组件
 * 整个过程是一个递归的过程，因为子组件还有子组件，所以需要递归查找
 * vnode.children
 * vnode.component [node.component.subTree]
 * vnode.suspense [node.suspense.activeBranch]
 * vnode 判断所有vnode是否符合条件
 */

function nodesAsObject(
  value: VNodeChild | VNodeArrayChildren
): value is VNodeArrayChildren | VNode {
  return !!value && typeof value === 'object';
}

function walk<T>(vnode: VNode, token: CommonToken<T>, results: T[]): T[] {
  if (vnode.component) {
    const container = getContainer(vnode.component);
    if (container && container.isCurrentBound(token)) {
      results.push(container.get(token));
    }
  }
  // 优先遍历当前组件的子组件树
  walkChildren(vnode.children, token, results);
  if (vnode.component) {
    walk(vnode.component.subTree, token, results);
  }
  if (vnode.suspense && vnode.suspense.activeBranch) {
    walk(vnode.suspense.activeBranch, token, results);
  }
  return results;
}

function walkChildren<T>(
  children: VNodeNormalizedChildren,
  token: CommonToken<T>,
  results: T[]
): T[] {
  if (children && Array.isArray(children)) {
    const filteredNodes = children.filter(nodesAsObject);
    filteredNodes.forEach((node: VNodeArrayChildren | VNode) => {
      if (Array.isArray(node)) {
        walkChildren(node, token, results);
      } else {
        walk(node, token, results);
      }
    });
  }
  return results;
}

/**
 * @param component ComponentInternalInstance 当前组件
 * @param token CommonToken<T>  服务标识
 * @returns T | undefined 是从当前组件【不包含当前组件】的子组件以及后代组件中查找服务实例，返回第一个找到的服务实例
 */
export function findService<T>(
  component: ComponentInternalInstance,
  token: CommonToken<T>
): T | undefined {
  const results: T[] = [];
  walk(component.subTree, token, results);
  return results[0];
}

/**
 * @param component ComponentInternalInstance 当前组件
 * @param token CommonToken<T> 服务标识
 * @returns T[] 是从当前组件【不包含当前组件】的子组件以及后代组件中查找服务实例，返回所有找到的服务实例
 */
export function findAllServices<T>(
  component: ComponentInternalInstance,
  token: CommonToken<T>
): T[] {
  const results: T[] = [];
  walk(component.subTree, token, results);
  return results;
}
