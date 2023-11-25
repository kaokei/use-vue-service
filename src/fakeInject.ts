import { getCurrentInstance } from 'vue';

/**
 * 从当前组件开始查找provider
 * 注意到vue本身的inject是默认从父级组件开始查找
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
