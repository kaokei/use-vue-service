import { Injectable, Computed } from '@kaokei/use-vue-service'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
}

@Injectable()
export class ProductService {
  // 实例被 reactive() 包裹，普通属性即为响应式，无需 ref()
  products: Product[] = []

  filterKeyword = ''
  filterCategory = ''

  @Computed()
  get filteredProducts(): Product[] {
    let result = this.products

    if (this.filterKeyword) {
      const kw = this.filterKeyword.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(kw))
    }

    if (this.filterCategory) {
      result = result.filter(p => p.category === this.filterCategory)
    }

    return result
  }

  @Computed()
  get totalCount(): number {
    return this.products.length
  }

  @Computed()
  get filteredCount(): number {
    return this.filteredProducts.length
  }

  addProduct(product: Product): void {
    this.products.push({ ...product })
  }

  removeProduct(id: string): void {
    const index = this.products.findIndex(p => p.id === id)
    if (index !== -1) {
      this.products.splice(index, 1)
    }
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    const product = this.products.find(p => p.id === id)
    if (product) {
      Object.assign(product, updates)
    }
  }

  findById(id: string): Product | undefined {
    return this.products.find(p => p.id === id)
  }

  setProducts(products: Product[]): void {
    this.products = products
  }

  setCategory(category: string): void {
    this.filterCategory = category
  }

  resetFilters(): void {
    this.filterKeyword = ''
    this.filterCategory = ''
  }
}
