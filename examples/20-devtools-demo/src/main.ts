import { createApp } from 'vue'
import { declareAppProvidersPlugin } from '@kaokei/use-vue-service'
import App1 from './app1/App.vue'
import App2 from './app2/App.vue'
import App3 from './app3/App.vue'
import { ThemeService } from './services/ThemeService'
import { LoggerService } from './services/LoggerService'

// App 1: 深层嵌套测试 (5 层组件，有 App Container)
const app1 = createApp(App1)
app1.use(declareAppProvidersPlugin([ThemeService]))
app1.mount('#app1')

// App 2: 认证场景 (3 层组件，无 App Container — 只有组件级容器)
const app2 = createApp(App2)
app2.mount('#app2')

// App 3: 轻量场景 (2 层组件，有 App Container)
const app3 = createApp(App3)
app3.use(declareAppProvidersPlugin([LoggerService]))
app3.mount('#app3')
