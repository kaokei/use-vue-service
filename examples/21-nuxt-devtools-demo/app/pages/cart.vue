<script setup lang="ts">
import { onMounted } from 'vue'
import { CartService } from '~/services/CartService'

// 声明购物车服务
declareProviders([CartService])

// 获取服务实例
const cart = useService(CartService)

// 组件挂载时从 localStorage 恢复数据
onMounted(() => {
  cart.load()
})

// 模拟商品数据（仅用于演示）
const demoProducts = [
  { id: '1', name: 'Vue 3 实战', price: 79 },
  { id: '2', name: 'TypeScript 手册', price: 59 },
  { id: '3', name: 'Nuxt 全栈开发', price: 89 },
]

function addToCart(product: { id: string; name: string; price: number }) {
  cart.addItem({ id: product.id, name: product.name, price: product.price })
}
</script>

<template>
  <div style="max-width: 640px;">
    <h1>🛒 购物车服务示例</h1>
    <p style="color: #666;">
      演示 CartService：响应式商品列表、@Computed 计算总价和数量、localStorage 持久化。
      刷新页面后购物车数据不会丢失。
    </p>

    <!-- 模拟商品列表 -->
    <section style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
      <h2>商品列表</h2>
      <div v-for="product in demoProducts" :key="product.id"
        style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
        <span>{{ product.name }} — ¥{{ product.price }}</span>
        <button @click="addToCart(product)">加入购物车</button>
      </div>
    </section>

    <!-- 购物车 -->
    <section style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
      <h2>购物车（{{ cart.totalCount }} 件商品）</h2>

      <!-- 空购物车 -->
      <p v-if="cart.items.length === 0" style="color: #999;">购物车是空的，请从上方商品列表中添加</p>

      <!-- 购物车列表 -->
      <div v-for="item in cart.items" :key="item.id"
        style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
        <span>{{ item.name }}</span>
        <span style="color: #999;">¥{{ item.price }}</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button @click="cart.updateQuantity(item.id, item.quantity - 1)" style="width: 28px;">-</button>
          <span>{{ item.quantity }}</span>
          <button @click="cart.updateQuantity(item.id, item.quantity + 1)" style="width: 28px;">+</button>
        </div>
        <button @click="cart.removeItem(item.id)" style="color: #e53e3e;">删除</button>
      </div>

      <!-- 总价和操作 -->
      <div v-if="cart.items.length > 0" style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #42b883;">
        <p style="font-size: 18px;">
          合计：<strong style="color: #e53e3e;">¥{{ cart.totalPrice.toFixed(2) }}</strong>
        </p>
        <button @click="cart.clear()" style="margin-top: 8px; color: #999;">清空购物车</button>
      </div>
    </section>

    <!-- 状态说明 -->
    <section style="margin-top: 24px; padding: 16px; background: #e8f5e9; border-radius: 6px; font-size: 14px; color: #555;">
      <strong>💡 实现要点：</strong>
      <ul style="margin: 8px 0 0; padding-left: 20px;">
        <li>服务实例被 reactive() 包裹，<code>items</code> 数组的 push/splice 自动触发模板更新</li>
        <li><code>@Computed()</code> 装饰器将 totalPrice 和 totalCount 转为响应式计算属性</li>
        <li>每次修改后调用 <code>save()</code> 写入 localStorage，刷新页面后 <code>load()</code> 恢复</li>
      </ul>
    </section>
  </div>
</template>
