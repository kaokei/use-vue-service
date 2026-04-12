<script setup lang="ts">
/**
 * 父组件 - 演示 FIND_CHILD_SERVICE 和 FIND_CHILDREN_SERVICES
 *
 * 核心功能：
 * 1. 使用 declareProviders 声明父组件自身的服务
 * 2. 使用 useService(FIND_CHILD_SERVICE) 获取 findChild 函数
 * 3. 使用 useService(FIND_CHILDREN_SERVICES) 获取 findChildren 函数
 * 4. 渲染多个 Child 子组件，每个子组件声明自己的 ChildService
 * 5. 通过按钮调用 findChild / findChildren 查找子组件服务
 */
import { ref } from 'vue';
import {
  declareProviders,
  useService,
  FIND_CHILD_SERVICE,
  FIND_CHILDREN_SERVICES,
} from '@kaokei/use-vue-service';
import { ChildService } from './ChildService';
import Child from './Child.vue';

// 父组件声明自己的服务提供者（建立容器层级关系）
declareProviders([]);

// 获取查找子组件服务的工具函数
// findChild：查找第一个匹配的子组件服务实例
const findChild = useService(FIND_CHILD_SERVICE);
// findChildren：查找所有匹配的子组件服务实例
const findChildren = useService(FIND_CHILDREN_SERVICES);

// 用于展示查找结果
const singleResult = ref('');
const allResults = ref<string[]>([]);

// 查找第一个子组件的 ChildService 实例
function handleFindChild() {
  const child = findChild(ChildService);
  if (child) {
    singleResult.value = child.greet();
  } else {
    singleResult.value = '未找到子组件服务';
  }
}

// 查找所有子组件的 ChildService 实例
function handleFindChildren() {
  const children = findChildren(ChildService);
  allResults.value = children.map((child) => child.greet());
}
</script>

<template>
  <div>
    <h1>07 - 父组件获取子组件服务</h1>
    <p>演示 FIND_CHILD_SERVICE 和 FIND_CHILDREN_SERVICES 的用法</p>

    <h2>子组件列表</h2>
    <Child name="小明" />
    <Child name="小红" />
    <Child name="小刚" />

    <h2>查找子组件服务</h2>

    <div style="margin: 12px 0;">
      <button @click="handleFindChild">
        查找第一个子组件服务（FIND_CHILD_SERVICE）
      </button>
      <p v-if="singleResult">结果：{{ singleResult }}</p>
    </div>

    <div style="margin: 12px 0;">
      <button @click="handleFindChildren">
        查找所有子组件服务（FIND_CHILDREN_SERVICES）
      </button>
      <ul v-if="allResults.length > 0">
        <li v-for="(result, index) in allResults" :key="index">
          {{ result }}
        </li>
      </ul>
    </div>
  </div>
</template>
