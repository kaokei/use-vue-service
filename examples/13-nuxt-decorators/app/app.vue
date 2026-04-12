<script setup lang="ts">
/**
 * Nuxt 装饰器示例
 *
 * 演示在 Nuxt 项目中通过 declareProviders + useService 使用 DI 系统，
 * 配合 TC39 Stage 3 装饰器语法（@Injectable, @Inject, @Computed）。
 * 需要在 nuxt.config.ts 中开启 experimental.decorators: true
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CountService } from '~/services/CountService';
import { LoggerService } from '~/services/LoggerService';
import { GreetingService } from '~/services/GreetingService';

// 声明服务提供者，DI 容器会自动解析 CountService 对 LoggerService 的依赖
declareProviders([CountService, LoggerService, GreetingService]);

// 通过 DI 获取服务实例（已被 reactive 包装）
const countService = useService(CountService);
const greetingService = useService(GreetingService);
</script>

<template>
  <div style="max-width: 600px; margin: 40px auto; font-family: sans-serif">
    <h1>13 - Nuxt TC39 Stage 3 装饰器</h1>
    <p>演示在 Nuxt 中使用 <code>experimental.decorators: true</code> 配合 DI 系统</p>

    <section style="margin-top: 24px">
      <h2>@Computed 装饰器</h2>
      <label>
        修改名称：<input v-model="greetingService.name" />
      </label>
      <p>{{ greetingService.greeting }}</p>
    </section>

    <section style="margin-top: 24px">
      <h2>@Injectable + @Inject + @Computed</h2>
      <p>{{ countService.displayCount }}</p>
      <button @click="countService.increment">加一（控制台有日志）</button>
      <button @click="countService.reset" style="margin-left: 8px">重置</button>
    </section>
  </div>
</template>
