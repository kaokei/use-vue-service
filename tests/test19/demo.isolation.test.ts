import { mount } from '@vue/test-utils';
import { type App } from 'vue';
import DemoComp from './DemoComp.vue';
import { ChildService } from './ChildService';
import {
  FIND_CHILDREN_SERVICES,
  useRootService,
  useAppService,
  declareAppProvidersPlugin,
} from '@/index';

describe('test19 — 容器隔离性验证', () => {
  it('Root vs Component：两个 DemoComp 时 Root 查到 6 个', () => {
    const wrapperA = mount(DemoComp);
    const wrapperB = mount(DemoComp);

    const allFromRoot = useRootService(FIND_CHILDREN_SERVICES)(ChildService);
    expect(allFromRoot).toHaveLength(6);

    wrapperA.unmount();
    wrapperB.unmount();
  });

  it('卸载一个 DemoComp 后，Root 查到的数量减少到 3', () => {
    const wrapperA = mount(DemoComp);
    const wrapperB = mount(DemoComp);

    let allFromRoot = useRootService(FIND_CHILDREN_SERVICES)(ChildService);
    expect(allFromRoot).toHaveLength(6);

    wrapperA.unmount();

    allFromRoot = useRootService(FIND_CHILDREN_SERVICES)(ChildService);
    expect(allFromRoot).toHaveLength(3);

    wrapperB.unmount();
  });

  it('多 App 实例隔离：App A 与 App B 各自查到 3 个，且实例无交集', () => {
    let appA!: App;
    let appB!: App;

    const wrapperA = mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => {
            appA = app;
          },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const wrapperB = mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => {
            appB = app;
          },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const listA = useAppService(FIND_CHILDREN_SERVICES, appA)(ChildService);
    const listB = useAppService(FIND_CHILDREN_SERVICES, appB)(ChildService);

    expect(listA).toHaveLength(3);
    expect(listB).toHaveLength(3);

    listA.forEach(sA => {
      listB.forEach(sB => {
        expect(sA).not.toBe(sB);
      });
    });

    wrapperA.unmount();
    wrapperB.unmount();
  });

  it('App unmount 后，Root 不再包含该 App 的子服务', () => {
    let appA!: App;

    const wrapperA = mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => {
            appA = app;
          },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const beforeUnmount = useRootService(FIND_CHILDREN_SERVICES)(ChildService);
    expect(beforeUnmount.length).toBeGreaterThan(0);

    wrapperA.unmount();

    const afterUnmount = useRootService(FIND_CHILDREN_SERVICES)(ChildService);
    expect(afterUnmount).toHaveLength(0);
  });
});
