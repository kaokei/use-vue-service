import { mount } from '@vue/test-utils';
import { type App } from 'vue';
import DemoComp from './DemoComp.vue';
import EmptyDemoComp from './EmptyDemoComp.vue';
import { ChildService } from './ChildService';
import { DemoServiceWithInject } from './DemoServiceWithInject';
import {
  FIND_CHILD_SERVICE,
  FIND_CHILDREN_SERVICES,
  useAppService,
  declareAppProvidersPlugin,
} from '@/index';

describe('test19 — App 级作用域 (useAppService)', () => {
  it('FIND_CHILD_SERVICE 返回第一个 ChildService 实例', () => {
    let rootApp!: App;
    mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => {
            rootApp = app;
          },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const findChildService = useAppService(FIND_CHILD_SERVICE, rootApp);
    const childService = findChildService(ChildService);

    expect(childService).toBeInstanceOf(ChildService);
  });

  it('FIND_CHILDREN_SERVICES 返回 3 个 ChildService 实例', () => {
    let rootApp!: App;
    mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => {
            rootApp = app;
          },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const findChildrenServices = useAppService(FIND_CHILDREN_SERVICES, rootApp);
    const list = findChildrenServices(ChildService);

    expect(list).toHaveLength(3);
    list.forEach(s => expect(s).toBeInstanceOf(ChildService));
  });

  it('FIND_CHILD_SERVICE 返回的实例与 FIND_CHILDREN_SERVICES[0] 是同一对象', () => {
    let rootApp!: App;
    mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => {
            rootApp = app;
          },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const findChildService = useAppService(FIND_CHILD_SERVICE, rootApp);
    const findChildrenServices = useAppService(FIND_CHILDREN_SERVICES, rootApp);

    expect(findChildService(ChildService)).toBe(findChildrenServices(ChildService)[0]);
  });

  it('边界 — 无 ChildComp 时 FIND_CHILD_SERVICE 返回 undefined', () => {
    let rootApp!: App;
    mount(EmptyDemoComp, {
      global: {
        plugins: [
          (app: App) => {
            rootApp = app;
          },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const findChildService = useAppService(FIND_CHILD_SERVICE, rootApp);
    expect(findChildService(ChildService)).toBeUndefined();
  });

  it('边界 — 无 ChildComp 时 FIND_CHILDREN_SERVICES 返回空数组', () => {
    let rootApp!: App;
    mount(EmptyDemoComp, {
      global: {
        plugins: [
          (app: App) => {
            rootApp = app;
          },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const findChildrenServices = useAppService(FIND_CHILDREN_SERVICES, rootApp);
    expect(findChildrenServices(ChildService)).toEqual([]);
  });

  it('边界 — 查未在任何子组件注册的 Token 返回 undefined', () => {
    let rootApp!: App;
    mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => {
            rootApp = app;
          },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const findChildService = useAppService(FIND_CHILD_SERVICE, rootApp);
    // DemoServiceWithInject 未在 DemoComp 的子树中任何位置注册，查不到
    expect(findChildService(DemoServiceWithInject)).toBeUndefined();
  });
});
