/**
 * test20 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：@Computed 装饰器的缓存和响应式行为
 * 验证：@Computed 装饰器在 reactive 场景下的缓存有效性和响应式更新
 */

import fc from 'fast-check';
import { Computed } from '@/index';
import { reactive } from 'vue';

const arbInitialId = fc.integer({ min: 1, max: 100 });
const arbNewId = fc.integer({ min: 1, max: 100 });
const arbAccessCount = fc.integer({ min: 2, max: 10 });

describe('test20 — 属性基测试', () => {
  /**
   * Property 1：@Computed 装饰器在 reactive 场景下返回正确的初始值
   *
   * 对于任意初始 id 值，@Computed 装饰的 getter 在 reactive 代理上
   * 始终返回正确的计算结果（id + 10 + 100）。
   */
  it('Property 1 — @Computed 在 reactive 场景下返回正确的初始值', () => {
    fc.assert(
      fc.property(arbInitialId, (initialId) => {
        class DemoService {
          public id = initialId;

          @Computed()
          public get age() {
            return this.getAge() + 100;
          }

          public getAge() {
            return this.id + 10;
          }
        }

        const demo = new DemoService();
        const reactiveDemo = reactive(demo);

        expect(reactiveDemo.age).toBe(initialId + 10 + 100);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 2：@Computed 装饰器在 reactive 场景下依赖变化后正确更新
   *
   * 对于任意初始 id 和新 id，修改 reactive 代理上的 id 后，
   * @Computed 装饰的 getter 应返回基于新 id 的计算结果。
   */
  it('Property 2 — @Computed 在 reactive 场景下依赖变化后正确更新', () => {
    fc.assert(
      fc.property(arbInitialId, arbNewId, (initialId, newId) => {
        class DemoService {
          public id = initialId;

          @Computed()
          public get age() {
            return this.getAge() + 100;
          }

          public getAge() {
            return this.id + 10;
          }
        }

        const demo = new DemoService();
        const reactiveDemo = reactive(demo);

        expect(reactiveDemo.age).toBe(initialId + 110);

        reactiveDemo.id = newId;

        expect(reactiveDemo.age).toBe(newId + 110);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 3：@Computed 装饰器在 reactive 场景下依赖未变化时不重新计算
   *
   * 对于任意初始 id 和访问次数，在依赖未变化的情况下，
   * 多次访问 @Computed 装饰的 getter 只触发一次计算（缓存有效）。
   */
  it('Property 3 — @Computed 在 reactive 场景下依赖未变化时不重新计算', () => {
    fc.assert(
      fc.property(arbInitialId, arbAccessCount, (initialId, accessCount) => {
        class DemoService {
          public id = initialId;

          @Computed()
          public get age() {
            return this.getAge() + 100;
          }

          public getAge() {
            return this.id + 10;
          }
        }

        const spyOnGetAge = vi.spyOn(DemoService.prototype, 'getAge');

        const demo = new DemoService();
        const reactiveDemo = reactive(demo);

        expect(spyOnGetAge).not.toHaveBeenCalled();

        // 首次访问触发计算
        expect(reactiveDemo.age).toBe(initialId + 110);
        expect(spyOnGetAge).toHaveBeenCalledTimes(1);

        // 多次访问，依赖未变化，不重新计算
        for (let i = 0; i < accessCount - 1; i++) {
          expect(reactiveDemo.age).toBe(initialId + 110);
        }
        expect(spyOnGetAge).toHaveBeenCalledTimes(1);

        spyOnGetAge.mockRestore();
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property 4：@Computed 多个 getter 独立缓存
   *
   * 对于任意初始 id 和新 id，两个 @Computed 装饰的 getter 独立缓存，
   * 修改共享依赖后各自返回正确的计算结果。
   */
  it('Property 4 — @Computed 多个 getter 独立缓存', () => {
    fc.assert(
      fc.property(
        arbInitialId,
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 5 }),
        (initialId, changeValues) => {
          class DemoService {
            public id = initialId;

            @Computed()
            public get age() {
              return this.getAge() + 100;
            }

            @Computed()
            public get age2() {
              return this.getAge() + 200;
            }

            public getAge() {
              return this.id + 10;
            }
          }

          const demo = new DemoService();
          const reactiveDemo = reactive(demo);

          expect(reactiveDemo.age).toBe(initialId + 110);
          expect(reactiveDemo.age2).toBe(initialId + 210);

          for (const newId of changeValues) {
            reactiveDemo.id = newId;
            expect(reactiveDemo.age).toBe(newId + 110);
            expect(reactiveDemo.age2).toBe(newId + 210);
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});
