// declare module '*.vue' {
//   import { defineComponent } from 'vue';
//   const component: ReturnType<typeof defineComponent>;
//   export default component;
// }

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<any, any, any>;
  export default component;
}
