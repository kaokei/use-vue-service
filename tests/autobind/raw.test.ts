/**
 * 类别4: 通过 DI 容器获取实例，但类使用了 @Raw 装饰器，对象是非响应式的
 *
 * 测试场景：
 * - 通过 createContainer 创建容器并获取 @Raw 标记的类实例
 * - 容器对 @Raw 类调用 markRaw()，使实例成为非响应式对象
 * - autobind 装饰器绑定方法时，会检查 metadata[RAW_CLASS_KEY]
 * - 对于 @Raw 类，autobind 调用 originalMethod.bind(this) 绑定到原始实例，而非响应式代理
 * - 因此方法直接修改原始实例的属性，不经过任何代理
 * - 这意味着 watch 不会触发，因为对象不是响应式的
 */

import { watch, isReactive } from 'vue';
import { autobind, Injectable, Raw } from '@/index';
import { createContainer } from '@/create-container.ts';

// 定义 @Raw + @Injectable 的服务类
@Raw()
@Injectable()
class RawService {
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

describe('autobind + @Raw + DI 容器 — 解构调用', () => {
  it('解构后作为普通函数调用，this 指向 raw 实例，属性修改正确', () => {
    const container = createContainer();
    container.bind(RawService).toSelf();
    const service = container.get(RawService);

    // 验证实例是非响应式的
    expect(isReactive(service)).toBe(false);

    // 解构方法作为普通函数调用
    const { increment } = service;
    increment();

    // 验证属性修改正确
    expect(service.count).toBe(1);

    // 由于是 @Raw 类，watch 不会触发（使用 sync flush 确保没有延迟）
    let watchCount = 0;
    watch(
      () => service.count,
      () => {
        watchCount++;
      },
      { flush: 'sync' }
    );

    // 再次调用，确认 watch 不会被触发
    increment();
    expect(service.count).toBe(2);
    expect(watchCount).toBe(0); // @Raw 类，watch 不触发
  });

  it('解构后多次调用，属性正确累加', () => {
    const container = createContainer();
    container.bind(RawService).toSelf();
    const service = container.get(RawService);

    expect(isReactive(service)).toBe(false);

    const { increment } = service;
    increment();
    increment();
    increment();

    expect(service.count).toBe(3);
  });

  it('解构后调用带参数的方法', () => {
    const container = createContainer();
    container.bind(RawService).toSelf();
    const service = container.get(RawService);

    expect(isReactive(service)).toBe(false);

    const { setMessage } = service;
    setMessage('hello');

    expect(service.message).toBe('hello');
  });
});

describe('autobind + @Raw + DI 容器 — Promise.then 回调', () => {
  it('Promise.then 传递无参方法，this 指向 raw 实例', async () => {
    const container = createContainer();
    container.bind(RawService).toSelf();
    const service = container.get(RawService);

    expect(isReactive(service)).toBe(false);

    await Promise.resolve().then(service.increment);

    expect(service.count).toBe(1);
  });

  it('Promise.then 多次链式调用', async () => {
    const container = createContainer();
    container.bind(RawService).toSelf();
    const service = container.get(RawService);

    expect(isReactive(service)).toBe(false);

    await Promise.resolve()
      .then(service.increment)
      .then(service.increment)
      .then(service.increment);

    expect(service.count).toBe(3);
  });

  it('Promise.then 传递需要参数的方法', async () => {
    const container = createContainer();
    container.bind(RawService).toSelf();
    const service = container.get(RawService);

    expect(isReactive(service)).toBe(false);

    await Promise.resolve('world').then(service.setMessage);

    expect(service.message).toBe('world');
  });
});

describe('autobind + @Raw + DI 容器 — setTimeout 回调', () => {
  it('setTimeout 传递方法作为回调，this 指向 raw 实例', async () => {
    const container = createContainer();
    container.bind(RawService).toSelf();
    const service = container.get(RawService);

    expect(isReactive(service)).toBe(false);

    await new Promise<void>((resolve) => {
      setTimeout(service.increment, 0);
      setTimeout(resolve, 10);
    });

    expect(service.count).toBe(1);
  });

  it('setTimeout 多次触发，每次正确修改 raw 实例属性', async () => {
    const container = createContainer();
    container.bind(RawService).toSelf();
    const service = container.get(RawService);

    expect(isReactive(service)).toBe(false);

    await new Promise<void>((resolve) => {
      setTimeout(service.increment, 0);
      setTimeout(service.increment, 0);
      setTimeout(service.increment, 0);
      setTimeout(resolve, 20);
    });

    expect(service.count).toBe(3);
  });
});