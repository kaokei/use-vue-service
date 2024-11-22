import 'reflect-metadata';
import { mount } from '@vue/test-utils';
import { postConstruct } from 'inversify';
import { postReactive, declareProviders } from '../../src';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';

describe('test15', () => {
  it('get DemoService instance', async () => {
    expect(() => {
      class DemoService {
        public count = 1;

        public increaseCount() {
          this.count++;
        }

        @postConstruct()
        public test1() {
          this.increaseCount();
        }
      }
      new DemoService();
    }).not.toThrow();
  });

  it('get DemoService instance', async () => {
    expect(() => {
      class DemoService {
        public count = 1;

        public increaseCount() {
          this.count++;
        }

        @postConstruct()
        public test1() {
          this.increaseCount();
        }

        @postConstruct()
        public test2() {
          this.increaseCount();
        }
      }
      new DemoService();
    }).toThrow(
      'Cannot apply @postConstruct decorator multiple times in the same class'
    );
  });

  it('get DemoService instance', async () => {
    expect(() => {
      class DemoService {
        public count = 1;

        public increaseCount() {
          this.count++;
        }

        @postReactive()
        public test1() {
          this.increaseCount();
        }
      }
      new DemoService();
    }).not.toThrow();
  });

  it('get DemoService instance', async () => {
    expect(() => {
      class DemoService {
        public count = 1;

        public increaseCount() {
          this.count++;
        }

        @postReactive()
        public test1() {
          this.increaseCount();
        }

        @postReactive()
        public test2() {
          this.increaseCount();
        }
      }
      new DemoService();
    }).toThrow(
      'Cannot apply @postReactive decorator multiple times in the same class'
    );
  });

  it('get DemoService instance', async () => {
    expect(() => {
      mount(DemoComp);
    }).toThrow('@postReactive error in class DemoService: something wrong');
  });
});

describe('declareProviders', () => {
  // 在 describe 块中定义一次 spyOn
  let consoleWarnSpy: any;

  beforeEach(() => {
    // 监视 console.warn
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // 恢复 console.warn 的原始实现
    consoleWarnSpy.mockRestore();
  });

  it('should call console.warn with the expected message when condition is true', () => {
    declareProviders([DemoService]);

    // 断言 console.warn 被调用了2次
    expect(consoleWarnSpy).toHaveBeenCalledTimes(2);

    // 断言 console.warn 被调用时的参数
    expect(consoleWarnSpy).toHaveBeenNthCalledWith(
      1,
      'declareProviders can only be used inside setup() or functional components.'
    );
    expect(consoleWarnSpy).toHaveBeenNthCalledWith(
      2,
      'declareAppProviders|declareProviders|useService can only be used inside setup() or functional components.'
    );
  });
});
