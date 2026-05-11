/**
 * autobind + reactive() 响应式兼容性测试
 *
 * 测试 use-vue-service 版 autobind（value.bind(reactive(this))）的完整行为。
 * 利用 Vue 3 reactive() 幂等性，autobind 方法绑定到 reactive proxy，
 * 实现解构/回调场景下 this 正确 + 属性修改响应式。
 */
import { reactive, watch, nextTick, isReactive, markRaw } from 'vue';
import { autobind, Injectable, Raw } from '@/index';

// ==================== 测试服务类 ====================

@Injectable()
class CounterService {
  public count = 0;
  public message = '';

  public incrementNormal() {
    this.count++;
  }

  @autobind
  public incrementAutobind() {
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

// ==================== @Raw 兼容测试服务类 ====================

@Raw()
@Injectable()
class RawService {
  public count = 0;

  @autobind
  public increment() {
    this.count++;
  }

  @autobind
  public getCount() {
    return this.count;
  }
}

// ==================== 核心功能测试 ====================

describe('autobind + reactive() — 响应式兼容性', () => {
  it('@autobind 方法通过 proxy 调用，修改属性时 watch 触发', async () => {
    const raw = new CounterService();
    const proxy = reactive(raw);

    let watchCount = 0;
    watch(
      () => proxy.count,
      () => watchCount++
    );

    proxy.incrementAutobind();
    await nextTick();

    expect(watchCount).toBe(1);
  });

  it('对比：普通方法修改属性，watch 正常触发', async () => {
    const raw = new CounterService();
    const proxy = reactive(raw);

    let watchCount = 0;
    watch(
      () => proxy.count,
      () => watchCount++
    );

    proxy.incrementNormal();
    await nextTick();

    expect(watchCount).toBe(1);
  });

  it('多次修改同一属性，watch（sync模式）每次触发', () => {
    const raw = new CounterService();
    const proxy = reactive(raw);

    let watchCount = 0;
    watch(
      () => proxy.count,
      () => watchCount++,
      { flush: 'sync' }
    );

    proxy.incrementAutobind();
    expect(watchCount).toBe(1);
    proxy.incrementAutobind();
    expect(watchCount).toBe(2);
    proxy.incrementAutobind();
    expect(watchCount).toBe(3);
    expect(proxy.count).toBe(3);
  });

  it('@autobind 方法读取属性，返回 proxy 上的值', () => {
    const raw = new CounterService();
    const proxy = reactive(raw);

    proxy.count = 100;
    expect(proxy.getCount()).toBe(100);
  });
});

// ==================== 解构调用测试 ====================

describe('autobind + reactive() — 解构调用', () => {
  it('解构后作为普通函数调用，watch 触发（核心新行为）', () => {
    const raw = new CounterService();
    const proxy = reactive(raw);

    let watchCount = 0;
    watch(
      () => proxy.count,
      () => watchCount++,
      { flush: 'sync' }
    );

    const { incrementAutobind } = proxy;
    incrementAutobind();

    expect(watchCount).toBe(1);
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

    const { incrementAutobind } = proxy;
    incrementAutobind();
    incrementAutobind();
    incrementAutobind();

    expect(watchCount).toBe(3);
    expect(proxy.count).toBe(3);
  });

  it('解构后调用带参数的方法，修改正确触发 watch', () => {
    const raw = new CounterService();
    const proxy = reactive(raw);

    let lastMsg = '';
    watch(
      () => proxy.message,
      (val) => { lastMsg = val; },
      { flush: 'sync' }
    );

    const { setMessage } = proxy;
    setMessage('world');

    expect(lastMsg).toBe('world');
    expect(proxy.message).toBe('world');
  });
});

// ==================== @Raw 兼容性测试 ====================

describe('autobind + @Raw() class — 兼容性', () => {
  it('@Raw 类实例本身不是响应式的（模拟 DI 容器 activationHandle 行为）', () => {
    const raw = new RawService();

    // 模拟 use-vue-service activationHandle 对 @Raw 类的处理：
    // if (getOwnMetadata(RAW_CLASS_KEY, token)) return markRaw(obj);
    const instance = markRaw(raw);

    expect(isReactive(instance)).toBe(false);
  });

  it('@Raw 类的 autobind 方法修改 raw 实例属性', () => {
    const raw = new RawService();
    const instance = markRaw(raw);

    instance.increment();
    expect(instance.count).toBe(1);
    expect(raw.count).toBe(1);
  });

  it('@Raw 类的 autobind 方法读取属性正确', () => {
    const raw = new RawService();
    const instance = markRaw(raw);

    instance.count = 42;
    expect(instance.getCount()).toBe(42);
  });

  it('@Raw 类 + autobind 不会创建孤立 proxy（数据一致性）', () => {
    const raw = new RawService();
    const instance = markRaw(raw);

    instance.increment();
    instance.increment();
    instance.increment();

    expect(raw.count).toBe(3);
    expect(instance.count).toBe(3);
    // markRaw 返回的是同一个对象引用
    expect(raw).toBe(instance);
  });
});

// ==================== 集成场景测试 ====================

describe('autobind + reactive() — 基础行为', () => {
  it('instance 通过 reactive 包装后，isReactive 为 true（非 @Raw 类）', () => {
    const raw = new CounterService();
    const proxy = reactive(raw);
    expect(isReactive(proxy)).toBe(true);
  });

  it('proxy 和 raw 数据保持一致', () => {
    const raw = new CounterService();
    const proxy = reactive(raw);

    proxy.incrementAutobind();
    expect(raw.count).toBe(proxy.count);
  });
});
