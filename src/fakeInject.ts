import { getCurrentInstance } from 'vue';

export function inject(
  key: any,
  defaultValue: any,
  treatDefaultAsFactory = false,
  selfInject = false
) {
  // fallback to `currentRenderingInstance` so that this can be called in
  // a functional component
  const instance: any = getCurrentInstance();
  if (instance) {
    // #2400
    // to support `app.use` plugins,
    // fallback to appContext's `provides` if the intance is at root
    // 注意这里的 instance.provides 的原型链的最末端就是 instance.vnode.appContext.provides
    const provides = selfInject
      ? instance.provides
      : instance.parent == null
      ? instance.vnode.appContext && instance.vnode.appContext.provides
      : instance.parent.provides;

    if (provides && key in provides) {
      // TS doesn't allow symbol as index type
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && typeof defaultValue === 'function'
        ? defaultValue()
        : defaultValue;
    } else {
      console.warn(`injection "${String(key)}" not found.`);
    }
  } else {
    console.warn(
      `inject() can only be used inside setup() or functional components.`
    );
  }
}

export function injectFromSelf(key: any, defaultValue: any) {
  return inject(key, defaultValue, false, true);
}
