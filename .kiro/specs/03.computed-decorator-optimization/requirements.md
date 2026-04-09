# 需求文档

## 简介

`@Computed()` 装饰器是 `@kaokei/use-vue-service` 库的核心功能之一，用于将 class 中的 getter 方法转换为 Vue `computed` 响应式计算属性，实现返回值缓存和依赖追踪。当前实现虽然功能正确，但存在以下复杂度问题：

1. 在 getter 内部调用 `reactive(this)` 进行重复包装（实际上 DI 容器的 `onActivation` 钩子已经将实例转为 reactive 对象）
2. 通过原型链遍历查找 setter，逻辑冗长
3. 使用 `markRaw({ value: computedRef })` 进行额外包装，增加了间接层
4. 使用 `Symbol.for()` 全局注册缓存 key，存在跨实例命名空间污染风险

本需求旨在简化 `@Computed()` 装饰器的实现，在保持所有现有功能和行为不变的前提下，降低代码复杂度，提升可读性和可维护性。

## 术语表

- **Computed_Decorator**：`@Computed()` 装饰器函数，用于将 class getter 转换为 Vue `computed` 响应式计算属性
- **Getter_Function**：class 中通过 `get propertyName()` 语法定义的访问器方法
- **Setter_Function**：class 中通过 `set propertyName()` 语法定义的设置器方法
- **Computed_Ref**：Vue 的 `computed()` 函数返回的响应式引用对象，具有缓存和依赖追踪能力
- **EffectScope**：Vue 的副作用作用域，用于统一管理和清理 `computed`、`watch` 等响应式副作用
- **Reactive_Object**：通过 Vue `reactive()` 包装后的响应式代理对象
- **DI_Container**：`@kaokei/di` 提供的依赖注入容器，通过 `onActivation` 钩子将服务实例转为 Reactive_Object
- **Cache_Key**：用于在实例上存储 Computed_Ref 的 Symbol 键，确保每个 getter 属性有独立的缓存
- **Stage_3_Decorator**：TC39 Stage 3 提案的标准装饰器语法，TypeScript 5.0+ 原生支持

## 需求

### 需求 1：移除冗余的 reactive 包装

**用户故事：** 作为库开发者，我希望 Computed_Decorator 不再在 getter 内部重复调用 `reactive(this)`，以便减少不必要的运行时开销并简化代码逻辑。

#### 验收标准

1. THE Computed_Decorator SHALL 直接使用 `this` 引用访问实例属性，不在 getter 替换函数内部调用 `reactive(this)`
2. WHEN 服务实例已通过 DI_Container 的 `onActivation` 钩子转为 Reactive_Object 时，THE Computed_Decorator SHALL 正确追踪该 Reactive_Object 上的依赖变化
3. WHEN 服务实例未经过 `reactive()` 包装（如直接 `new` 创建）时，THE Computed_Decorator SHALL 仍然能正常执行 getter 计算，但不提供响应式缓存能力
4. WHEN 用户手动对实例调用 `reactive()` 后使用 Computed_Decorator 装饰的 getter 时，THE Computed_Decorator SHALL 正确追踪依赖并提供缓存能力

### 需求 2：简化 setter 查找机制

**用户故事：** 作为库开发者，我希望 Computed_Decorator 使用更简洁的方式获取对应的 setter，以便减少原型链遍历的复杂代码。

#### 验收标准

1. THE Computed_Decorator SHALL 利用 TC39 Stage_3_Decorator 的 `ClassGetterDecoratorContext` 提供的能力或装饰器执行时机来获取 setter 引用，替代运行时原型链遍历
2. WHEN getter 属性存在对应的 Setter_Function 时，THE Computed_Decorator SHALL 将该 Setter_Function 绑定到 Computed_Ref 的 set 方法上
3. WHEN getter 属性不存在对应的 Setter_Function 时，THE Computed_Decorator SHALL 创建只读的 Computed_Ref
4. WHEN 通过 Computed_Ref 的 setter 写入值后，THE Computed_Decorator SHALL 确保后续 getter 访问返回更新后的计算结果

### 需求 3：简化 Computed_Ref 缓存结构

**用户故事：** 作为库开发者，我希望 Computed_Decorator 使用更直接的缓存结构存储 Computed_Ref，以便减少 `markRaw` 包装带来的间接层和理解成本。

#### 验收标准

1. THE Computed_Decorator SHALL 使用独立的 Symbol 作为 Cache_Key，将 Computed_Ref 直接存储在实例上，不使用 `markRaw` 进行额外包装
2. THE Computed_Decorator SHALL 使用局部 `Symbol()`（而非 `Symbol.for()`）生成 Cache_Key，避免全局 Symbol 注册表的命名空间污染
3. WHEN 同一 getter 属性被多次访问时，THE Computed_Decorator SHALL 在首次访问时创建 Computed_Ref 并缓存，后续访问直接复用缓存的 Computed_Ref
4. WHEN 同一 class 上有多个 Computed_Decorator 装饰的 getter 时，THE Computed_Decorator SHALL 为每个 getter 使用独立的 Cache_Key，互不干扰

### 需求 4：保持 EffectScope 集成

**用户故事：** 作为库开发者，我希望简化后的 Computed_Decorator 继续在 EffectScope 内创建 Computed_Ref，以便组件卸载时能统一清理所有响应式副作用。

#### 验收标准

