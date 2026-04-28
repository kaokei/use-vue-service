<script setup lang="ts">
/**
 * @PostConstruct + @RunInScope 配合示例
 *
 * 演示内容：
 * 1. @PostConstruct 在服务实例化完成后自动调用 init()
 * 2. init() 内部调用 @RunInScope 装饰的 startWatch()
 * 3. useService 拿到实例时，watchEffect 监听已自动建立
 * 4. 调用 scope.stop() 可随时手动停止监听
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { PriceService } from './PriceService';

// 声明服务提供者
declareProviders([PriceService]);

// 获取服务实例——此时 @PostConstruct → startWatch() → watchEffect 已自动执行一次
const priceService = useService(PriceService);
</script>

<template>
  <div>
    <h1>18 - @PostConstruct 与 @RunInScope 配合</h1>
    <p>
      在 <code>@PostConstruct</code> 方法内调用 <code>@RunInScope</code> 装饰的方法，
      <br />
      实现"<strong>useService 即监听</strong>"——拿到服务实例时响应式监听已自动建立。
    </p>

    <section>
      <h2>当前状态</h2>
      <p>单价：{{ priceService.unitPrice }} 元</p>
      <p>数量：{{ priceService.quantity }}</p>
      <p>
        总价：<strong>{{ priceService.total }} 元</strong>
      </p>
      <p>
        监听状态：
        <strong :style="{ color: priceService.scope ? 'green' : 'gray' }">
          {{ priceService.scope ? '监听中' : '已停止' }}
        </strong>
      </p>
    </section>

    <section>
      <h2>操作</h2>
      <button @click="priceService.unitPrice += 10">单价 +10</button>
      <button @click="priceService.unitPrice -= 10" :disabled="priceService.unitPrice <= 10">
        单价 -10
      </button>
      <button @click="priceService.quantity++">数量 +1</button>
      <button @click="priceService.quantity--" :disabled="priceService.quantity <= 1">
        数量 -1
      </button>
      <button @click="priceService.stopWatch()" :disabled="!priceService.scope">
        停止监听（scope.stop）
      </button>
    </section>

    <section>
      <h2>watchEffect 日志</h2>
      <p>
        <small>
          每次修改单价或数量，watchEffect 自动重新计算总价并追加日志。<br />
          停止监听后，修改数据不再产生新日志（总价也不再更新）。
        </small>
      </p>
      <ul>
        <li v-for="(log, index) in priceService.logs" :key="index">{{ log }}</li>
      </ul>
      <p v-if="priceService.logs.length === 0">暂无日志</p>
    </section>

    <section>
      <h2>核心原理</h2>
      <ol>
        <li>
          <code>@RunInScope</code> 装饰 <code>startWatch()</code>：
          每次调用时在独立的 EffectScope 中执行方法体，并返回该 scope
        </li>
        <li>
          <code>@PostConstruct</code> 装饰 <code>init()</code>：
          服务实例化完成后自动执行，无需组件手动调用
        </li>
        <li>
          <code>init()</code> 内调用 <code>startWatch()</code>，
          将返回的 scope 保存到 <code>this.scope</code>
        </li>
        <li>
          结果：<code>useService(PriceService)</code> 拿到实例时，
          watchEffect 已在运行，数据变化立即触发响应
        </li>
      </ol>
    </section>
  </div>
</template>
