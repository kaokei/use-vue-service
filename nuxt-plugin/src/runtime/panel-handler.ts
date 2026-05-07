/**
 * Nuxt DevTools Services Tab 面板页面。
 * 作为 iframe 内嵌在 Nuxt DevTools 中。
 *
 * 通过 postMessage 与 App 页面通信以获取容器树和绑定状态数据。
 */

export default defineEventHandler(() => {
  return new Response(getPanelHTML(), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
})

function getPanelHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Services · use-vue-service</title>
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"><\/script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,monospace;background:#1a1a2e;color:#ccc;overflow:auto;height:100vh}
.header{padding:16px;border-bottom:1px solid #333}
.header h2{font-size:16px;margin-bottom:4px;color:#eee}
.header p{font-size:12px;color:#888}
.toolbar{padding:8px 16px;display:flex;gap:8px}
.toolbar button{padding:4px 12px;background:#42b883;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px}
.toolbar button:disabled{opacity:.5}
.node{cursor:pointer;font-size:13px;display:flex;align-items:center;gap:6px}
.node:hover{background:rgba(255,255,255,0.05)}
.node.active{background:rgba(66,184,131,0.15);border-left:2px solid #42b883!important}
.state-panel{padding:8px 12px 8px 48px;font-size:12px;background:rgba(66,184,131,0.05)}
.state-key{font-weight:bold;margin:6px 0 2px;font-size:13px}
.state-row{margin-bottom:2px;padding:2px 0}
.state-name{color:#42b883}
.state-val{color:#aaa}
.error{padding:16px;color:#f56c6c;font-size:13px}
.empty{padding:24px 16px;color:#888;font-size:13px;text-align:center}
</style>
</head>
<body>
<div id="app">
  <div class="header"><h2>Services · Container Tree</h2><p>展示 use-vue-service 的容器层级结构和绑定服务</p></div>
  <div class="toolbar"><button :disabled="loading" @click="fetchTree">{{ loading ? 'Loading...' : 'Refresh' }}</button></div>
  <div v-if="error" class="error">{{ error }}</div>
  <div v-if="!loading && !error && !tree.length" class="empty">暂无容器数据。请确保组件中使用了 useService() 或 declareProviders()。</div>
  <template v-for="node in tree" :key="node.id">
    <div :class="['node',{active:selected===node.id}]"
         :style="{padding:\`6px 12px 6px \${12 + (nodeDepth(node)||0)*16}px\`,borderLeft:'2px solid transparent'}"
         @click="select(node.id)">
      <span style="font-size:10px;width:10px">{{ node.children && node.children.length ? '▶' : '' }}</span>
      <span :style="{fontWeight:selected===node.id?'bold':'normal'}">{{ node.label }}</span>
    </div>
    <div v-if="selected===node.id && stateInfo" class="state-panel">
      <div v-for="(entries,gkey) in stateInfo" :key="gkey">
        <div class="state-key">{{ gkey }}</div>
        <div class="state-row" v-for="entry in entries" :key="entry.key">
          <span class="state-name">{{ entry.key }}: </span>
          <span class="state-val">{{ formatVal(entry.value) }}</span>
          <div v-if="entry.value && entry.value._custom && entry.value._custom.value">
            <div class="state-row" v-for="(v,k) in entry.value._custom.value" :key="k">
              <span class="state-name" style="font-size:11px">  {{ k }}: </span>
              <span class="state-val" style="font-size:11px">{{ formatVal(v) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</div>
<script>
var MSG_PREFIX='use-vue-service:'
var MSG_GET_TREE=MSG_PREFIX+'getInspectorTree'
var MSG_GET_STATE=MSG_PREFIX+'getInspectorState'
var MSG_TREE_RESPONSE=MSG_PREFIX+'inspectorTree'
var MSG_STATE_RESPONSE=MSG_PREFIX+'inspectorState'
Vue.createApp({data:function(){return{tree:[],selected:null,stateInfo:null,loading:false,error:null}},mounted:function(){var t=this;window.addEventListener('message',function(e){return t.handleMessage(e)});this.\$nextTick(function(){return t.fetchTree()})},beforeUnmount:function(){window.removeEventListener('message',this.handleMessage)},methods:{send:function(t,p){window.parent.postMessage({source:'use-vue-service-tab',type:t,payload:p},'*')},handleMessage:function(t){if(t.data&&t.data.source==='use-vue-service-app'){var d=t.data;var type=d.type;var payload=d.payload;if(type===MSG_TREE_RESPONSE){this.tree=payload&&payload.rootNodes||[];this.loading=false}else if(type===MSG_STATE_RESPONSE){this.stateInfo=payload&&payload.state||{};this.loading=false}}},fetchTree:function(){var t=this;this.loading=true;this.error=null;this.send(MSG_GET_TREE);setTimeout(function(){if(t.loading){t.loading=false;t.error='获取数据超时，请确保 use-vue-service 已正确配置'}},5000)},select:function(t){this.selected=t;this.stateInfo=null;this.send(MSG_GET_STATE,t)},formatVal:function(t){if(t===null||t===undefined)return'';if(typeof t==='object'){var c=t._custom;if(c)return c.display||c.value||JSON.stringify(c);return JSON.stringify(t)}return String(t)},nodeDepth:function(n){var d=0;var cur=n;while(cur){d++;cur=this.tree.find(function(x){return x.children&&x.children.some(function(c){return c.id===cur.id})})}return d}}}).mount('#app')
<\/script>
</body>
</html>`
}
