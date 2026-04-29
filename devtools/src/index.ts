import type { App } from 'vue'
import { setupDevToolsPlugin } from '@vue/devtools-api'

type DevtoolsApi = Parameters<Parameters<typeof setupDevToolsPlugin>[1]>[0]

const INSPECTOR_ID = 'uvs-services'

export function setupDevtools(app: App) {
  setupDevToolsPlugin(
    {
      id: 'kaokei-use-vue-service',
      label: 'use-vue-service',
      packageName: '@kaokei/devtools-use-vue-service',
      homepage: 'https://github.com/kaokei/use-vue-service',
      app,
    },
    (api: DevtoolsApi) => {
      api.addInspector({
        id: INSPECTOR_ID,
        label: 'Services',
        icon: 'storage',
      })

      api.on.getInspectorTree((payload) => {
        if (payload.inspectorId !== INSPECTOR_ID) return
        payload.rootNodes = [
          { id: 'placeholder', label: '这里是 Services' },
        ]
      })

      api.on.getInspectorState((payload) => {
        if (payload.inspectorId !== INSPECTOR_ID) return
        payload.state = {
          '说明': [
            { key: 'status', value: '这里是 Services 静态占位内容' },
          ],
        }
      })
    },
  )
}
