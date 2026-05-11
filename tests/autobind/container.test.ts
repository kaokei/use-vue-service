/**
 * 类别3: 通过 DI 容器获得实例化对象，该对象是一个响应式对象
 *
 * 测试 autobind 在 DI 容器场景下的行为。当通过 createContainer().get() 获取实例时，
 * activationHandle 会对该实例调用 reactive(obj)，使得返回的 service 是一个响应式代理。
 * 由于 reactive() 是幂等的，同一个对象多次调用 reactive() 会返回相同的代理。
 * 因此 autobind 的 addInitializer 中对 this 调用 reactive(this) 时，得到的代理与
 * 容器返回的 service 是同一个对象，从而保证解构、Promise.then、setTimeout 等场景下
 * this 绑定的正确性。
 */

import { watch, isReactive } from 'vue';
import { autobind, Injectable } from '@/index';
import { createContainer } from '@/create-container.ts';

@Injectable()
class ContainerService {
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

describe('autobind + DI 容器 — 解构调用', () => {
  it('解构后作为普通函数调用，watch 正常触发', () => {
    const container = createContainer();
    container.bind(ContainerService).toSelf();
    const service = container.get(ContainerService);

    // 验证从容器获取的实例是响应式的
    expect(isReactive(service)).toBe(true);

    let watchCount = 0;
    watch(
      () => service.count,
      () => {
        watchCount++;
      },
      { flush: 'sync' }
    );

    // 解构后调用
    const { increment } = service;
    increment();

    expect(watchCount).toBe(1);
    expect(service.count).toBe(1);
  });

  it('解构后多次调用，watch 每次触发', () => {
    const container = createContainer();
    container.bind(ContainerService).toSelf();
    const service = container.get(ContainerService);

    let watchCount = 0;
    watch(
      () => service.count,
      () => {
        watchCount++;
      },
      { flush: 'sync' }
    );

    const { increment } = service;
    increment();
    increment();
    increment();

    expect(watchCount).toBe(3);
    expect(service.count).toBe(3);
  });

  it('解构后调用带参数的方法', () => {
    const container = createContainer();
    container.bind(ContainerService).toSelf();
    const service = container.get(ContainerService);

    let watchCount = 0;
    watch(
      () => service.message,
      () => {
        watchCount++;
      },
      { flush: 'sync' }
    );

    const { setMessage } = service;
    setMessage('hello');

    expect(watchCount).toBe(1);
    expect(service.message).toBe('hello');
  });
});

describe('autobind + DI 容器 — Promise.then 回调', () => {
  it('Promise.then 传递无参方法，this 指向正确，watch 触发', async () => {
    const container = createContainer();
    container.bind(ContainerService).toSelf();
    const service = container.get(ContainerService);

    expect(isReactive(service)).toBe(true);

    let watchCount = 0;
    watch(
      () => service.count,
      () => {
        watchCount++;
      },
      { flush: 'sync' }
    );

    await Promise.resolve().then(service.increment);

    expect(watchCount).toBe(1);
    expect(service.count).toBe(1);
  });

  it('Promise.then 多次链式调用', async () => {
    const container = createContainer();
    container.bind(ContainerService).toSelf();
    const service = container.get(ContainerService);

    let watchCount = 0;
    watch(
      () => service.count,
      () => {
        watchCount++;
      },
      { flush: 'sync' }
    );

    await Promise.resolve()
      .then(service.increment)
      .then(service.increment)
      .then(service.increment);

    expect(watchCount).toBe(3);
    expect(service.count).toBe(3);
  });

  it('Promise.then 传递需要参数的方法', async () => {
    const container = createContainer();
    container.bind(ContainerService).toSelf();
    const service = container.get(ContainerService);

    let watchCount = 0;
    watch(
      () => service.message,
      () => {
        watchCount++;
      },
      { flush: 'sync' }
    );

    await Promise.resolve('world').then(service.setMessage);

    expect(watchCount).toBe(1);
    expect(service.message).toBe('world');
  });
});

describe('autobind + DI 容器 — setTimeout 回调', () => {
  it('setTimeout 传递方法作为回调，watch 正常触发', async () => {
    const container = createContainer();
    container.bind(ContainerService).toSelf();
    const service = container.get(ContainerService);

    expect(isReactive(service)).toBe(true);

    let watchCount = 0;
    watch(
      () => service.count,
      () => {
        watchCount++;
      },
      { flush: 'sync' }
    );

    await new Promise<void>((resolve) => {
      setTimeout(service.increment, 0);
      setTimeout(resolve, 20);
    });

    expect(watchCount).toBe(1);
    expect(service.count).toBe(1);
  });

  it('setTimeout 多次触发，每次正确修改属性', async () => {
    const container = createContainer();
    container.bind(ContainerService).toSelf();
    const service = container.get(ContainerService);

    let watchCount = 0;
    watch(
      () => service.count,
      () => {
        watchCount++;
      },
      { flush: 'sync' }
    );

    await new Promise<void>((resolve) => {
      setTimeout(service.increment, 0);
      setTimeout(service.increment, 0);
      setTimeout(service.increment, 0);
      setTimeout(resolve, 30);
    });

    expect(watchCount).toBe(3);
    expect(service.count).toBe(3);
  });
});