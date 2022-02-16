import 'reflect-metadata';

import {
  declareRootProviders,
  useRootService,
  declareProviders,
  useService,
} from '@src/index';

import Logger from '@services/logger.service';
import Counter from '@services/counter.service';

describe('declareRootProviders and useRootService', () => {
  test('测试declareRootProviders和useRootService', async () => {
    declareRootProviders([
      {
        provide: Counter,
        useClass: Counter,
      },
    ]);
    const counterService = useRootService(Counter);
    expect(counterService.count).toBe(0);
    counterService.add(10);
    expect(counterService.count).toBe(10);
    counterService.minus(5);
    expect(counterService.count).toBe(5);
    counterService.increment();
    expect(counterService.count).toBe(6);
    counterService.decrement();
    expect(counterService.count).toBe(5);
  });

  test('测试declareProviders', async () => {
    expect(() => {
      declareProviders([Counter]);
    }).toThrow();
  });

  test('测试useService', async () => {
    expect(() => {
      useService(Counter);
    }).toThrow();
  });
});
