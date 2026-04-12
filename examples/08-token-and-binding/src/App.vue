<script setup lang="ts">
/**
 * Token 系统与自定义绑定示例
 *
 * 演示内容：
 * 1. 使用 Token 实例作为服务标识符（而非 class）
 * 2. 使用 FunctionProvider（函数形式）进行自定义绑定
 * 3. toConstantValue 绑定静态常量值
 * 4. toDynamicValue 绑定动态工厂值
 *
 * FunctionProvider 是 declareProviders 的函数形式参数，
 * 接收 container 实例，允许直接调用 container.bind() API 进行灵活绑定。
 * 这种方式适用于绑定非类类型的值（字符串、对象等）。
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { API_URL, CONFIG } from './tokens';

// 使用 FunctionProvider 形式声明服务
// 传入一个函数，参数为 container 实例，可以自由调用绑定 API
declareProviders((container) => {
  // toConstantValue：绑定一个静态常量值
  container.bind(API_URL).toConstantValue('https://api.example.com');

  // toDynamicValue：绑定一个工厂函数，首次获取时执行（单例，只执行一次）
  container.bind(CONFIG).toDynamicValue(() => ({
    env: 'production',
    debug: false,
  }));
});

// 通过 Token 获取绑定的值，类型自动推导
const apiUrl = useService(API_URL);
const config = useService(CONFIG);
</script>

<template>
  <div>
    <h1>08 - Token 系统与自定义绑定</h1>
    <p>演示 Token 实例、FunctionProvider、toConstantValue、toDynamicValue</p>

    <h2>API 地址（toConstantValue）</h2>
    <p>{{ apiUrl }}</p>

    <h2>应用配置（toDynamicValue）</h2>
    <ul>
      <li>环境：{{ config.env }}</li>
      <li>调试模式：{{ config.debug ? '开启' : '关闭' }}</li>
    </ul>
  </div>
</template>