1. THE Computed_Decorator SHALL 在首次创建 Computed_Ref 时，通过 `getEffectScope` 获取或创建实例关联的 EffectScope，并在该 EffectScope 内执行 `computed()` 调用
2. WHEN 实例关联的 EffectScope 被停止（如组件卸载触发 `removeScope`）时，THE Computed_Decorator 创建的所有 Computed_Ref SHALL 同步停止响应式追踪

### 需求 5：保持现有 API 和行为兼容

**用户故事：** 作为库使用者，我希望 Computed_Decorator 的优化对我完全透明，以便我不需要修改任何现有代码。

#### 验收标准

1. THE Computed_Decorator SHALL 保持 `@Computed()` 的调用语法不变（带括号的工厂函数形式）
2. THE Computed_Decorator SHALL 保持 TC39 Stage_3_Decorator 的 getter decorator 签名 `(value: Function, context: ClassGetterDecoratorContext) => Function`
3. WHEN 依赖的响应式数据未发生变化时，THE Computed_Decorator SHALL 返回缓存的计算结果，不重新执行 Getter_Function
4. WHEN 依赖的响应式数据发生变化时，THE Computed_Decorator SHALL 在下次访问时重新执行 Getter_Function 并返回新的计算结果
5. THE Computed_Decorator SHALL 确保所有现有测试（包括 test20 目录下的 demo.test.ts、demo2.test.ts、demo3.test.ts）继续通过，行为不变

## 附录：候选实现方案对比

### 方案 A：当前实现（getter 替换 + 懒创建）

当前实现在返回的 getter 替换函数中，首次访问时创建 Computed_Ref 并缓存。

```typescript
import { computed, markRaw, reactive } from 'vue';
import { getEffectScope } from './scope.ts';

export function Computed(): (
  value: Function,
  context: ClassGetterDecoratorContext
) => Function {
  return function (value: Function, context: ClassGetterDecoratorContext): Function {
    const propertyName = context.name;
    const sym = Symbol.for(`__computed__${String(propertyName)}`);

    return function (this: any): any {
      const that = reactive(this);
      let computedRefObj = that[sym];
      if (!computedRefObj) {
        let originalSet: ((v: any) => void) | undefined;
        let proto = Object.getPrototypeOf(this);
        while (proto) {
          const desc = Object.getOwnPropertyDescriptor(proto, propertyName);
          if (desc && desc.set) {
            originalSet = desc.set;
            break;
          }
          proto = Object.getPrototypeOf(proto);
        }
        const scope = getEffectScope(that);
        const originalGet = value as (this: any) => any;
        const computedRef = scope.run(() => {
          return computed({
            get: () => originalGet.call(that),
            set: originalSet
              ? (v: any) => originalSet!.call(that, v)
              : undefined as any,
          });
        });
        computedRefObj = markRaw({ value: computedRef });
        that[sym] = computedRefObj;
      }
      return computedRefObj.value.value;
    };
  };
}
```

**复杂度问题：**
- 在 getter 内部调用 `reactive(this)` 进行冗余包装
- 通过原型链遍历查找 setter（while 循环 + getOwnPropertyDescriptor）
- 使用 `markRaw({ value: computedRef })` 额外包装层
- 使用 `Symbol.for()` 全局注册，存在命名空间污染风险
- 返回值需要 `computedRefObj.value.value` 双层解包

### 方案 B：addInitializer + defineProperty 懒初始化（推荐探索方向）

参考 `@kaokei/di` 中 `@LazyInject` 装饰器的模式：在 `addInitializer` 中通过 `Object.defineProperty` 将原型 getter 覆盖为实例属性（带自定义 getter），首次访问时懒创建 Computed_Ref。

```typescript
import { computed } from 'vue';
import { getEffectScope } from './scope.ts';

export function Computed() {
  return function (
    value: Function,
    context: ClassGetterDecoratorContext
  ): Function {
    const propertyName = context.name;
    const cacheKey = Symbol();

    context.addInitializer(function (this: any) {
      const instance = this;
      Object.defineProperty(instance, propertyName, {
        configurable: true,
        enumerable: true,
        get() {
          // 运行时 this 已经是 reactive 代理（DI 容器 activate 之后）
          if (!this[cacheKey]) {
            const scope = getEffectScope(this);
            const originalGet = value as (this: any) => any;
            this[cacheKey] = scope.run(() =>
              computed(() => originalGet.call(this))
            );
          }
          return this[cacheKey].value;
        },
      });
    });

    return value;
  };
}
```

**优势：**
- 移除 `reactive(this)` 冗余调用，运行时 `this` 已经是 reactive 代理
- 移除原型链遍历 setter 的复杂逻辑（setter 支持后续按需加回）
- 移除 `markRaw` 包装层，直接缓存 Computed_Ref
- 使用局部 `Symbol()` 替代 `Symbol.for()`，避免全局污染
- 返回值只需 `this[cacheKey].value` 单层解包
- 代码量从约 40 行减少到约 20 行

**关键时序依赖：**
- `addInitializer` 在 `new ClassName()` 构造函数中执行（此时 `this` 是原始实例）
- DI 容器的 `_resolveInstanceValue` 先调用 `_createInstance()`（触发 addInitializer），再调用 `activate()`（reactive 包装）
- `Object.defineProperty` 定义的 getter 在运行时被访问时，`this` 已经是 reactive 代理
- 因此 `computed(() => originalGet.call(this))` 中的依赖追踪能正确工作

**待确认事项：**
- setter 支持暂时省略，后续可通过扩展 `Object.defineProperty` 的 `set` 方法加回
- EffectScope 集成需要验证在 reactive 代理上调用 `getEffectScope` 的行为是否正确
