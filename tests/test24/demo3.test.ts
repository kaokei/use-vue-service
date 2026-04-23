// 场景3：useAppService 可以从 declareRootProviders 中获取服务
import { mount } from '@vue/test-utils';
import { App } from 'vue';
import {
  declareAppProvidersPlugin,
  declareRootProviders,
  useAppService,
  useRootService,
} from '@/index';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import { RootService } from './RootService';

declareRootProviders([RootService]);

describe('test24 - 场景3', () => {
  it('useAppService 从 declareRootProviders 获取服务', async () => {
    let rootApp!: App;

    mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => {
            rootApp = app;
          },
          declareAppProvidersPlugin([DemoService]),
        ],
      },
    });

    // RootService 仅注册在 ROOT_CONTAINER，app 容器以 ROOT_CONTAINER 为 parent
    // useAppService 通过 inject 获取 app 容器，再向上查找到 ROOT_CONTAINER 中的 RootService
    const rootService = useAppService(RootService, rootApp);
    const rootServiceFromRoot = useRootService(RootService);

    expect(rootService).toBeInstanceOf(RootService);
    expect(rootService).toBe(rootServiceFromRoot);
  });
});
