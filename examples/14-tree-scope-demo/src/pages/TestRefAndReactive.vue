<script setup lang="ts">
/**
 * Ref 与 Reactive 深层响应式测试页面
 *
 * 验证 ref 数据在替换后仍然保持深层响应式。
 */
import { ref, reactive } from 'vue';

function getNestData() {
  return {
    data1: {
      data2: {
        data3: {
          data4: 1,
        },
      },
    },
  };
}

const refData = ref(getNestData());
const reactiveData = reactive(getNestData());

const changeRefValue = () => {
  refData.value = getNestData();
};

const autoIncrementRef = () => {
  refData.value.data1.data2.data3.data4++;
};

const autoIncrementReactive = () => {
  reactiveData.data1.data2.data3.data4++;
};
</script>

<template>
  <div>
    <div>
      <h2>验证 ref 数据在替换后仍然保持深层响应式</h2>
      <h3>测试 ref</h3>
      <div>refData.data1.data2.data3.data4: {{ refData.data1.data2.data3.data4 }}</div>
      <div>
        <button type="button" @click="changeRefValue">替换 refData.value 为新对象</button>
        <button type="button" @click="autoIncrementRef">refData.data1.data2.data3.data4 ++</button>
      </div>
    </div>
    <div>
      <h3>测试 reactive</h3>
      <div>reactiveData.data1.data2.data3.data4: {{ reactiveData.data1.data2.data3.data4 }}</div>
      <div>
        <button type="button" @click="autoIncrementReactive">reactiveData.data1.data2.data3.data4 ++</button>
      </div>
    </div>
  </div>
</template>
