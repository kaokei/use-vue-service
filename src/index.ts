import { provide, getCurrentInstance, onUnmounted, reactive, ref } from 'vue';

import { Container } from 'inversify';

const CONTAINER_KEY = 'USE_VUE_SERVICE_CONTAINER_KEY';

const DEFAULT_CONTAINER_OPTIONS = {
  autoBindInjectable: false,
  defaultScope: 'Singleton',
  skipBaseClassChecks: false,
};

function createContainer(parent?: Container, options?: any) {
  if (parent) {
    return parent.createChild(options);
  }
  return new Container(options);
}
function bindContainer(container: Container, providers: any) {
  if (typeof providers === 'function') {
    providers(container);
  } else {
    for (let i = 0; i < providers.length; i++) {
      const s = providers[i];
      container.bind(s).toSelf();
    }
  }
  container.onActivation('_', (_: any, instance: any) => {
    return typeof instance === 'object' ? reactive(instance) : ref(instance);
  });
}

const DEFAULT_CONTAINER = createContainer();

function getServiceFromContainer(container: Container, token: any) {
  return container.get(token);
}

function injectFromSelf(key: any, defaultValue: any) {
  const instance: any = getCurrentInstance();
  if (instance) {
    const provides = instance.provides;
    return provides[key] || defaultValue;
  } else {
    console.warn(
      `inject() can only be used inside setup() or functional components.`
    );
  }
}

export function useService(token: any) {
  const currentContainer = injectFromSelf(CONTAINER_KEY, DEFAULT_CONTAINER);
  return getServiceFromContainer(currentContainer, token);
}
export function useRootService(token: any) {
  return getServiceFromContainer(DEFAULT_CONTAINER, token);
}

export function declareProviders(providers: any, options?: any) {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error('declareProviders can only be used inside setup function.');
  }
  const parentContainer = injectFromSelf(CONTAINER_KEY, DEFAULT_CONTAINER);
  if (parentContainer.uid === instance.uid) {
    throw new Error('declareProviders can only be called once.');
  }
  const finalOptions = Object.assign({}, DEFAULT_CONTAINER_OPTIONS, options);
  const currentContainer = createContainer(parentContainer, finalOptions);
  bindContainer(currentContainer, providers);

  onUnmounted(() => {
    currentContainer.unbindAll();
  });

  (currentContainer as any).uid = instance.uid;
  provide(CONTAINER_KEY, currentContainer);
}

export function declareRootProviders(providers: any) {
  bindContainer(DEFAULT_CONTAINER, providers);
}
