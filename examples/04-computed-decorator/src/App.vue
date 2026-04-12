<script setup lang="ts">
/**
 * @Computed 装饰器示例
 *
 * 演示内容：
 * 1. @Computed（不带括号）— 只读计算属性
 * 2. @Computed()（带括号）— 只读计算属性（工厂函数形式）
 * 3. writable computed — 可写计算属性（getter + setter）
 * 4. 缓存效果 — 多次访问同一计算属性，依赖不变时不会重新计算
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { UserService } from './UserService';

// 声明服务提供者
declareProviders([UserService]);

// 获取服务实例（已被 reactive 包装，计算属性自动生效）
const userService = useService(UserService);
</script>

<template>
  <div>
    <h1>04 - @Computed 装饰器</h1>

    <!-- 数据源输入 -->
    <section>
      <h2>数据源</h2>
      <label>
        姓：<input v-model="userService.firstName" />
      </label>
      <br />
      <label>
        名：<input v-model="userService.lastName" />
      </label>
    </section>

    <!-- 用法一：@Computed（不带括号） -->
    <section>
      <h2>用法一：@Computed（不带括号）</h2>
      <p>fullName = <strong>{{ userService.fullName }}</strong></p>
      <p>计算次数：{{ userService.fullNameCalcCount }}</p>
    </section>

    <!-- 用法二：@Computed()（带括号） -->
    <section>
      <h2>用法二：@Computed()（带括号）</h2>
      <p>displayName = <strong>{{ userService.displayName }}</strong></p>
      <p>计算次数：{{ userService.displayNameCalcCount }}</p>
    </section>

    <!-- 用法三：writable computed -->
    <section>
      <h2>用法三：writable computed（可写计算属性）</h2>
      <p>writableFullName = <strong>{{ userService.writableFullName }}</strong></p>
      <label>
        直接修改全名：<input v-model="userService.writableFullName" />
      </label>
      <p>
        <small>setter 会将第一个字符作为姓，其余作为名，自动更新 firstName 和 lastName</small>
      </p>
    </section>

    <!-- 缓存效果说明 -->
    <section>
      <h2>缓存效果</h2>
      <p>
        观察上方的"计算次数"：只有当 firstName 或 lastName 发生变化时，
        计算属性才会重新计算。多次渲染访问同一计算属性不会增加计算次数。
      </p>
    </section>
  </div>
</template>
