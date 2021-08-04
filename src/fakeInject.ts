import { getCurrentInstance } from 'vue';

/**
 * 主要实现逻辑是粘贴复制与vue中
 * 在原基础上增加了一个额外的参数selfInject=false
 * 所以默认行为和原vue的实现一致
 * 但是当selfInject=true时则与原vue实现不一致
 *
 * @export
 * @param {*} key
 * @param {*} defaultValue
 * @param {boolean} [treatDefaultAsFactory=false]
 * @param {boolean} [selfInject=false]
 * @return {*}
 */
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

/**
 * 从当前组件开始查找provider
 *
 * @export
 * @param {*} key
 * @param {*} defaultValue
 * @return {*}
 */
export function injectFromSelf(key: any, defaultValue: any) {
  return inject(key, defaultValue, false, true);
}
