<script setup lang="ts">
/**
 * 基本用法示例
 *
 * 演示内容：
 * 1. declareProviders + useService 的基本流程
 * 2. 多次调用 declareProviders 追加绑定（不会覆盖已有服务）
 * 3. 多次调用 useService 获取同一服务——总是返回同一实例（单例）
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CountService } from './CountService';

// 第一次声明 CountService
declareProviders([CountService]);

// 再次声明同一个服务（追加绑定，不会覆盖）——实际上此处重复声明同一个服务
// 在真实场景中，多次 declareProviders 用于分别声明不同的服务
declareProviders([CountService]);

// 多次 useService 获取同一服务，返回的是同一个实例
const service1 = useService(CountService);
const service2 = useService(CountService);

// service1 === service2，同一组件内保证单例
const isSameInstance = service1 === service2;
</script>

<template>
  <div>
    <h1>01 - 基本用法</h1>

    <section>
      <h2>基础用法</h2>
      <p>当前计数：{{ service1.count }}</p>
      <button @click="service1.addOne">加一（通过 service1）</button>
    </section>

    <section>
      <h2>服务单例性验证</h2>
      <p>
        service1 === service2：
        <strong :style="{ color: isSameInstance ? 'green' : 'red' }">
          {{ isSameInstance }}
        </strong>
      </p>
      <p>service1.count = {{ service1.count }}</p>
      <p>service2.count = {{ service2.count }}</p>
      <p>（两者始终相同，因为它们是同一个实例）</p>
      <button @click="service2.addOne">加一（通过 service2）</button>
    </section>
  </div>
</template>
