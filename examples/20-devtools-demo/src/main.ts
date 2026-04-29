import { createApp } from 'vue'
import { setupDevtools } from '@kaokei/devtools-use-vue-service'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')

setupDevtools(app)
