/**
 * use-vue-service 的核心模块。
 *
 * 本模块实现了在 Vue 组件中使用依赖注入（DI）容器的全部核心功能。
 * 利用 Vue 的 provide/inject 机制在组件树中传递 DI 容器，
 * 使得子组件可以自动继承父组件声明的服务，同时也支持在当前组件中覆盖或新增服务绑定。
 *
 * 提供三组 API，分别对应三种不同的作用域：
 *
 * 1. useService / declareProviders
 *    - 组件级作用域。容器通过 Vue 的 provide/inject 在组件树中传递。
 *    - declareProviders 会在当前组件创建一个子容器（继承父级容器），
 *      并在组件卸载时自动销毁。
 *    - useService 从当前组件或最近的祖先组件的容器中获取服务实例。
 *
 * 2. useRootService / declareRootProviders
 *    - 全局根级作用域。直接操作全局的 ROOT_CONTAINER。
 *    - 适用于不依赖组件树、全局共享的服务。
 *
 * 3. useAppService / declareAppProviders
 *    - Vue App 级作用域。通过 app.runWithContext 在指定 App 实例的上下文中操作容器。
 *    - 适用于多 App 实例场景，每个 App 拥有独立的容器。
 *    - declareAppProvidersPlugin 提供了 Vue 插件形式的便捷用法。
 */

import {
  provide,
  inject,
  getCurrentInstance,
  onUnmounted,
  hasInjectionContext,
} from 'vue';
import type { App } from 'vue';
import type { Container, CommonToken } from '@kaokei/di';
import { hasOwn } from '@kaokei/di';
import { createContainer } from './create-container.ts';
import { CONTAINER_TOKEN } from './constants.ts';
import type {
  NewableProvider,
  FunctionProvider,
  Provider,
} from './interface.ts';

// 默认Container，对应declareRootProviders/useRootService
const ROOT_CONTAINER = createContainer();

/**
 * 将服务提供者绑定到指定的 DI 容器上。
 *
 * 支持两种使用方式：
 * - 类数组（NewableProvider）：将每个类以 toSelf() 的方式绑定到容器，即类本身既是 token 也是实现。
 * - 函数（FunctionProvider）：接收容器实例作为参数，允许使用者自由调用容器的绑定 API
 *   （如 container.bind(token).toConstantValue; container.bind(value).toDynamicValue; 等），实现更灵活的绑定方式。
 *
 * 注意：不支持类似 Angular 的 ProviderConfig 对象形式（如 { provide: Token, useClass: Impl }），
 * 如需高级绑定请使用函数形式。
 */
function bindProviders(container: Container, providers: FunctionProvider): void;
function bindProviders(container: Container, providers: NewableProvider): void;
function bindProviders(container: Container, providers: Provider): void;
function bindProviders(container: Container, providers: Provider) {
  if (typeof providers === 'function') {
    providers(container);
  } else {
    for (let i = 0; i < providers.length; i++) {
      container.bind(providers[i]).toSelf();
    }
  }
}

/**
 * 获取当前组件自身声明的 DI 容器（不向上查找）。
 *
 * 实现原理参考 Vue 源码中 inject 的实现：
 * https://github.com/vuejs/core/blob/733e266cddb945bf9db8edd85a914ecad22a544f/packages/runtime-core/src/apiInject.ts#L47
 *
 * Vue 的 provide 机制会在首次调用 provide 时，通过 Object.create(parentProvides) 创建一个新的 provides 对象。
 * 因此可以通过以下条件判断当前组件是否自己声明了容器：
 * 1. provides 存在
 * 2. provides !== parentProvides（说明已经创建了自己的 provides 对象）
 * 3. provides 自身拥有 CONTAINER_TOKEN 属性（而非从原型链继承）
 *
 * @returns 当前组件声明的容器，如果当前组件未声明则返回 undefined
 */
function getCurrentContainer(): Container | undefined {
  // 注意：ComponentInternalInstance 类型并没有暴露 provides 属性，所以这里声明为 any 类型
  const instance: any = getCurrentInstance();
  if (instance) {
    const token = CONTAINER_TOKEN;
    const provides = instance.provides;
    const parentProvides = instance.parent && instance.parent.provides;
    if (provides && provides !== parentProvides && hasOwn(provides, token)) {
      return provides[token] as Container;
    }
  }
}

/**
 * 断言当前处于 Vue 的注入上下文（setup）中，否则抛出友好的错误信息。
 */
function assertInjectionContext(callerName: string): void {
  if (!hasInjectionContext()) {
    throw new Error(`${callerName} 只能在 setup 中使用`);
  }
}

/**
 * 从父级组件开始向上查找最近的 DI 容器。
 * 借助 Vue 的 inject 方法沿组件树向上查找 CONTAINER_TOKEN。
 * 如果整个组件树中都没有提供容器，则回退到全局的 ROOT_CONTAINER。
 */
function getProvideContainer(): Container {
  return inject(CONTAINER_TOKEN, ROOT_CONTAINER);
}

// ============================================================================
// 第一组 API：组件级作用域（useService / declareProviders）
// ============================================================================

