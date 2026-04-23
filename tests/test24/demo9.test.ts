// E3: 无任何声明，useRootService 获取服务时抛出异常
import { useRootService } from '@/index';
import { DemoService } from './DemoService';

describe('test24 - E3', () => {
  it('useRootService 在无任何声明时抛出异常', () => {
    expect(() => {
      useRootService(DemoService);
    }).toThrow('No matching binding found for token: DemoService');
  });
});
