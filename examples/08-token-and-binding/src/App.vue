<script setup lang="ts">
/**
 * Token 系统与自定义绑定示例
 *
 * 演示内容：
 * 1. Token<T> 作为服务标识符
 * 2. FunctionProvider — toConstantValue / toDynamicValue
 * 3. to(Class) vs toSelf() 两种类绑定方式
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { API_URL, CONFIG } from './tokens';
import { CountService } from './CountService';

// 用法1：FunctionProvider 形式，使用 Token 标识符
declareProviders((container) => {
  // toConstantValue：绑定静态常量值
  container.bind(API_URL).toConstantValue('https://api.example.com');

  // toDynamicValue：绑定工厂函数（单例，只执行一次）
  container.bind(CONFIG).toDynamicValue(() => ({
    env: 'production',
    debug: false,
  }));

  // to(Class)：将标识符绑定到指定实现类
  container.bind(CountService).to(CountService);
});

const apiUrl = useService(API_URL);
const config = useService(CONFIG);
const serviceViaTo = useService(CountService);
</script>

<template>
  <div>
    <h1>08 - Token 系统与自定义绑定</h1>

    <section>
      <h2>Token + toConstantValue</h2>
      <p>API 地址：<strong>{{ apiUrl }}</strong></p>
    </section>

    <section>
      <h2>Token + toDynamicValue</h2>
      <p>环境：{{ config.env }}</p>
      <p>调试模式：{{ config.debug ? '开启' : '关闭' }}</p>
    </section>

    <section>
      <h2>to(Class) vs toSelf()</h2>
      <p>
        <code>container.bind(CountService).to(CountService)</code> 与
        <code>container.bind(CountService).toSelf()</code> 完全等价。
      </p>
      <p>通过 <code>to(CountService)</code> 获取的计数：{{ serviceViaTo.count }}</p>
      <button @click="serviceViaTo.addOne">加一</button>
    </section>
  </div>
</template>
