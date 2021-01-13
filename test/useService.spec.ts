import { useService } from '../src';
import CounterService from '../example/services/counter.service';

describe('useService', () => {
  test('测试服务状态、方法', () => {
    const counterService = useService(CounterService);
    expect(counterService.count).toBe(0);
    counterService.increment();
    expect(counterService.count).toBe(1);
    counterService.decrement();
    expect(counterService.count).toBe(0);
    counterService.add(10);
    expect(counterService.count).toBe(10);
    counterService.minus(5);
    expect(counterService.count).toBe(5);
  });
});
