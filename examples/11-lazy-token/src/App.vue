<script setup lang="ts">
/**
 * LazyToken 解决循环依赖示例
 *
 * 演示两个服务互相依赖的场景：
 * 1. ServiceA 通过 @Inject(new LazyToken(() => ServiceB)) 依赖 ServiceB
 * 2. ServiceB 通过 @Inject(new LazyToken(() => ServiceA)) 依赖 ServiceA
 * 3. LazyToken 延迟解析类引用，避免模块加载时的循环引用问题
 *
 * 关键点：
 * - LazyToken 从 @kaokei/use-vue-service 导入（重新导出自 @kaokei/di）
 * - LazyToken 接收一个工厂函数 () => ServiceClass，在实际解析时才调用
 * - DI 容器通过先实例化再注入属性的策略，天然支持属性注入的循环依赖
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { ServiceA } from './ServiceA';
import { ServiceB } from './ServiceB';

// 声明两个互相依赖的服务，DI 容器会自动处理循环依赖
declareProviders([ServiceA, ServiceB]);

// 获取服务实例——此时循环依赖已被正确解析
const serviceA = useService(ServiceA);
const serviceB = useService(ServiceB);
</script>

<template>
  <div>
    <h1>11 - LazyToken 解决循环依赖</h1>
    <p>演示两个服务互相依赖，通过 LazyToken 延迟解析避免循环引用</p>

    <h2>ServiceA</h2>
    <p>名称：{{ serviceA.name }}</p>
    <p>介绍：{{ serviceA.getGreeting() }}</p>

    <h2>ServiceB</h2>
    <p>名称：{{ serviceB.name }}</p>
    <p>介绍：{{ serviceB.getGreeting() }}</p>

    <h2>循环引用验证</h2>
    <p>
      serviceA.serviceB === serviceB：
      <strong :style="{ color: serviceA.serviceB === serviceB ? 'green' : 'red' }">
        {{ serviceA.serviceB === serviceB }}
      </strong>
    </p>
    <p>
      serviceB.serviceA === serviceA：
      <strong :style="{ color: serviceB.serviceA === serviceA ? 'green' : 'red' }">
        {{ serviceB.serviceA === serviceA }}
      </strong>
    </p>
  </div>
</template>
