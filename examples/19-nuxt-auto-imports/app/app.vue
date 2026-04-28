<script setup lang="ts">
import { CountService } from '~/services/CountService'
import { LoggerService } from '~/services/LoggerService'
import { ThemeService } from '~/services/ThemeService'

/**
 * 19 - Nuxt 自动导入示例
 *
 * 演示通过 @kaokei/nuxt-use-vue-service 插件实现 API 零 import 自动导入。
 * 本文件中所有来自 @kaokei/use-vue-service 和 @kaokei/di 的 API
 * 均无需手动 import，由 Nuxt 模块自动注入。
 *
 * 覆盖的自动导入 API：
 * - declareProviders / useService（核心 DI）
 * - useAppService / declareAppProviders（App 级服务）
 * - FIND_CHILD_SERVICE / FIND_CHILDREN_SERVICES（查找子服务）
 * - Token（自定义 Token）
 * - Injectable / Inject / Computed / Raw（装饰器，在 Service 文件中使用）
 */

// Token — 无需 import，由插件自动导入
const APP_TITLE_TOKEN = new Token<string>('APP_TITLE')

// declareAppProviders — 注册 App 级别服务（全局单例）
declareAppProviders([
  { provide: APP_TITLE_TOKEN, useValue: 'Nuxt Auto Imports Demo' },
  ThemeService,
])

// useAppService — 获取 App 级别服务
const appTitle = useAppService(APP_TITLE_TOKEN)
const themeService = useAppService(ThemeService)

// declareProviders — 在当前组件注册服务容器
declareProviders([CountService, LoggerService])

// useService — 获取当前容器中的服务实例
const countService = useService(CountService)

// FIND_CHILD_SERVICE / FIND_CHILDREN_SERVICES — 演示 Token 常量自动导入
const findChildToken = FIND_CHILD_SERVICE
const findChildrenToken = FIND_CHILDREN_SERVICES
</script>

<template>
  <div style="max-width: 680px; margin: 40px auto; font-family: sans-serif">
    <h1>19 - Nuxt 自动导入演示</h1>
    <p>
      通过 <code>@kaokei/nuxt-use-vue-service</code> 插件，所有 API 无需手动
      <code>import</code>，由 Nuxt 自动注入。
    </p>

    <!-- Token + useAppService -->
    <section style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 6px">
      <h2>Token + useAppService</h2>
      <p>App 标题（来自 Token 绑定）：<strong>{{ appTitle }}</strong></p>
    </section>

    <!-- @Raw + useAppService -->
    <section style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 6px">
      <h2>@Raw 装饰器 + ThemeService</h2>
      <p>当前主题：<strong>{{ themeService.theme }}</strong></p>
      <p style="font-size: 12px; color: #666">
        config（@Raw，非响应式）：{{ themeService.config.version }}
      </p>
      <button @click="themeService.toggle">切换主题</button>
    </section>

    <!-- declareProviders + useService + @Computed + @Inject -->
    <section style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 6px">
      <h2>@Injectable + @Inject + @Computed</h2>
      <p>{{ countService.displayCount }}</p>
      <button @click="countService.increment">加一</button>
      <button @click="countService.reset" style="margin-left: 8px">重置</button>
    </section>

    <!-- 子组件独立容器（declareProviders 作用域隔离） -->
    <section style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 6px">
      <h2>子组件独立容器（declareProviders 作用域）</h2>
      <ChildPanel />
    </section>

    <!-- FIND_CHILD_SERVICE / FIND_CHILDREN_SERVICES Token 展示 -->
    <section style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 6px">
      <h2>FIND_CHILD_SERVICE / FIND_CHILDREN_SERVICES</h2>
      <p style="font-size: 12px; color: #666">
        这两个 Token 常量已自动导入（无需 import）：
      </p>
      <pre style="font-size: 12px">{{ String(findChildToken) }}</pre>
      <pre style="font-size: 12px">{{ String(findChildrenToken) }}</pre>
    </section>
  </div>
</template>
