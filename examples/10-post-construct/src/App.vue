<script setup lang="ts">
/**
 * @PostConstruct 生命周期示例
 *
 * 演示 @PostConstruct 装饰器的效果：
 * 1. 服务实例创建后，@PostConstruct 标记的方法会自动执行
 * 2. 无需手动调用 init()，初始化逻辑已在获取服务实例时完成
 * 3. 适合用于依赖注入完成后的初始化操作
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { DataService } from './DataService';

// 声明服务提供者
declareProviders([DataService]);

// 获取服务实例——此时 @PostConstruct 标记的 init() 已自动执行完毕
const dataService = useService(DataService);
</script>

<template>
  <div>
    <h1>10 - @PostConstruct 生命周期</h1>
    <p>演示 @PostConstruct 装饰器在服务创建后自动执行初始化方法</p>

    <h2>初始化状态</h2>
    <p>
      是否已初始化：
      <strong :style="{ color: dataService.initialized ? 'green' : 'red' }">
        {{ dataService.initialized ? '是' : '否' }}
      </strong>
    </p>

    <h2>数据列表（由 @PostConstruct 自动填充）</h2>
    <ul>
      <li v-for="item in dataService.data" :key="item">{{ item }}</li>
    </ul>
    <p v-if="dataService.data.length === 0">暂无数据</p>

    <h2>生命周期日志</h2>
    <ol>
      <li v-for="(log, index) in dataService.logs" :key="index">{{ log }}</li>
    </ol>
  </div>
</template>
