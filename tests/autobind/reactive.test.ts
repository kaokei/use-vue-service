/**
 * autobind + reactive() 响应式兼容性测试
 *
 * 测试类别2：先 new Class() 再通过 reactive() 变成响应式对象
 *
 * 当用户显式使用 const proxy = reactive(new MyService()) 时，autobind 装饰器
 * 确保方法绑定到 reactive proxy，使得：
 * 1. 解构调用时 this 仍指向 proxy，属性修改触发响应式更新
 * 2. 作为 Promise.then 回调时，this 正确，属性修改触发响应式更新
 * 3. 作为 setTimeout 回调时，this 正确，属性修改触发响应式更新
 */
import { reactive, watch, isReactive } from 'vue';
import { autobind, Injectable } from '@/index';

// ==================== 测试服务类 ====================

@Injectable()
class CounterService {
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

// ==================== 类别2：先 new Class() 再通过 reactive() 变成响应式对象 ====================

describe('autobind + reactive() — 解构调用', () => {
  it('解构后作为普通函数调用，watch 正常触发', () => {
    const raw = new CounterService();
    const proxy = reactive(raw);

    let watchCount = 0;
    watch(
      () => proxy.count,
      () => watchCount++,
      { flush: 'sync' }
    );

    const { increment } = proxy;
    increment();

    expect(watchCount).toBe(1);
    expect(raw.count).toBe(1);
    expect(proxy.count).toBe(1);
  });

  it('解构后多次调用，watch 每次触发', () => {
    const raw = new CounterService();
    const proxy = reactive(raw);

    let watchCount = 0;
    watch(
      () => proxy.count,
      () => watchCount++,
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
    const raw = new CounterService();
    const proxy = reactive(raw);

    let lastMsg = '';
    watch(
      () => proxy.message,
      (val) => { lastMsg = val; },
      { flush: 'sync' }
    );

    const { setMessage } = proxy;
    setMessage('hello');

    expect(lastMsg).toBe('hello');
    expect(raw.message).toBe('hello');
    expect(proxy.message).toBe('hello');
  });
});

describe('autobind + reactive() — Promise.then 回调', () => {
  it('Promise.then 传递无参方法', async () => {
    const raw = new CounterService();
    const proxy = reactive(raw);

    let watchCount = 0;
    watch(
      () => proxy.count,
      () => watchCount++,
      { flush: 'sync' }
    );

    await Promise.resolve().then(proxy.increment);

    expect(watchCount).toBe(1);
    expect(raw.count).toBe(1);
    expect(proxy.count).toBe(1);
  });

  it('Promise.then 多次链式调用', async () => {
    const raw = new CounterService();
    const proxy = reactive(raw);

    let watchCount = 0;
    watch(
      () => proxy.count,
      () => watchCount++,
      { flush: 'sync' }
    );

    await Promise.resolve()
      .then(proxy.increment)
      .then(proxy.increment)
      .then(proxy.increment);

    expect(watchCount).toBe(3);
    expect(raw.count).toBe(3);
    expect(proxy.count).toBe(3);
  });

  it('Promise.then 传递需要参数的方法', async () => {
    const raw = new CounterService();
    const proxy = reactive(raw);

    let lastMsg = '';
    watch(
      () => proxy.message,
      (val) => { lastMsg = val; },
      { flush: 'sync' }
    );

    await Promise.resolve('hello').then(proxy.setMessage);

    expect(lastMsg).toBe('hello');
    expect(raw.message).toBe('hello');
    expect(proxy.message).toBe('hello');
  });
});

describe('autobind + reactive() — setTimeout 回调', () => {
  it('setTimeout 传递方法作为回调', async () => {
    const raw = new CounterService();
    const proxy = reactive(raw);

    let watchCount = 0;
    watch(
      () => proxy.count,
      () => watchCount++,
      { flush: 'sync' }
    );

    await new Promise<void>((resolve) => {
      setTimeout(proxy.increment, 0);
      setTimeout(resolve, 20);
    });

    expect(watchCount).toBe(1);
    expect(raw.count).toBe(1);
    expect(proxy.count).toBe(1);
  });

  it('setTimeout 多次触发', async () => {
    const raw = new CounterService();
    const proxy = reactive(raw);

    let watchCount = 0;
    watch(
      () => proxy.count,
      () => watchCount++,
      { flush: 'sync' }
    );

    await new Promise<void>((resolve) => {
      setTimeout(proxy.increment, 0);
      setTimeout(proxy.increment, 0);
      setTimeout(proxy.increment, 0);
      setTimeout(resolve, 20);
    });

    expect(watchCount).toBe(3);
    expect(raw.count).toBe(3);
    expect(proxy.count).toBe(3);
  });
});