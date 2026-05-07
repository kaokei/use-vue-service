import { createApp } from 'vue'
import App1 from './app1/App.vue'
import App2 from './app2/App.vue'
import App3 from './app3/App.vue'

// App 1: 深层嵌套测试 (5 层组件，3 个容器)
const app1 = createApp(App1)
app1.mount('#app1')

// App 2: 认证场景 (3 层组件，3 个容器)
const app2 = createApp(App2)
app2.mount('#app2')

// App 3: 轻量场景 (2 层组件，2 个容器)
const app3 = createApp(App3)
app3.mount('#app3')
