<script setup lang="ts">
/**
 * 服务单例性与多次 declareProviders 示例
 *
 * 演示内容：
 * 1. 分两次调用 declareProviders 声明不同的服务（追加绑定）
 * 2. 多次 useService(CountService) 返回同一实例
 * 3. 通过任意引用修改状态，所有引用的视图同步更新
 * 4. 不同服务类之间状态互不影响
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CountService } from './CountService';
import { OtherService } from './OtherService';

// 第一次 declareProviders：声明 CountService
declareProviders([CountService]);

// 第二次 declareProviders：声明 OtherService（追加绑定，不覆盖 CountService）
declareProviders([OtherService]);

// 多次获取 CountService，返回同一实例
const countService1 = useService(CountService);
const countService2 = useService(CountService);

// 多次获取 OtherService，也返回同一实例
const otherService1 = useService(OtherService);
const otherService2 = useService(OtherService);
</script>

<template>
  <div>
    <h1>15 - 服务单例性与多次 declareProviders</h1>

    <section>
      <h2>CountService 单例性验证</h2>
      <p>
        countService1 === countService2：
        <strong :style="{ color: countService1 === countService2 ? 'green' : 'red' }">
          {{ countService1 === countService2 }}
        </strong>
      </p>
      <p>countService1.count = {{ countService1.count }}</p>
      <p>countService2.count = {{ countService2.count }}</p>
      <button @click="countService1.increaseCount()">通过 countService1 加一</button>
      <button @click="countService2.increaseCount()">通过 countService2 加一</button>
    </section>

    <section>
      <h2>OtherService 单例性验证</h2>
      <p>
        otherService1 === otherService2：
        <strong :style="{ color: otherService1 === otherService2 ? 'green' : 'red' }">
          {{ otherService1 === otherService2 }}
        </strong>
      </p>
      <p>otherService1.count = {{ otherService1.count }}</p>
      <p>otherService2.count = {{ otherService2.count }}</p>
      <button @click="otherService1.increaseCount()">通过 otherService1 加一</button>
      <button @click="otherService2.increaseCount()">通过 otherService2 加一</button>
    </section>

    <section>
      <h2>服务间状态隔离</h2>
      <p>操作 CountService 不影响 OtherService，反之亦然。</p>
    </section>
  </div>
</template>
