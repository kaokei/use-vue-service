// N6: useRootService 可以从 declareRootProviders 中获取服务
import { declareRootProviders, useRootService } from '@/index';
import { DemoService } from './DemoService';

declareRootProviders([DemoService]);

describe('test24 - N6', () => {
  it('useRootService 从 declareRootProviders 获取服务', () => {
    const service = useRootService(DemoService);

    expect(service).toBeInstanceOf(DemoService);
    // 多次调用返回同一根容器单例
    expect(useRootService(DemoService)).toBe(service);
  });
});
