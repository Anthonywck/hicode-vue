// Chat 页面入口文件
import '@/assets/styles/global.scss'
import '@/assets/iconfont/iconfont.css'
import '@/assets/iconvscode/iconfont-weapp/iconfont-weapp-icon.css'
import 'element-plus/dist/index.css'
// 导入 highlight.js 主题样式
import 'highlight.js/styles/paraiso-dark.css'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import App from './App.vue'
import { usePostMessage } from '@/composables/usePostMessage'

const app = createApp(App)

/**
 * 配置 marked 使用 hljs 进行代码高亮
 */
const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  })
)

// 配置 marked 选项
marked.use({
  async: true,
  pedantic: false,
  gfm: true,
})

// 将 marked 挂载到全局属性，供组件使用
app.config.globalProperties.$marked = marked

// 将 postMessage 挂载到全局属性，供组件使用
const { postMessage } = usePostMessage()
app.config.globalProperties.$postMessage = postMessage

// 导出 hljs 供组件使用（如果需要）
export { hljs }

// 注册 Element Plus
app.use(ElementPlus)

app.mount('#app')
