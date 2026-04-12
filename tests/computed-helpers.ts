/**
 * @Computed 装饰器测试公共辅助工具
 *
 * 本文件提供三种方案（Plan_A_Lazy、Plan_A_Eager、Plan_B）测试所需的：
 * - 公共测试辅助类（不带装饰器的基类模板）
 * - fast-check 公共 arbitrary
 * - 公共常量
 * - 三种方案的装饰器类型别名
 */

import fc from 'fast-check';

// ============================================================================
// 公共常量
// ============================================================================

/** 属性测试（PBT）的默认迭代次数 */
export const PBT_NUM_RUNS = 100;

// ============================================================================
// fast-check 公共 arbitrary
// ============================================================================

/** 用于生成随机初始值的 arbitrary，范围 [-1000, 1000] */
export const arbInitialValue = fc.integer({ min: -1000, max: 1000 });

/** 用于生成随机变更值的 arbitrary，范围 [-1000, 1000] */
export const arbChangeValue = fc.integer({ min: -1000, max: 1000 });

/** 用于生成两个不同值的 arbitrary（初始值和变更值） */
export const arbTwoDistinctValues = fc
  .tuple(arbInitialValue, arbChangeValue)
  .filter(([a, b]) => a !== b);

// ============================================================================
// 装饰器类型别名
// ============================================================================

/**
 * Plan_A_Lazy 和 Plan_B 的装饰器类型：返回新的 getter 函数替换原始 getter
 */
export type ReturningGetterDecorator = () => (
  value: (this: any) => any,
  context: ClassGetterDecoratorContext
) => (this: any) => any;

/**
 * Plan_A_Eager 的装饰器类型：返回 void（不替换 getter 函数）
 */
export type VoidGetterDecorator = () => (
  value: (this: any) => any,
  context: ClassGetterDecoratorContext
) => void;

/**
 * 通用装饰器类型：兼容所有三种方案
 */
export type ComputedDecoratorFactory = ReturningGetterDecorator | VoidGetterDecorator;

// ============================================================================
// 公共测试辅助类（不带装饰器的基类模板）
// ============================================================================

/**
 * 创建一个带有单个 getter 的 DemoService 类。
 * 装饰器需要在各测试文件中按需应用，此处仅提供基础类结构。
 *
 * 使用示例（在测试文件中）：
 * ```ts
 * class DemoService {
 *   public id = initialValue;
 *   @SomeDecorator()
 *   public get age() { return this.computeAge(); }
 *   public computeAge() { return this.id + 10; }
 * }
 * ```
 */

/**
 * 基础 DemoService 类模板（不带装饰器）。
 * 提供 id 属性和 age getter，getter 内部调用 computeAge 方法，
 * 方便通过 vi.spyOn 监控调用次数。
 */
export class BaseDemoService {
  public id: number;
  public name = 'demo';

  constructor(id = 1) {
    this.id = id;
  }

  public get age(): number {
    return this.computeAge() + 100;
  }

  public computeAge(): number {
    return this.id + 10;
  }
}

/**
 * 带有多个 getter 的 DemoService 类模板（不带装饰器）。
 * 用于测试多 getter 独立缓存场景（Property 7）。
 */
export class BaseMultiGetterService {
  public id: number;

  constructor(id = 1) {
    this.id = id;
  }

  public get age(): number {
    return this.computeAge() + 100;
  }

  public get score(): number {
    return this.computeScore() + 200;
  }

  public computeAge(): number {
    return this.id + 10;
  }

  public computeScore(): number {
    return this.id * 2;
  }
}

/**
 * 继承场景的父类模板（不带装饰器）。
 * 用于测试继承场景（Property 9, 10）。
 */
export class BaseParentService {
  public id: number;

  constructor(id = 1) {
    this.id = id;
  }

  public get age(): number {
    return this.computeAge() + 100;
  }

  public computeAge(): number {
    return this.id + 10;
  }
}
