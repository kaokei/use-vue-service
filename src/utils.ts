import { interfaces } from 'inversify';
import { ComponentInternalInstance } from 'vue';

/**
 * useService是从当前组件开始像父组件以及祖先组件查找服务实例
 * findService是从当前组件【不包含当前组件】向子组件以及后代组件查找服务实例
 * 可以通过component.container尝试获取该组件是否有绑定对应的inversify的container
 * 然后通过container.isBound(token)来判断是否有绑定对应的服务
 * 如果有绑定则通过container.get(token)来获取服务实例
 * 注意component.subTree.children是当前组件的子组件
 * 整个过程是一个递归的过程，因为子组件还有子组件，所以需要递归查找
 * @param component ComponentInternalInstance 当前组件
 * @param token interfaces.ServiceIdentifier<T>  服务标识
 */
export function findService<T>(
  component: ComponentInternalInstance,
  token: interfaces.ServiceIdentifier<T>
): T | undefined {
  return (component as any);
  // const children = component.subTree.children;
  // if (children && Array.isArray(children)) {
  //   for (let i = 0; i < children.length; i++) {
  //     const child = children[i];
  //     if (child && child.component) {
  //       const container = child.component.container;
  //       if (container && container.isBound(token)) {
  //         return container.get(token);
  //       } else {
  //         return findService(child, token);
  //       }
  //     }
  //   }
  // }
}
