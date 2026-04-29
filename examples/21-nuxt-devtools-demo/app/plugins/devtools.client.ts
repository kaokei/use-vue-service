import { setupDevtools } from '@kaokei/devtools-use-vue-service'

export default defineNuxtPlugin((nuxtApp) => {
  setupDevtools(nuxtApp.vueApp)
})
