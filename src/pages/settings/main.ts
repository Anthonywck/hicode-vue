// Settings 页面入口文件
import '@/assets/styles/global.scss'
import '@/assets/iconfont/iconfont.css'
import 'element-plus/dist/index.css'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import App from './App.vue'

const app = createApp(App)

// 注册 Element Plus
app.use(ElementPlus)

app.mount('#app')
