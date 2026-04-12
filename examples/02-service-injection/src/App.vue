<script setup lang="ts">
/**
 * 服务间依赖注入示例
 *
 * 演示 @Inject 装饰器的服务间依赖注入：
 * 1. LoggerService 是一个简单的日志服务
 * 2. CountService 通过 @Inject(LoggerService) 自动注入 LoggerService 实例
 * 3. 调用 addOne 时，CountService 内部会通过注入的 logger 输出日志
 *
 * 关键点：declareProviders 声明两个服务后，DI 容器会自动解析依赖关系，
 * CountService 实例化时会自动注入 LoggerService 实例。
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CountService } from './CountService';
import { LoggerService } from './LoggerService';

// 声明两个服务提供者，DI 容器会自动处理 CountService 对 LoggerService 的依赖
declareProviders([CountService, LoggerService]);

// 获取 CountService 实例，其 logger 属性已被自动注入
const countService = useService(CountService);
</script>

<template>
  <div>
    <h1>02 - 服务间依赖注入</h1>
    <p>演示 @Inject 装饰器注入依赖服务（打开控制台查看日志输出）</p>

    <div>
      <p>当前计数：{{ countService.count }}</p>
      <button @click="countService.addOne">加一</button>
    </div>
  </div>
</template>
