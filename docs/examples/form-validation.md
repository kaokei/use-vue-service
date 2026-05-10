# 表单验证服务 — 基类继承 + v-model 绑定

## 场景描述

通过继承 `FormService` 基类创建业务表单，直接声明 `model` 对象即可使用 `v-model="form.model.fieldName"` 双向绑定。`errors` 和 `isValid` 通过 `@Computed()` 自动响应式更新。

## 设计原则

- **model 和 rules 分离** — model 是纯数据，rules 是验证规则，职责清晰
- **FormService 是基类** — 业务表单继承后只需声明 `model` 和 `rules`
- **v-model 直接绑定** — `form.model.fieldName` 直接是响应式属性
- **@Computed() errors** — model 变化时自动重新验证，无需手动调用 `validate()`

## 服务定义

```ts
// form.service.ts
import { Injectable, Computed } from '@kaokei/use-vue-service';

interface ValidationRule {
  validator: (value: any, model: any) => boolean;
  message: string;
}

@Injectable()
export class FormService<T extends Record<string, any>> {
  // 子类声明 model，即可 v-model 绑定
  model!: T;

  // 子类声明验证规则
  rules: Record<string, ValidationRule[]> = {};

  // 已触摸的字段（用户失焦过的字段才展示错误）
  touched: Record<string, boolean> = {};

  // 只展示已触摸字段的错误信息
  @Computed()()
  get errors(): Record<string, string> {
    const result: Record<string, string> = {};
    if (!this.model) return result;
    for (const field of Object.keys(this.rules)) {
      if (!this.touched[field]) continue;
      const value = this.model[field];
      const fieldRules = this.rules[field];
      if (!fieldRules) continue;
      for (const rule of fieldRules) {
        if (!rule.validator(value, this.model)) {
          result[field] = rule.message;
          break;
        }
      }
    }
    return result;
  }

  // 校验全部字段（不受 touched 限制），用于控制提交按钮状态
  @Computed()()
  get isValid(): boolean {
    if (!this.model) return false;
    for (const field of Object.keys(this.rules)) {
      const value = this.model[field];
      const fieldRules = this.rules[field];
      if (!fieldRules) continue;
      for (const rule of fieldRules) {
        if (!rule.validator(value, this.model)) {
          return false;
        }
      }
    }
    return true;
  }

  // 标记字段为已触摸（配合 @blur 使用）
  touch(field: string): void {
    this.touched[field] = true;
  }

  // 标记所有字段为已触摸并校验（提交时调用）
  validateAll(): boolean {
    for (const field of Object.keys(this.rules)) {
      this.touched[field] = true;
    }
    return this.isValid;
  }

  async submit(onSubmit: (model: T) => Promise<void>): Promise<void> {
    if (!this.validateAll()) return;
    await onSubmit(this.model);
  }

  reset(initial: T): void {
    Object.assign(this.model, initial);
    this.touched = {};
  }
}

// ===== 常用验证规则工厂 =====

export function required(message = '此项为必填'): ValidationRule {
  return {
    validator: (value: any) => {
      if (typeof value === 'string') return value.trim().length > 0;
      return value !== null && value !== undefined;
    },
    message,
  };
}

export function minLength(min: number, message?: string): ValidationRule {
  return {
    validator: (value: string) => value.length >= min,
    message: message || `最少 ${min} 个字符`,
  };
}

export function isEmail(message = '请输入有效的邮箱地址'): ValidationRule {
  return {
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  };
}
```

## 组件使用 — 登录表单

```vue
<script lang="ts" setup>
import { Injectable } from '@kaokei/use-vue-service';
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { FormService, required, minLength } from './form.service';

// 1. 定义数据模型
interface LoginModel {
  username: string;
  password: string;
}

// 2. 继承 FormService，声明 model 和 rules
@Injectable()
class LoginForm extends FormService<LoginModel> {
  override model: LoginModel = {
    username: '',
    password: '',
  };

  override rules = {
    username: [required('请输入用户名'), minLength(3, '用户名至少 3 个字符')],
    password: [required('请输入密码'), minLength(6, '密码至少 6 个字符')],
  };
}

// 3. 使用
declareProviders([LoginForm]);
const form = useService(LoginForm);

async function handleLogin() {
  await form.submit(async (model) => {
    console.log('提交数据:', model);
    // 调用登录 API
  });
}
</script>

<template>
  <form @submit.prevent="handleLogin">
    <!-- 用户名 -->
    <div>
      <label>用户名</label>
      <input v-model="form.model.username" @blur="form.touch('username')" />
      <span v-if="form.errors.username" style="color: red">
        {{ form.errors.username }}
      </span>
    </div>

    <!-- 密码 -->
    <div>
      <label>密码</label>
      <input v-model="form.model.password" type="password" @blur="form.touch('password')" />
      <span v-if="form.errors.password" style="color: red">
        {{ form.errors.password }}
      </span>
    </div>

    <!-- 操作 -->
    <button type="submit" :disabled="!form.isValid">登录</button>
    <button
      type="button"
      @click="form.reset({ username: '', password: '' })"
    >
      重置
    </button>
  </form>
</template>
```

## 关键要点

1. **继承基类，只声明 model 和 rules** — 业务表单类只需几行代码即可获得完整的验证能力。
2. **v-model 直接绑定** — `v-model="form.model.username"` 自动双向绑定，配合 `@blur="form.touch('username')"` 控制错误展示时机。
3. **errors 只在触摸后展示** — 页面加载时字段为空也不显示错误，用户 `@blur` 失焦后才触发该字段的错误展示。
4. **isValid 始终全面校验** — 提交按钮初始 disabled，所有字段通过后才启用，保证用户不会提交无效数据。
5. **规则与数据分离** — model 是纯数据，rules 是纯配置，职责清晰，易于配合 ant-design 等 UI 库。
