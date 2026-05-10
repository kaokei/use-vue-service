<script setup lang="ts">
import { Injectable } from '@kaokei/use-vue-service'
import { FormService, required, minLength, isEmail } from '~/services/FormService'

// 登录表单：继承 FormService，声明 model 和 rules
interface LoginModel {
  username: string
  password: string
  email: string
}

@Injectable()
class LoginForm extends FormService<LoginModel> {
  override model: LoginModel = {
    username: '',
    password: '',
    email: '',
  }

  override rules = {
    username: [required('请输入用户名'), minLength(3, '用户名至少 3 个字符')],
    password: [required('请输入密码'), minLength(6, '密码至少 6 个字符')],
    email: [required('请输入邮箱'), isEmail('请输入有效的邮箱地址')],
  }
}

declareProviders([LoginForm])
const form = useService(LoginForm)

const submitted = ref(false)

async function handleSubmit() {
  submitted.value = true
  await form.submit(async (model) => {
    // 模拟登录
    await new Promise(r => setTimeout(r, 500))
    alert(`登录成功！\n用户名: ${model.username}\n邮箱: ${model.email}`)
  })
}
</script>

<template>
  <div style="max-width: 480px;">
    <h1>📝 表单验证服务示例</h1>
    <p style="color: #666;">
      演示 FormService 基类继承模式：声明 <code>model</code> 即可 v-model 绑定，<code>@Computed errors</code> 自动验证。
    </p>

    <form @submit.prevent="handleSubmit" style="margin-top: 24px;">
      <!-- 用户名 -->
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 4px; font-weight: 600;">用户名</label>
        <input
          v-model="form.model.username"
          placeholder="请输入用户名"
          @blur="form.touch('username')"
          style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;"
        />
        <span v-if="form.errors.username" style="color: #ef4444; font-size: 13px;">
          {{ form.errors.username }}
        </span>
      </div>

      <!-- 密码 -->
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 4px; font-weight: 600;">密码</label>
        <input
          v-model="form.model.password"
          type="password"
          placeholder="请输入密码"
          @blur="form.touch('password')"
          style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;"
        />
        <span v-if="form.errors.password" style="color: #ef4444; font-size: 13px;">
          {{ form.errors.password }}
        </span>
      </div>

      <!-- 邮箱 -->
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 4px; font-weight: 600;">邮箱</label>
        <input
          v-model="form.model.email"
          placeholder="请输入邮箱"
          @blur="form.touch('email')"
          style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;"
        />
        <span v-if="form.errors.email" style="color: #ef4444; font-size: 13px;">
          {{ form.errors.email }}
        </span>
      </div>

      <!-- 操作按钮 -->
      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <button type="submit" :disabled="!form.isValid"
          style="padding: 8px 24px; background: #42b883; color: #fff; border: none; border-radius: 4px; cursor: pointer;"
          :style="{ opacity: form.isValid ? 1 : 0.5 }">
          登录
        </button>
        <button type="button"
          @click="form.reset({ username: '', password: '', email: '' })"
          style="padding: 8px 24px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background: #fff;">
          重置
        </button>
      </div>

      <!-- 实时状态 -->
      <div style="margin-top: 12px; font-size: 13px; color: #999;">
        表单状态：{{ form.isValid ? '✅ 有效' : '❌ 有 ' + Object.keys(form.errors).length + ' 个错误' }}
      </div>
    </form>

    <!-- 实现要点 -->
    <section style="margin-top: 32px; padding: 16px; background: #e8f5e9; border-radius: 6px; font-size: 14px; color: #555;">
      <strong>💡 实现要点：</strong>
      <ul style="margin: 8px 0 0; padding-left: 20px;">
        <li><strong>继承基类</strong> — 业务表单类继承 <code>FormService&lt;T&gt;</code>，只声明 <code>model</code> 和 <code>rules</code></li>
        <li><strong>v-model 直接绑定</strong> — <code>v-model="form.model.username"</code>，无需 <code>setFieldValue</code></li>
        <li><strong>@Computed errors</strong> — 输入时自动实时验证，错误信息即时显示</li>
        <li><strong>规则与数据分离</strong> — model 是纯数据，rules 是纯配置，职责清晰，易于配合 ant-design 等 UI 库</li>
      </ul>
    </section>
  </div>
</template>
