<script setup lang="ts">
/**
 * @RunInScope 装饰器示例
 *
 * 演示内容：
 * 1. @RunInScope 为方法创建独立的 EffectScope
 * 2. 方法内的 watchEffect 由该 scope 管理
 * 3. 调用 scope.stop() 清理所有副作用
 * 4. 清理后，修改 count 不再触发 watchEffect
 */
import type { EffectScope } from 'vue';
import { shallowRef } from 'vue';
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { TimerService } from './TimerService';

// 声明服务提供者
declareProviders([TimerService]);

// 获取服务实例（已被 reactive 包装）
const timerService = useService(TimerService);

// 保存 startWatch 返回的 EffectScope，用于后续 stop
const scope = shallowRef<EffectScope | null>(null);

/** 是否正在监听 */
const isWatching = shallowRef(false);

/** 启动监听：调用 @RunInScope 装饰的方法，获取 EffectScope */
function startWatch() {
  if (isWatching.value) return;
  scope.value = timerService.startWatch();
  isWatching.value = true;
}

/** 停止监听：调用 scope.stop() 清理所有副作用 */
function stopWatch() {
  if (!isWatching.value || !scope.value) return;
  scope.value.stop();
  scope.value = null;
  isWatching.value = false;
  timerService.logs.push('[scope.stop] 已停止监听，后续 count 变化不再触发 watchEffect');
}
</script>

<template>
  <div>
    <h1>06 - @RunInScope 装饰器</h1>
    <p>
      <code>@RunInScope</code> 装饰器将方法包装在一个新的
      <code>EffectScope</code> 中执行，方法内的
      <code>watchEffect</code> 等副作用由该 scope 统一管理。
      调用 <code>scope.stop()</code> 即可一次性清理所有副作用。
    </p>

    <!-- 操作按钮 -->
    <section>
      <h2>操作</h2>
      <button @click="startWatch" :disabled="isWatching">
        {{ isWatching ? '已在监听中' : '启动监听（startWatch）' }}
      </button>
      <button @click="timerService.increment()">
        递增 count（当前：{{ timerService.count }}）
      </button>
      <button @click="stopWatch" :disabled="!isWatching">
        停止监听（scope.stop）
      </button>
    </section>

    <!-- 日志输出 -->
    <section>
      <h2>日志</h2>
      <p>
        <small>
          启动监听后，每次修改 count 都会触发 watchEffect 并记录日志。
          停止监听后，修改 count 不再产生新日志。
        </small>
      </p>
      <ul>
        <li v-for="(log, index) in timerService.logs" :key="index">
          {{ log }}
        </li>
      </ul>
      <p v-if="timerService.logs.length === 0">暂无日志</p>
    </section>

    <!-- 流程说明 -->
    <section>
      <h2>操作流程</h2>
      <ol>
        <li>点击"启动监听"→ 调用 <code>startWatch()</code>，watchEffect 立即执行一次并记录日志</li>
        <li>点击"递增 count"→ count 变化触发 watchEffect，产生新日志</li>
        <li>点击"停止监听"→ 调用 <code>scope.stop()</code>，清理所有副作用</li>
        <li>再次点击"递增 count"→ count 变化但不再触发 watchEffect，无新日志</li>
      </ol>
    </section>
  </div>
</template>
