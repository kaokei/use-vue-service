import {
  provide,
  inject,
  getCurrentInstance,
  onUnmounted,
  hasInjectionContext,
  App,
} from 'vue';
import { Container } from '@kaokei/di';
import type { Newable, CommonToken } from '@kaokei/di';
import { createContainer } from './utils';
import { CONTAINER_TOKEN, DEFAULT_CONTAINER } from './constants';

type NewableProvider = Newable[];
type FunctionProvider = (container: Container) => void;
type Provider = NewableProvider | FunctionProvider;

function bindProviders(container: Container, providers: FunctionProvider): void;
function bindProviders(container: Container, providers: NewableProvider): void;
function bindProviders(container: Container, providers: Provider): void;
function bindProviders(container: Container, providers: Provider) {
  if (typeof providers === 'function') {
    providers(container);
  } else {
    for (let i = 0; i < providers.length; i++) {
      const s = providers[i];
      container.bind(s).toSelf();
    }
  }
}

// 查看当前组件是否声明对应的Container
// 参考vue实现
// https://github.com/vuejs/core/blob/733e266cddb945bf9db8edd85a914ecad22a544f/packages/runtime-core/src/apiInject.ts#L47
function getCurrentContainer(): Container | undefined {
  // 注意ComponentInternalInstance类型并没有暴露provides属性，所以这里声明为any类型
  const instance: any = getCurrentInstance();
  if (instance) {
    const token = CONTAINER_TOKEN;
    const provides = instance.provides;
    const parentProvides = instance.parent && instance.parent.provides;
    if (
      // 当前实例的provides存在
      provides &&
      // 当前实例的provides已经和parentProvides不是一个对象，说明已经Object.create(parentProvides)
      provides !== parentProvides &&
      // provides自身已经具有CONTAINER_TOKEN属性
      Object.prototype.hasOwnProperty.call(provides, token)
    ) {
      // 说明当前组件已经声明过对应的Container
      return provides[token];
    }
  }
}
// 从父级组件开始寻找CONTAINER_TOKEN
// 直接借助vue的inject方法
function getProvideContainer(): Container {
  if (hasInjectionContext()) {
    const token = CONTAINER_TOKEN;
    const defaultValue = DEFAULT_CONTAINER;
    return inject(token, defaultValue);
  } else {
    throw new Error('getProvideContainer 只能在 setup 中使用');
  }
}

export function useService<T>(token: CommonToken<T>) {
  const container = getCurrentContainer() || getProvideContainer();
  return container.get(token);
}

export function useRootService<T>(token: CommonToken<T>) {
  return DEFAULT_CONTAINER.get(token);
}

export function useAppService<T>(token: CommonToken<T>, app: App) {
  return app.runWithContext(() => useService(token));
}

export function declareProviders(providers: FunctionProvider): void;
export function declareProviders(providers: NewableProvider): void;
export function declareProviders(providers: Provider) {
  const currentContainer = getCurrentContainer();
  if (currentContainer) {
    bindProviders(currentContainer, providers);
  } else {
    const parent = getProvideContainer();
    const instance = getCurrentInstance();
    let container = createContainer(parent, instance);
    bindProviders(container, providers);
    provide(CONTAINER_TOKEN, container);
    onUnmounted(() => {
      container.unbindAll();
      container = null as any;
    });
  }
}

export function declareRootProviders(providers: FunctionProvider): void;
export function declareRootProviders(providers: NewableProvider): void;
export function declareRootProviders(providers: Provider) {
  bindProviders(DEFAULT_CONTAINER, providers);
}

export function declareAppProviders(
  providers: FunctionProvider,
  app: App
): void;
export function declareAppProviders(providers: NewableProvider, app: App): void;
export function declareAppProviders(providers: Provider, app: App): void;
export function declareAppProviders(providers: Provider, app: App) {
  app.runWithContext(() => {
    const appContainer = inject<Container>(CONTAINER_TOKEN);
    if (appContainer) {
      bindProviders(appContainer, providers);
    } else {
      let container = createContainer(DEFAULT_CONTAINER);
      bindProviders(container, providers);
      app.provide(CONTAINER_TOKEN, container);
      app.onUnmount(() => {
        container.unbindAll();
        container = null as any;
      });
    }
  });
}

export function declareAppProvidersPlugin(providers: Provider) {
  return (app: App) => declareAppProviders(providers, app);
}
