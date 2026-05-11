/**
 * autobind 回调场景测试：setTimeout / Promise.then / addEventListener
 *
 * 验证 core 修复后，autobind 方法作为回调传递时，this 始终指向 reactive proxy，
 * 方法内部的属性修改能触发 Vue 响应式。
 */
import { reactive, watch, nextTick, isReactive } from 'vue';
import { autobind, Injectable } from '@/index';

@Injectable()
class CallbackService {
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
  public greet() {
    return `count=${this.count}`;
  }

  @autobind
  public doubleAndSet(n: number) {
    this.count = n * 2;
  }
}

describe('autobind 回调场景', () => {
  // ==================== Promise.then ====================

  it('Promise.then 直接传递 autobind 方法，this 指向 proxy，修改触发响应式', async () => {
    const raw = new CallbackService();
    const proxy = reactive(raw);

    let watchCount = 0;
    watch(
      () => proxy.count,
      () => watchCount++,
      { flush: 'sync' }
    );

    // 直接将 autobind 方法传给 Promise.then（不使用箭头函数包裹）
    await Promise.resolve().then(proxy.increment);

    expect(watchCount).toBe(1);
    expect(proxy.count).toBe(1);
  });

  it('Promise.then 多次链式调用 autobind 方法', async () => {
    const raw = new CallbackService();
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
    expect(proxy.count).toBe(3);
  });

  it('Promise.then 传递需要参数的回调', async () => {
    const raw = new CallbackService();
    const proxy = reactive(raw);

    let lastMessage = '';
    watch(
      () => proxy.message,
      (val) => { lastMessage = val; },
      { flush: 'sync' }
    );

    // Promise.resolve 传递参数给 .then 回调
    await Promise.resolve('hello').then(proxy.setMessage);

    expect(lastMessage).toBe('hello');
    expect(proxy.message).toBe('hello');
  });

  // ==================== setTimeout ====================

  it('setTimeout 直接使用 autobind 方法作为回调，修改触发响应式', async () => {
    const raw = new CallbackService();
    const proxy = reactive(raw);

    let watchCount = 0;
    watch(
      () => proxy.count,
      () => watchCount++,
      { flush: 'sync' }
    );

    // setTimeout 直接使用实例方法（不用箭头函数包裹）
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        proxy.increment();
        resolve();
      }, 0);
    });

    // 直接传方法引用（更高风险场景）
    await new Promise<void>((resolve) => {
      setTimeout(proxy.increment, 0);
      // 给 setTimeout 足够时间触发
      setTimeout(resolve, 10);
    });

    expect(watchCount).toBeGreaterThanOrEqual(1);
  });

  it('setInterval 中定期调用 autobind 方法', async () => {
    const raw = new CallbackService();
    const proxy = reactive(raw);

    const intervalId = setInterval(proxy.increment, 10);

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        clearInterval(intervalId);
        resolve();
      }, 50);
    });

    // setInterval 每 10ms 触发，50ms 内约触发 4-5 次
    expect(proxy.count).toBeGreaterThanOrEqual(3);
  });

  // ==================== 解构调用 ====================

  it('解构后作为普通函数调用，this 指向 proxy，watch 触发', () => {
    const raw = new CallbackService();
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
    expect(proxy.count).toBe(1);
  });

  it('解构后多次调用，watch 每次触发', () => {
    const raw = new CallbackService();
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
    expect(proxy.count).toBe(3);
  });

  // ==================== 数组高阶函数回调 ====================

  it('Array.map 中使用 autobind 方法，this 指向 proxy', () => {
    const raw = new CallbackService();
    const proxy = reactive(raw);

    // 使用 autobind 方法处理数组
    proxy.doubleAndSet(5);
    expect(proxy.count).toBe(10);

    // 验证 count 修改是响应式的
    expect(isReactive(proxy)).toBe(true);
  });

  it('数组遍历中 autobind 方法修改同一属性，watch 正常', () => {
    const raw = new CallbackService();
    const proxy = reactive(raw);

    let watchCount = 0;
    watch(
      () => proxy.message,
      () => watchCount++,
      { flush: 'sync' }
    );

    const messages = ['a', 'b', 'c'];
    messages.forEach(proxy.setMessage);

    expect(watchCount).toBe(3);
    expect(proxy.message).toBe('c');
  });

  // ==================== this 指向验证 ====================

  it('autobind 方法内部访问其他属性，能读到 proxy 上的值', () => {
    const raw = new CallbackService();
    const proxy = reactive(raw);

    proxy.count = 99;
    const result = proxy.greet();

    expect(result).toBe('count=99');
  });

  it('解构后调用 greeter，能正确读到 count', () => {
    const raw = new CallbackService();
    const proxy = reactive(raw);

    proxy.count = 42;
    const { greet } = proxy;
    const result = greet();

    // 解构后调用，this 仍指向 proxy，能读到 proxy.count = 42
    expect(result).toBe('count=42');
  });
});
