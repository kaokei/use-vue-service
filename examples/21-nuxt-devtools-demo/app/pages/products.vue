<script setup lang="ts">
import { ProductService } from '~/services/ProductService'

declareProviders([ProductService])

const productService = useService(ProductService)

const newProduct = reactive({
  name: '',
  category: '电子产品',
  price: 0,
  stock: 0,
})

function addProduct() {
  if (!newProduct.name) return
  productService.addProduct({
    id: crypto.randomUUID(),
    name: newProduct.name,
    category: newProduct.category,
    price: newProduct.price,
    stock: newProduct.stock,
  })
  // 重置表单
  newProduct.name = ''
  newProduct.price = 0
  newProduct.stock = 0
}

function addDemoData() {
  productService.setProducts([
    { id: '1', name: 'Vue 3 实战', category: '电子产品', price: 79, stock: 10 },
    { id: '2', name: 'TypeScript 手册', category: '电子产品', price: 59, stock: 25 },
    { id: '3', name: '有机苹果', category: '食品', price: 29, stock: 100 },
    { id: '4', name: 'Nuxt 全栈开发', category: '电子产品', price: 89, stock: 15 },
    { id: '5', name: '进口牛奶', category: '食品', price: 49, stock: 50 },
  ])
}
</script>

<template>
  <div style="max-width: 640px;">
    <h1>📦 商品列表服务示例</h1>
    <p style="color: #666;">
      演示 ProductService：响应式数组的增删改查、@Computed 筛选和统计。
    </p>

    <!-- 添加商品表单 -->
    <section style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
      <h2>添加商品</h2>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <input v-model="newProduct.name" placeholder="商品名称" style="flex: 1; min-width: 120px;" />
        <select v-model="newProduct.category">
          <option value="电子产品">电子产品</option>
          <option value="食品">食品</option>
        </select>
        <input v-model.number="newProduct.price" type="number" placeholder="价格" style="width: 80px;" />
        <input v-model.number="newProduct.stock" type="number" placeholder="库存" style="width: 80px;" />
        <button @click="addProduct">添加</button>
      </div>
    </section>

    <!-- 操作按钮 -->
    <div style="margin-top: 16px; display: flex; gap: 8px;">
      <button @click="addDemoData">加载演示数据</button>
      <button @click="productService.products.splice(0, productService.products.length)">清空所有</button>
    </div>

    <!-- 筛选工具栏 -->
    <section style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
      <div style="display: flex; gap: 8px; align-items: center;">
        <span>筛选：</span>
        <input
          v-model="productService.filterKeyword"
          placeholder="搜索商品名称"
          style="flex: 1;"
        />
        <select v-model="productService.filterCategory">
          <option value="">全部分类</option>
          <option value="电子产品">电子产品</option>
          <option value="食品">食品</option>
        </select>
        <button @click="productService.resetFilters()">重置</button>
      </div>
      <p style="margin-top: 8px; color: #666;">
        共 {{ productService.filteredCount }} / {{ productService.totalCount }} 件商品
      </p>
    </section>

    <!-- 商品列表 -->
    <section style="margin-top: 16px;">
      <div v-if="productService.filteredProducts.length === 0" style="padding: 24px; text-align: center; color: #999;">
        暂无商品，请添加或加载演示数据
      </div>
      <div v-for="product in productService.filteredProducts" :key="product.id"
        style="display: flex; align-items: center; justify-content: space-between; padding: 12px; margin-bottom: 8px; background: #f9f9f9; border-radius: 6px; border: 1px solid #e8e8e8;">
        <div>
          <strong>{{ product.name }}</strong>
          <span style="margin-left: 8px; color: #999; font-size: 13px;">{{ product.category }}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span>¥{{ product.price }}</span>
          <span style="color: #999;">库存: {{ product.stock }}</span>
          <button @click="productService.updateProduct(product.id, { price: product.price + 10 })" title="涨价 10 元">+10</button>
          <button @click="productService.removeProduct(product.id)" style="color: #e53e3e;">删除</button>
        </div>
      </div>
    </section>

    <!-- 实现要点 -->
    <section style="margin-top: 24px; padding: 16px; background: #e8f5e9; border-radius: 6px; font-size: 14px; color: #555;">
      <strong>💡 实现要点：</strong>
      <ul style="margin: 8px 0 0; padding-left: 20px;">
        <li>数组天然响应式 — <code>push</code>、<code>splice</code>、<code>this.products = newArray</code> 均自动触发模板更新</li>
        <li><code>@Computed()</code> 筛选 — <code>filteredProducts</code> 依赖 products、filterKeyword、filterCategory，任一变化自动重算</li>
        <li><code>Object.assign(product, updates)</code> 直接修改元素属性，响应式自动生效</li>
      </ul>
    </section>
  </div>
</template>