/**
 * 从当前组件或最近的祖先组件的 DI 容器中获取服务实例。
 *
 * 查找顺序：
 * 1. 先检查当前组件自身是否声明了容器（getCurrentContainer）
 * 2. 如果没有，则沿组件树向上查找（getProvideContainer）
 *
 * @param token - 服务的标识符，可以是类本身（Newable）或 Token 实例
 * @returns 对应 token 的服务实例
 */
export function useService<T>(token: CommonToken<T>): T {
  assertInjectionContext('useService');
  const container = getCurrentContainer() || getProvideContainer();
  return container.get(token);
}

/**
 * 在当前组件中声明服务提供者。
 *
 * 行为逻辑：
 * - 如果当前组件已经声明过容器（重复调用 declareProviders），则直接在已有容器上追加绑定。
 * - 如果当前组件尚未声明容器，则：
 *   1. 获取父级容器作为 parent
 *   2. 创建一个子容器（继承父级容器的所有绑定）
 *   3. 在子容器上绑定新的服务
 *   4. 通过 Vue 的 provide 将子容器注入组件树
 *   5. 在组件卸载时（onUnmounted）自动销毁子容器，清理资源
 *
 * @param providers - 服务提供者，支持类数组或函数两种形式
 */
export function declareProviders(providers: FunctionProvider): void;
export function declareProviders(providers: NewableProvider): void;
export function declareProviders(providers: Provider): void;
export function declareProviders(providers: Provider) {
  assertInjectionContext('declareProviders');
  const currentContainer = getCurrentContainer();
  if (currentContainer) {
    bindProviders(currentContainer, providers);
  } else {
    const parent = getProvideContainer();
    const container = createContainer(parent);
    bindProviders(container, providers);
    provide(CONTAINER_TOKEN, container);
    onUnmounted(() => {
      container.destroy();
    });
  }
}

// ============================================================================
// 第二组 API：全局根级作用域（useRootService / declareRootProviders）
// ============================================================================

/**
 * 从全局根容器（ROOT_CONTAINER）中获取服务实例。
 * 不依赖 Vue 组件树，可以在任何地方调用。
 *
 * @param token - 服务的标识符
 * @returns 对应 token 的服务实例
 */
export function useRootService<T>(token: CommonToken<T>): T {
  return ROOT_CONTAINER.get(token);
}

/**
 * 在全局根容器上声明服务提供者。
 * 绑定的服务在整个应用中全局共享。
 *
 * @param providers - 服务提供者，支持类数组或函数两种形式
 */
export function declareRootProviders(providers: FunctionProvider): void;
export function declareRootProviders(providers: NewableProvider): void;
export function declareRootProviders(providers: Provider): void;
export function declareRootProviders(providers: Provider) {
  bindProviders(ROOT_CONTAINER, providers);
}

// ============================================================================
// 第三组 API：App 级作用域（useAppService / declareAppProviders）
// ============================================================================

/**
 * 在指定 Vue App 实例的上下文中获取服务实例。
 * 通过 app.runWithContext 确保 inject 能正确找到该 App 提供的容器。
 * 适用于多 App 实例场景。
 *
 * @param token - 服务的标识符
 * @param app - 目标 Vue App 实例
 * @returns 对应 token 的服务实例
 */
export function useAppService<T>(token: CommonToken<T>, app: App): T {
  return app.runWithContext(() => getProvideContainer().get(token));
}

/**
 * 在指定 Vue App 实例的上下文中声明服务提供者。
 *
 * 行为逻辑：
 * - 如果该 App 已经有容器（之前调用过 declareAppProviders），则直接追加绑定。
 * - 如果该 App 尚未有容器，则：
 *   1. 以 ROOT_CONTAINER 为 parent 创建子容器
 *   2. 绑定服务
 *   3. 通过 app.provide 将容器注入该 App 的组件树
 *   4. 在 App 卸载时自动销毁容器
 *
 * @param providers - 服务提供者，支持类数组或函数两种形式
 * @param app - 目标 Vue App 实例
 */
export function declareAppProviders(
  providers: FunctionProvider,
  app: App
): void;
export function declareAppProviders(providers: NewableProvider, app: App): void;
export function declareAppProviders(providers: Provider, app: App): void;
export function declareAppProviders(providers: Provider, app: App) {
  app.runWithContext(() => {
    const appContainer = inject(CONTAINER_TOKEN, null);
    if (appContainer) {
      bindProviders(appContainer, providers);
    } else {
      const container = createContainer(ROOT_CONTAINER);
      bindProviders(container, providers);
      app.provide(CONTAINER_TOKEN, container);
      app.onUnmount(() => {
        container.destroy();
      });
    }
  });
}

/**
 * declareAppProviders 的 Vue 插件形式。
 * 返回一个符合 Vue 插件接口的函数，可直接用于 app.use()。
 *
 * @example
 * ```ts
 * const app = createApp(App);
 * app.use(declareAppProvidersPlugin([ServiceA, ServiceB]));
 * ```
 *
 * @param providers - 服务提供者
 * @returns Vue 插件函数
 */
export function declareAppProvidersPlugin(
  providers: Provider
): (app: App) => void {
  return (app: App) => declareAppProviders(providers, app);
}
