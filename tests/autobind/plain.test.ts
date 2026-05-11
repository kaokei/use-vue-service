/**
 * 类别1: 直接 new Class() 实例化，对象无响应式能力
 *
 * 本测试验证 autobind 装饰器在直接使用 new 构造实例时的行为。
 * 当使用 new PlainService() 时，autobind 装饰器在 addInitializer 中会调用
 * originalMethod.bind(reactive(this))，这意味着在构造过程中就已经创建了一个响应式代理。
 *
 * 由于 Vue 3 的 reactive() 是幂等的，它在内部使用 WeakMap 缓存 raw→proxy 的映射关系。
 * 因此在构造完成后调用 reactive(raw) 会返回 autobind 内部已经创建好的同一个代理。
 * 这使得我们可以在构造后获取到 proxy 引用，从而测试 watch 等响应式特性。
 *
 * 本测试不涉及 @Injectable() 或 DI 容器，仅测试纯 autobind + new Class() 的场景。
 */

import { reactive, watch, isReactive } from 'vue';
import { autobind } from '@/index';

class PlainService {
  public count = 0;
  public message = '';

  @autobind
  public increment() {
    this.count++;
  }

  @autobind
  public setMessage(msg: string) {
    this.message = msg;
  }

  @autobind
  public getCount() {
    return this.count;
  }
}

describe('autobind + new Class() — 解构调用', () => {
  it('解构后作为普通函数调用，this 指向内部 proxy，属性修改正确', () => {
    const raw = new PlainService();
    const proxy = reactive(raw);

    // 验证 proxy 是响应式的
    expect(isReactive(proxy)).toBe(true);

    // 解构赋值
    const { increment } = proxy;
    increment();

    // 验证 raw 和 proxy 的 count 都正确
    expect(raw.count).toBe(1);
    expect(proxy.count).toBe(1);
  });

  it('解构后多次调用，watch 正常触发', () => {
    const raw = new PlainService();
    const proxy = reactive(raw);

    let watchCount = 0;
    watch(
      () => proxy.count,
      () => {
        watchCount++;
      },
      { flush: 'sync' }
    );

    const { increment } = proxy;
    increment();
    increment();
    increment();

    expect(watchCount).toBe(3);
    expect(raw.count).toBe(3);
    expect(proxy.count).toBe(3);
  });

  it('解构后调用带参数的方法', () => {
    const raw = new PlainService();
    const proxy = reactive(raw);

    const { setMessage } = proxy;
    setMessage('hello');

    expect(proxy.message).toBe('hello');
    expect(raw.message).toBe('hello');
  });
});

describe('autobind + new Class() — Promise.then 回调', () => {
  it('Promise.then 传递无参方法，this 指向正确', async () => {
    const raw = new PlainService();
    const proxy = reactive(raw);

    await Promise.resolve().then(proxy.increment);

    expect(raw.count).toBe(1);
    expect(proxy.count).toBe(1);
  });

  it('Promise.then 多次链式调用', async () => {
    const raw = new PlainService();
    const proxy = reactive(raw);

    await Promise.resolve()
      .then(proxy.increment)
      .then(proxy.increment)
      .then(proxy.increment);

    expect(raw.count).toBe(3);
    expect(proxy.count).toBe(3);
  });

  it('Promise.then 传递需要参数的方法', async () => {
    const raw = new PlainService();
    const proxy = reactive(raw);

    await Promise.resolve('world').then(proxy.setMessage);

    expect(proxy.message).toBe('world');
    expect(raw.message).toBe('world');
  });
});

describe('autobind + new Class() — setTimeout 回调', () => {
  it('setTimeout 传递方法作为回调，this 指向正确', async () => {
    const raw = new PlainService();
    const proxy = reactive(raw);

    await new Promise<void>((resolve) => {
      setTimeout(proxy.increment, 0);
      setTimeout(resolve, 20);
    });

    expect(raw.count).toBe(1);
    expect(proxy.count).toBe(1);
  });

  it('setTimeout 多次触发，每次正确修改属性', async () => {
    const raw = new PlainService();
    const proxy = reactive(raw);

    await new Promise<void>((resolve) => {
      setTimeout(proxy.increment, 0);
      setTimeout(proxy.increment, 10);
      setTimeout(proxy.increment, 20);
      setTimeout(resolve, 50);
    });

    expect(raw.count).toBe(3);
    expect(proxy.count).toBe(3);
  });
});