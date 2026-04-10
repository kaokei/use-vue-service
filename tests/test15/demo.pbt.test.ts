/**
 * test15 — 属性基测试（Property-Based Tests）
 *
 * 测试场景：@PostConstruct 装饰器限制
 * 验证：单个 @PostConstruct 不抛出错误，多个 @PostConstruct 始终抛出错误
 */

import fc from 'fast-check';
import { PostConstruct, Injectable } from '@/index';
import { Container } from '@kaokei/di';

describe('test15 — 属性基测试', () => {
  /**
   * Property 1：单个 @PostConstruct 始终不抛出错误
   *
   * 对于任意初始 count 值，使用单个 @PostConstruct 的类实例化始终不抛出错误。
   */
  it('Property 1 — 单个 @PostConstruct 始终不抛出错误', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), (initialCount) => {
        expect(() => {
          @Injectable()
          class TestService {
            public count = initialCount;

            public increaseCount() {
              this.count++;
            }

            @PostConstruct()
            public init() {
              this.increaseCount();
            }
          }
          new TestService();
        }).not.toThrow();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2：多个 @PostConstruct 始终抛出特定错误
   *
   * 对于任意初始 count 值，使用多个 @PostConstruct 的类实例化始终抛出
   * "Multiple @PostConstruct decorators are not allowed in a single class." 错误。
   */
  it('Property 2 — 多个 @PostConstruct 始终抛出特定错误', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), (initialCount) => {
        expect(() => {
          @Injectable()
          class TestService {
            public count = initialCount;

            public increaseCount() {
              this.count++;
            }

            @PostConstruct()
            public init1() {
              this.increaseCount();
            }

            @PostConstruct()
            public init2() {
              this.increaseCount();
            }
          }
          new TestService();
        }).toThrow('Multiple @PostConstruct decorators are not allowed in a single class.');
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 3：@PostConstruct 执行后 count 递增
   *
   * 对于任意初始 count 值（正整数），使用单个 @PostConstruct 的类
   * 通过 DI 容器实例化后，count 应等于初始值 + 1。
   * 注意：@PostConstruct 需要通过 DI 容器实例化才会触发。
   */
  it('Property 3 — @PostConstruct 执行后 count 递增', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), (initialCount) => {
        // 使用 @kaokei/di 的 Container 直接测试
        @Injectable()
        class TestService {
          public count = initialCount;

          public increaseCount() {
            this.count++;
          }

          @PostConstruct()
          public init() {
            this.increaseCount();
          }
        }

        const container = new Container();
        container.bind(TestService).toSelf();
        const service = container.get(TestService);
        expect(service.count).toBe(initialCount + 1);
      }),
      { numRuns: 50 }
    );
  });
});
