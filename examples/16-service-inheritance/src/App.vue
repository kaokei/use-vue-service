<script setup lang="ts">
/**
 * 服务继承示例
 *
 * 演示多层类继承结构中的 DI 行为：
 * 1. BaseService 通过 @Inject 注入 LogService
 * 2. MiddleService 继承 BaseService，自动获得 logService
 * 3. TopService 继承 MiddleService，通过 @PostConstruct 执行初始化
 * 4. @Computed 装饰器在顶层服务中正常工作
 * 5. 各层级的 increaseXxx 方法只修改本层计数，互不影响
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { TopService } from './TopService';
import { LogService } from './LogService';

// 声明 TopService 和 LogService（DI 容器自动解析依赖关系）
declareProviders([TopService, LogService]);

const service = useService(TopService);
const logService = useService(LogService);
</script>

<template>
  <div>
    <h1>16 - 服务继承</h1>
    <p>演示多层类继承中 @Inject、@PostConstruct、@Computed 的行为</p>

    <section>
      <h2>@Computed 计算属性（依赖各层计数）</h2>
      <p>summary = <strong>{{ service.summary }}</strong></p>
    </section>

    <section>
      <h2>各层级计数（互相独立）</h2>
      <table border="1" cellpadding="8" cellspacing="0">
        <thead>
          <tr><th>层级</th><th>计数</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>BaseService.countBase</td>
            <td>{{ service.countBase }}</td>
            <td><button @click="service.increaseBase()">+1</button></td>
          </tr>
          <tr>
            <td>MiddleService.countMiddle</td>
            <td>{{ service.countMiddle }}</td>
            <td><button @click="service.increaseMiddle()">+1</button></td>
          </tr>
          <tr>
            <td>TopService.countTop</td>
            <td>{{ service.countTop }}</td>
            <td><button @click="service.increaseTop()">+1</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>@PostConstruct 初始化日志（由注入的 LogService 记录）</h2>
      <p>logService === service.logService：
        <strong :style="{ color: logService === service.logService ? 'green' : 'red' }">
          {{ logService === service.logService }}
        </strong>
      </p>
      <ol>
        <li v-for="(log, i) in logService.logs" :key="i">{{ log }}</li>
      </ol>
    </section>
  </div>
</template>
