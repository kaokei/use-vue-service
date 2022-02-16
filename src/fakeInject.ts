import { getCurrentInstance } from 'vue';

/**
 * 从当前组件开始查找provider
 *
 * @export
 * @param {*} key
 * @param {*} defaultValue
 * @return {*}
 */
export function inject(key: any, defaultValue: any) {
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
