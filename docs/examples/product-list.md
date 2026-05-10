# 商品列表服务 — 响应式数组的增删改查

## 场景描述

管理一个商品列表，支持添加、删除、修改和筛选操作。展示如何在服务中使用响应式数组。

## 服务定义

```ts
import { Injectable, Computed } from '@kaokei/use-vue-service';

/** 商品信息 */
interface Product {
  /** 商品 ID */
  id: string;
  /** 商品名称 */
  name: string;
  /** 分类 */
  category: string;
  /** 价格 */
  price: number;
  /** 库存 */
  stock: number;
}

/**
 * 商品列表服务。
 * 
 * 服务实例本身是 Vue reactive 对象，因此 products 数组的
 * 任何变动（push、splice、索引赋值、过滤等）都会自动触发模板更新。
 */
@Injectable()
export class ProductService {
  /** 商品列表（响应式数组） */
  products: Product[] = [];

  /** 当前筛选关键词 */
  filterKeyword = '';

  /** 当前筛选分类 */
  filterCategory = '';

  /**
   * 筛选后的商品列表（响应式派生状态）。
   * 依赖 products、filterKeyword、filterCategory，
   * 任一变化时自动重新计算。
   */
  @Computed()
  get filteredProducts(): Product[] {
    let result = this.products;

    if (this.filterKeyword) {
      const kw = this.filterKeyword.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(kw));
    }

    if (this.filterCategory) {
      result = result.filter(p => p.category === this.filterCategory);
    }

    return result;
  }

  /**
   * 计算商品总数（响应式派生状态）。
   */
  @Computed()
  get totalCount(): number {
    return this.products.length;
  }

  /**
   * 计算筛选后数量。
   */
  @Computed()
  get filteredCount(): number {
    return this.filteredProducts.length;
  }

  /**
   * 添加商品。
   */
  addProduct(product: Product): void {
    this.products.push({ ...product });
  }

  /**
   * 删除商品。
   */
  removeProduct(id: string): void {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
    }
  }

  /**
   * 更新商品信息。
   */
  updateProduct(id: string, updates: Partial<Product>): void {
    const product = this.products.find(p => p.id === id);
    if (product) {
      Object.assign(product, updates);
    }
  }

  /**
   * 根据 ID 查找商品。
   */
  findById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  /**
   * 批量设置商品列表（如从 API 获取数据后整体替换）。
   */
  setProducts(products: Product[]): void {
    this.products = products;
  }

  /**
   * 设置筛选分类。
   */
  setCategory(category: string): void {
    this.filterCategory = category;
  }

  /**
   * 清空筛选条件。
   */
  resetFilters(): void {
    this.filterKeyword = '';
    this.filterCategory = '';
  }
}
```

## 组件使用

```vue
<script lang="ts" setup>
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { ProductService } from './product.service';

// 声明服务，与当前组件绑定
declareProviders([ProductService]);

// 获取服务实例
const productService = useService(ProductService);

// 添加示例商品
function addDemoProduct() {
  productService.addProduct({
    id: crypto.randomUUID(),
    name: '示例商品',
    category: '电子产品',
    price: 99,
    stock: 10,
  });
}
</script>

<template>
  <div>
    <!-- 筛选工具栏 -->
    <div>
      <input
        v-model="productService.filterKeyword"
        placeholder="搜索商品名称"
      />
      <select v-model="productService.filterCategory">
        <option value="">全部分类</option>
        <option value="电子产品">电子产品</option>
        <option value="食品">食品</option>
      </select>
      <button @click="productService.resetFilters()">重置</button>
    </div>

    <!-- 统计信息 -->
    <p>共 {{ productService.filteredCount }} / {{ productService.totalCount }} 件商品</p>

    <!-- 添加按钮 -->
    <button @click="addDemoProduct()">添加商品</button>

    <!-- 商品列表 -->
    <ul>
      <li v-for="product in productService.filteredProducts" :key="product.id">
        <strong>{{ product.name }}</strong>
        <span>{{ product.category }}</span>
        <span>¥{{ product.price }}</span>
        <span>库存: {{ product.stock }}</span>
        <button @click="productService.removeProduct(product.id)">删除</button>
      </li>
    </ul>

    <!-- 空状态 -->
    <p v-if="productService.filteredProducts.length === 0">
      暂无商品
    </p>
  </div>
</template>
```

## 关键要点

1. **数组天然响应式** — `this.products.push()`、`this.products.splice()`、`this.products = newArray` 都在 Vue reactive 追踪范围内，模板自动更新。
2. **@Computed() 实现筛选** — `filteredProducts` 依赖 `products`、`filterKeyword`、`filterCategory`，任一变化时自动重新计算，且结果被缓存。
3. **数组方法均可用** — `find`、`filter`、`findIndex` 等原生数组方法在服务内正常使用，不需要特殊处理。
4. **对象属性修改也是响应式的** — `Object.assign(product, updates)` 直接修改数组元素的属性，自动触发响应式更新。
