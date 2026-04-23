// E2: 无任何声明，useAppService 获取服务时抛出异常
import { createApp, defineComponent } from 'vue';
import { useAppService } from '@/index';
import { DemoService } from './DemoService';

describe('test24 - E2', () => {
  it('useAppService 在无任何声明时抛出异常', () => {
    const app = createApp(defineComponent({ template: '<div/>' }));
    app.mount(document.createElement('div'));

    expect(() => {
      useAppService(DemoService, app);
    }).toThrow('No matching binding found for token: DemoService');

    app.unmount();
  });
});
