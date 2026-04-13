# 07 - 父组件获取子组件服务

演示父组件如何通过 `FIND_CHILD_SERVICE` 和 `FIND_CHILDREN_SERVICES` 查找子组件的服务实例。

## 演示内容

- `FIND_CHILD_SERVICE` — 查找第一个匹配的子组件服务实例
- `FIND_CHILDREN_SERVICES` — 查找所有匹配的子组件服务实例

## 关键代码

```ts
// 父组件
const findChild = useService(FIND_CHILD_SERVICE);
const findChildren = useService(FIND_CHILDREN_SERVICES);

const child = findChild(ChildService);       // 第一个
const children = findChildren(ChildService); // 全部
```

```vue
<!-- 子组件 -->
<script setup lang="ts">
declareProviders([ChildService]);
const childService = useService(ChildService);
childService.name = props.name;
</script>
```

## 要点

- 这是一种反向查找机制——通常是子组件获取父组件的服务，这里是父组件主动查找子组件的服务
- 父组件必须先调用 `declareProviders([])` 建立容器层级关系
- 每个子组件声明自己的 `ChildService` 实例，父组件可以查找到所有子组件的实例

## 文件结构

- `App.vue` — 父组件，使用 `findChild` / `findChildren` 查找子组件服务
- `Child.vue` — 子组件，声明自己的 `ChildService` 并设置唯一名称
- `ChildService.ts` — 子组件服务类

## 运行

```bash
pnpm install
pnpm start
```
