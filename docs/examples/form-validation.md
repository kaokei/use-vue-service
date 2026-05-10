# 表单验证服务 — 多表单状态管理与验证规则

## 场景描述

一个页面可能有多个表单，每个表单有自己的字段和验证规则。表单验证服务统一管理这些状态。

## 服务定义

```ts
import { Injectable, Computed } from '@kaokei/use-vue-service';

/** 验证规则 */
interface ValidationRule {
  /** 验证函数，返回 true 表示通过 */
  validator: (value: any, allFields: Record<string, any>) => boolean;
  /** 错误提示信息 */
  message: string;
}

/** 表单字段配置 */
interface FieldConfig {
  /** 字段初始值 */
  value: any;
  /** 验证规则列表 */
  rules?: ValidationRule[];
  /** 字段标签（用于错误提示） */
  label?: string;
}

/** 单个字段的运行时状态 */
interface FieldState {
  value: any;
  error: string;
  touched: boolean;
}

/**
 * 表单验证服务。
 * 
 * 管理单个表单的字段状态和验证逻辑。
 * 服务实例本身是 Vue reactive 对象，所有字段状态都是响应式的。
 */
@Injectable()
export class FormService {
  /** 表单字段状态（响应式对象） */
  fields: Record<string, FieldState> = {};

  /** 字段配置（仅内部使用） */
  private fieldConfigs: Record<string, FieldConfig> = {};

  /**
   * 注册表单字段。
   */
  registerField(name: string, config: FieldConfig): void {
    this.fieldConfigs[name] = config;
    this.fields[name] = {
      value: config.value,
      error: '',
      touched: false,
    };
  }

  /**
   * 获取字段的当前值。
   */
  getFieldValue(name: string): any {
    return this.fields[name]?.value;
  }

  /**
   * 设置字段值并触发验证。
   */
  setFieldValue(name: string, value: any): void {
    if (!this.fields[name]) return;
    this.fields[name].value = value;
    this.fields[name].touched = true;
    this.validateField(name);
  }

  /**
   * 标记字段为已触摸（用于失焦时触发验证）。
   */
  touchField(name: string): void {
    if (!this.fields[name]) return;
    this.fields[name].touched = true;
    this.validateField(name);
  }

  /**
   * 验证单个字段。
   */
  validateField(name: string): boolean {
    const field = this.fields[name];
    const config = this.fieldConfigs[name];
    if (!field || !config?.rules) {
      field && (field.error = '');
      return true;
    }

    const allValues = this.getAllValues();

    for (const rule of config.rules) {
      if (!rule.validator(field.value, allValues)) {
        field.error = rule.message;
        return false;
      }
    }

    field.error = '';
    return true;
  }

  /**
   * 验证所有字段。
   * 返回 true 表示全部通过。
   */
  validateAll(): boolean {
    let allValid = true;
    for (const name of Object.keys(this.fields)) {
      this.fields[name].touched = true;
      if (!this.validateField(name)) {
        allValid = false;
      }
    }
    return allValid;
  }

  /**
   * 获取所有字段的值。
   */
  getAllValues(): Record<string, any> {
    const values: Record<string, any> = {};
    for (const name of Object.keys(this.fields)) {
      values[name] = this.fields[name].value;
    }
    return values;
  }

  /**
   * 表单是否有效（响应式派生状态）。
   */
  @Computed
  get isValid(): boolean {
    return Object.values(this.fields).every(f => !f.error);
  }

  /**
   * 表单是否已被修改（响应式派生状态）。
   */
  @Computed
  get isDirty(): boolean {
    return Object.values(this.fields).some(f => f.touched);
  }

  /**
   * 重置表单到初始值。
   */
  reset(): void {
    for (const name of Object.keys(this.fieldConfigs)) {
      const config = this.fieldConfigs[name];
      this.fields[name] = {
        value: config.value,
        error: '',
        touched: false,
      };
    }
  }

  /**
   * 提交表单。
   * 自动验证，通过后执行回调。
   */
  async submit(onSubmit: (values: Record<string, any>) => Promise<void>): Promise<void> {
    if (!this.validateAll()) return;
    await onSubmit(this.getAllValues());
  }
}

// ===== 常用的验证规则工厂 =====

/** 必填验证 */
export function required(message = '此项为必填'): ValidationRule {
  return {
    validator: (value: any) => {
      if (typeof value === 'string') return value.trim().length > 0;
      return value !== null && value !== undefined;
    },
    message,
  };
}

/** 最小长度验证 */
export function minLength(min: number, message?: string): ValidationRule {
  return {
    validator: (value: string) => value.length >= min,
    message: message || `最少 ${min} 个字符`,
  };
}

/** 最大长度验证 */
export function maxLength(max: number, message?: string): ValidationRule {
  return {
    validator: (value: string) => value.length <= max,
    message: message || `最多 ${max} 个字符`,
  };
}

/** 邮箱格式验证 */
export function isEmail(message = '请输入有效的邮箱地址'): ValidationRule {
  return {
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  };
}
```

## 组件使用

```vue
<script lang="ts" setup>
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { FormService, required, minLength, isEmail } from './form.service';

// 声明服务
declareProviders(FormService);

const form = useService(FormService);

// 注册表单字段
form.registerField('username', {
  value: '',
  label: '用户名',
  rules: [required('请输入用户名'), minLength(3, '用户名至少 3 个字符')],
});

form.registerField('email', {
  value: '',
  label: '邮箱',
  rules: [required('请输入邮箱'), isEmail()],
});

// 提交
async function handleSubmit() {
  await form.submit(async (values) => {
    console.log('提交数据:', values);
    // 调用 API 提交
  });
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <!-- 用户名字段 -->
    <div>
      <label>用户名</label>
      <input
        :value="form.getFieldValue('username')"
        @input="form.setFieldValue('username', ($event.target as HTMLInputElement).value)"
        @blur="form.touchField('username')"
      />
      <span v-if="form.fields.username.error" style="color: red">
        {{ form.fields.username.error }}
      </span>
    </div>

    <!-- 邮箱字段 -->
    <div>
      <label>邮箱</label>
      <input
        :value="form.getFieldValue('email')"
        @input="form.setFieldValue('email', ($event.target as HTMLInputElement).value)"
        @blur="form.touchField('email')"
      />
      <span v-if="form.fields.email.error" style="color: red">
        {{ form.fields.email.error }}
      </span>
    </div>

    <!-- 操作按钮 -->
    <button type="submit" :disabled="!form.isValid">提交</button>
    <button type="button" @click="form.reset()">重置</button>

    <!-- 验证状态 -->
    <p>表单状态: {{ form.isValid ? '✅ 有效' : '❌ 有错误' }}</p>
  </form>
</template>
```

## 关键要点

1. **服务实例是 reactive 对象** — `fields` 对象及其嵌套属性（`value`、`error`、`touched`）都是响应式的，直接赋值即触发模板更新。
2. **@Computed 派生验证状态** — `isValid` 和 `isDirty` 是 getter，依赖 `fields` 中的属性，实时自动更新。
3. **验证规则是纯函数** — 不依赖框架，可独立测试，易于扩展。
4. **每个 FormService 实例管理一个表单** — 多个表单时声明多个 FormService 实例。
