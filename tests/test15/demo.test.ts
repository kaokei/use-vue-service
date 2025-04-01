import { mount } from '@vue/test-utils';
import { PostConstruct } from '@kaokei/di';
import { declareProviders } from '@/index';
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

        @PostConstruct()
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

        @PostConstruct()
        public test1() {
          this.increaseCount();
        }

        @PostConstruct()
        public test2() {
          this.increaseCount();
        }
      }
      new DemoService();
    }).toThrowError(
      'Cannot apply @PostConstruct decorator multiple times in the same class'
    );
  });

  it('get DemoService instance', async () => {
    expect(() => {
      class DemoService {
        public count = 1;

        public increaseCount() {
          this.count++;
        }

        @PostConstruct()
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

        @PostConstruct()
        public test1() {
          this.increaseCount();
        }

        @PostConstruct()
        public test2() {
          this.increaseCount();
        }
      }
      new DemoService();
    }).toThrow(
      'Cannot apply @PostConstruct decorator multiple times in the same class'
    );
  });

  it('get DemoService instance', async () => {
    expect(() => {
      mount(DemoComp);
    }).toThrow('something wrong');
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
    expect(() => {
      declareProviders([DemoService]);
    }).toThrowError('getProvideContainer 只能在 setup 中使用');
  });
});
