import 'reflect-metadata';
import { useService } from '../src';
import { DESIGN_PARAM_TYPES, SERVICE_PARAM_TYPES } from '../src/ServiceContext';

import CounterService from './data/Counter.service';

jest.mock('vue', () => ({
  inject: jest.fn(() => {
    return {};
  }),
  reactive: jest.fn(args => args),
}));

describe('useService', () => {
  test('Test CounterService', () => {
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
