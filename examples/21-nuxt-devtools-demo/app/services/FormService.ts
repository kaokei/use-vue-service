import { Injectable, Computed } from '@kaokei/use-vue-service'

interface ValidationRule {
  validator: (value: any, model: any) => boolean
  message: string
}

@Injectable()
export class FormService<T extends Record<string, any>> {
  // 子类直接声明 model，即可 v-model 绑定
  model!: T

  // 子类声明验证规则
  rules: Record<string, ValidationRule[]> = {}

  // 已触摸的字段（用户编辑或失焦过的字段才展示错误）
  touched: Record<string, boolean> = {}

  // 只展示已触摸字段的错误信息
  @Computed()
  get errors(): Record<string, string> {
    const result: Record<string, string> = {}
    if (!this.model) return result
    for (const field of Object.keys(this.rules)) {
      if (!this.touched[field]) continue
      const value = this.model[field]
      const fieldRules = this.rules[field]
      if (!fieldRules) continue
      for (const rule of fieldRules) {
        if (!rule.validator(value, this.model)) {
          result[field] = rule.message
          break
        }
      }
    }
    return result
  }

  // 校验全部字段（不受 touched 限制），用于控制提交按钮状态
  @Computed()
  get isValid(): boolean {
    if (!this.model) return false
    for (const field of Object.keys(this.rules)) {
      const value = this.model[field]
      const fieldRules = this.rules[field]
      if (!fieldRules) continue
      for (const rule of fieldRules) {
        if (!rule.validator(value, this.model)) {
          return false
        }
      }
    }
    return true
  }

  // 标记字段为已触摸（配合 @blur 使用）
  touch(field: string): void {
    this.touched[field] = true
  }

  // 标记所有字段为已触摸并校验（提交时调用）
  validateAll(): boolean {
    for (const field of Object.keys(this.rules)) {
      this.touched[field] = true
    }
    return this.isValid
  }

  async submit(onSubmit: (model: T) => Promise<void>): Promise<void> {
    if (!this.validateAll()) return
    await onSubmit(this.model)
  }

  reset(initial: T): void {
    Object.assign(this.model, initial)
    this.touched = {}
  }
}

// ===== 常用验证规则 =====

export function required(message = '此项为必填'): ValidationRule {
  return {
    validator: (value: any) => {
      if (typeof value === 'string') return value.trim().length > 0
      return value !== null && value !== undefined
    },
    message,
  }
}

export function minLength(min: number, message?: string): ValidationRule {
  return {
    validator: (value: string) => value.length >= min,
    message: message || `最少 ${min} 个字符`,
  }
}

export function maxLength(max: number, message?: string): ValidationRule {
  return {
    validator: (value: string) => value.length <= max,
    message: message || `最多 ${max} 个字符`,
  }
}

export function pattern(regex: RegExp, message: string): ValidationRule {
  return {
    validator: (value: string) => regex.test(value),
    message,
  }
}

export function isEmail(message = '请输入有效的邮箱地址'): ValidationRule {
  return pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message)
}
