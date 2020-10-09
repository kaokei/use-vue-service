import { provide, reactive, inject, ref } from "vue";
import { ServiceContext, DefaultContext } from "./ServiceContext";

// vue不需要高阶组件
// 只需要包装provide方法即可
export function declareProviders(providers: any[]) {
  const parentCtx = inject(ServiceContext, DefaultContext);
  const newProviders = providers.map((p) => {
    if (p.provide) {
      return p;
    } else {
      return {
        provide: p,
        useClass: p,
      };
    }
  });
  const currentCtx = {
    parent: parentCtx,
    providers: newProviders,
  };
  provide(ServiceContext, currentCtx);
}
