import { RouterService } from '~/services/RouterService'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  declareRootProviders([RouterService])
  const routerService = useRootService(RouterService)
  routerService.setRouter(useRouter(), route)
})
