import { Injectable, Computed } from '@kaokei/use-vue-service'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

@Injectable()
export class CartService {
  // 实例被 reactive() 包裹，普通属性即为响应式，无需 ref()
  items: CartItem[] = []

  private readonly STORAGE_KEY = 'nuxt_demo_cart'

  @Computed()
  get totalPrice(): number {
    return this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
  }

  @Computed()
  get totalCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  addItem(item: Omit<CartItem, 'quantity'> & { quantity?: number }): void {
    const existing = this.items.find(i => i.id === item.id)
    if (existing) {
      existing.quantity += item.quantity ?? 1
    } else {
      this.items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity ?? 1,
      })
    }
    this.save()
  }

  removeItem(id: string): void {
    const index = this.items.findIndex(i => i.id === id)
    if (index !== -1) {
      this.items.splice(index, 1)
      this.save()
    }
  }

  updateQuantity(id: string, quantity: number): void {
    const item = this.items.find(i => i.id === id)
    if (item) {
      item.quantity = Math.max(0, quantity)
      if (item.quantity === 0) {
        this.removeItem(id)
        return
      }
      this.save()
    }
  }

  clear(): void {
    this.items.splice(0, this.items.length)
    this.save()
  }

  load(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw) as CartItem[]
        if (Array.isArray(data)) {
          this.items = data
        }
      }
    } catch {
      // 忽略解析失败
    }
  }

  private save(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items))
    } catch {
      // 忽略写入失败
    }
  }
}
