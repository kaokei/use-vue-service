/**
 * test23 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：computed 自动解包行为研究
 * 验证：reactive 对象上 computed 自动解包的通用属性
 */

import fc from 'fast-check';
import { reactive, isRef } from 'vue';
import { DemoService } from './DemoService';

const arbInitialX = fc.integer({ min: 1, max: 1000 });
const arbNewX = fc.integer({ min: 1, max: 1000 });
const arbIncreaseTimes = fc.integer({ min: 1, max: 10 });

describe('test23 — 属性基测试', () => {
  /**
   * Property 1：普通对象上 computedX 始终是 ComputedRef（不自动解包）
   *
   * 对于任意初始 x 值，普通对象（非 reactive）上的 computedX 属性
   * 始终是 ComputedRef，不会自动解包。
   */
  it('Property 1 — 普通对象上 computedX 始终是 ComputedRef', () => {
    fc.assert(
      fc.property(arbInitialX, (initialX) => {
        const t = new DemoService();
        t.x = initialX;

        // 注意：computedX 在构造时已创建，修改 x 后需要重新创建实例
        const t2 = new DemoService();
        // 普通对象上 computedX 是 ComputedRef
        expect(isRef(t2.computedX)).toBe(true);
        expect(typeof t2.computedX).not.toBe('number');
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 2：reactive 对象上 computedX 始终自动解包为原始值
   *
   * 对于任意初始 x 值，reactive 对象上的 computedX 属性
   * 始终自动解包，直接返回原始值（数字类型）。
   */
  it('Property 2 — reactive 对象上 computedX 始终自动解包为原始值', () => {
    fc.assert(
      fc.property(arbInitialX, (initialX) => {
        const t = new DemoService();
        const rt = reactive(t);
        rt.x = initialX;

        expect(isRef(rt.computedX)).toBe(false);
        expect(typeof rt.computedX).toBe('number');
        expect(rt.computedX).toBe(initialX);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 3：reactive 对象上 getX 始终返回正确的原始值
   *
   * 对于任意 x 值，reactive 对象上的 getX getter 始终返回当前 x 的值。
   */
  it('Property 3 — reactive 对象上 getX 始终返回正确的原始值', () => {
    fc.assert(
      fc.property(arbInitialX, arbNewX, (initialX, newX) => {
        const t = new DemoService();
        const rt = reactive(t);

        rt.x = initialX;
        expect(rt.getX).toBe(initialX);
        expect(isRef(rt.getX)).toBe(false);

        rt.x = newX;
        expect(rt.getX).toBe(newX);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 4：reactive 对象上 increaseX 后 getX 和 getComputedX 同步更新
   *
   * 对于任意增加次数 n，每次调用 increaseX 后，
   * getX 和 getComputedX 始终返回正确的更新值。
   */
  it('Property 4 — increaseX 后 getX 和 getComputedX 同步更新', () => {
    fc.assert(
      fc.property(arbIncreaseTimes, (increaseTimes) => {
        const t = new DemoService();
        const rt = reactive(t);

        let expectedX = 1;

        for (let i = 0; i < increaseTimes; i++) {
          rt.increaseX();
          expectedX++;
          expect(rt.x).toBe(expectedX);
          expect(rt.getX).toBe(expectedX);
          expect(rt.getComputedX).toBe(expectedX);
        }
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 5：普通对象上 increaseX 后 computedX 不更新（非响应式依赖）
   *
   * 对于任意增加次数 n，在普通对象（非 reactive）上调用 increaseX 后，
   * computedX 的值始终保持初始值（因为 this.x 不是响应式依赖）。
   */
  it('Property 5 — 普通对象上 increaseX 后 computedX 不更新', () => {
    fc.assert(
      fc.property(arbIncreaseTimes, (increaseTimes) => {
        const t = new DemoService();
        const initialComputedXValue = t.computedX.value;

        for (let i = 0; i < increaseTimes; i++) {
          t.increaseX();
        }

        // 普通对象上 computedX 不会响应 x 的变化
        expect(t.computedX.value).toBe(initialComputedXValue);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 6：reactive 对象上直接修改 x 后 computedX 同步更新
   *
   * 对于任意初始 x 和新 x 值，在 reactive 对象上直接修改 x 后，
   * computedX 始终返回新的 x 值。
   */
  it('Property 6 — reactive 对象上直接修改 x 后 computedX 同步更新', () => {
    fc.assert(
      fc.property(arbInitialX, arbNewX, (initialX, newX) => {
        const t = new DemoService();
        const rt = reactive(t);

        rt.x = initialX;
        expect(rt.computedX).toBe(initialX);

        rt.x = newX;
        expect(rt.computedX).toBe(newX);
        expect(rt.getX).toBe(newX);
        expect(rt.getComputedX).toBe(newX);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 7：普通对象内部 this 访问 computedX 始终是 ComputedRef
   *
   * 对于任意初始 x 值，在普通对象内部通过 this 访问 computedX，
   * 始终是 ComputedRef（不自动解包）。
   */
  it('Property 7 — 普通对象内部 this 访问 computedX 始终是 ComputedRef', () => {
    fc.assert(
      fc.property(arbInitialX, (initialX) => {
        const t = new DemoService();
        t.x = initialX;

        const info = t.inspectInternalAccess();

        expect(info.computedX_isRef).toBe(true);
        expect(info.getX_isRef).toBe(false);
        expect(info.x_isRef).toBe(false);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 8：reactive 对象内部 this 访问 computedX 自动解包
   *
   * 对于任意初始 x 值，在 reactive 对象内部通过 this 访问 computedX，
   * 始终自动解包，返回原始值。
   */
  it('Property 8 — reactive 对象内部 this 访问 computedX 自动解包', () => {
    fc.assert(
      fc.property(arbInitialX, (initialX) => {
        const t = new DemoService();
        const rt = reactive(t);
        rt.x = initialX;

        const info = rt.inspectInternalAccess();

        expect(info.computedX_isRef).toBe(false);
        expect(info.computedX_value).toBe(initialX);
        expect(info.getX_value).toBe(initialX);
        expect(info.x_value).toBe(initialX);
      }),
      { numRuns: 50 }
    );
  });
});
