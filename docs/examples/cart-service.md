# 购物车服务 — localStorage 持久化与计算属性

## 场景描述

电商购物车需要管理商品列表、计算总价和总数，并在页面刷新后从 localStorage 恢复数据，保持响应式更新。

## 服务定义

```ts
import { Injectable, Computed } from '@kaokei/use-vue-service';

/** 购物车中的商品项 */
interface CartItem {
  /** 商品 ID */
  id: string;
  /** 商品名称 */
  name: string;
  /** 单价 */
  price: number;
  /** 数量 */
  quantity: number;
}

/**
 * 购物车服务。
 * 
 * 服务实例本身是 Vue reactive 对象，因此 items 数组的增删改
 * 会自动触发模板更新，无需手动 ref()/reactive()。
 */
@Injectable()
export class CartService {
  /** 商品列表（响应式数组） */
  items: CartItem[] = [];

  /** localStorage 存储键名 */
  private readonly STORAGE_KEY = 'nuxt_demo_cart';

  /**
   * 计算总价（响应式派生状态）。
   * 当 items 数组变化时自动重新计算。
   */
  @Computed()
  get totalPrice(): number {
    return this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  /**
   * 计算商品总数量（响应式派生状态）。
   */
  @Computed()
  get totalCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * 添加商品到购物车。
   * 如果商品已存在则增加数量，否则新增一条记录。
   */
  addItem(item: Omit<CartItem, 'quantity'> & { quantity?: number }): void {
    const existing = this.items.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity ?? 1;
    } else {
      this.items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity ?? 1,
      });
    }
    this.save();
  }

  /**
   * 移除指定商品。
   */
  removeItem(id: string): void {
    const index = this.items.findIndex(i => i.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
      this.save();
    }
  }

  /**
   * 更新商品数量。
   */
  updateQuantity(id: string, quantity: number): void {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        this.removeItem(id);
        return;
      }
      this.save();
    }
  }

  /**
   * 清空购物车。
   */
  clear(): void {
    this.items.splice(0, this.items.length);
    this.save();
  }

  /**
   * 从 localStorage 加载购物车数据。
   * 通常在应用初始化时调用。
   */
  load(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as CartItem[];
        if (Array.isArray(data)) {
          this.items = data;
        }
      }
    } catch {
      // 数据解析失败，忽略
    }
  }

  /**
   * 保存购物车数据到 localStorage。
   */
  private save(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
    } catch {
      // localStorage 写入失败（如配额已满），忽略
    }
  }
}
```

## 组件使用

```vue
<script lang="ts" setup>
import { onMounted } from 'vue';
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CartService } from './cart.service';

// 声明服务，与当前组件绑定
declareProviders([CartService]);

// 获取服务实例
const cart = useService(CartService);

// 组件挂载时从 localStorage 恢复数据
onMounted(() => {
  cart.load();
});
</script>

<template>
  <div>
    <h2>购物车（{{ cart.totalCount }} 件商品）</h2>

    <!-- 空购物车 -->
    <p v-if="cart.items.length === 0">购物车是空的</p>

    <!-- 商品列表 -->
    <ul>
      <li v-for="item in cart.items" :key="item.id">
        <span>{{ item.name }}</span>
        <span>¥{{ item.price }}</span>
        <button @click="cart.updateQuantity(item.id, item.quantity - 1)">-</button>
        <span>{{ item.quantity }}</span>
        <button @click="cart.updateQuantity(item.id, item.quantity + 1)">+</button>
        <button @click="cart.removeItem(item.id)">删除</button>
      </li>
    </ul>

    <!-- 总价 -->
    <p v-if="cart.items.length > 0">
      合计：<strong>¥{{ cart.totalPrice.toFixed(2) }}</strong>
    </p>

    <!-- 清空 -->
    <button v-if="cart.items.length > 0" @click="cart.clear()">
      清空购物车
    </button>
  </div>
</template>
```

## 关键要点

1. **服务实例是 reactive 对象** — `items` 数组的 `push`、`splice`、直接索引赋值都在 Vue 响应式追踪范围内，模板自动更新。
2. **@Computed() 计算派生状态** — `totalPrice` 和 `totalCount` 是 getter，依赖 `items` 数组，当数组变化时自动重新计算并缓存。
3. **localStorage 持久化** — `load()` 在组件 `onMounted` 时调用恢复数据；每次修改后调用 `save()` 写入。注意捕获 JSON 解析和写入异常。
4. **数组替换保持响应式** — `this.items = data` 整体替换数组时，Vue reactive 会自动追踪新数组。
