import { fileURLToPath, URL } from 'node:url'
import { writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { defineConfig, type ConfigEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// 根据模式动态修改 HTML 入口的插件（用于开发模式）
function createHtmlEntryPlugin(mode: string): Plugin {
  return {
    name: 'html-entry',
    transformIndexHtml(html: string) {
      // 确定入口路径
      let entryPath = '/src/pages/chat/main.ts' // 默认
      if (mode === 'chat') {
        entryPath = '/src/pages/chat/main.ts'
      } else if (mode === 'settings') {
        entryPath = '/src/pages/settings/main.ts'
      }
      
      // 在 </body> 前添加入口脚本
      return html.replace('</body>', `  <script type="module" src="${entryPath}"></script>\n</body>`)
    },
  }
}

// 生成 HTML 文件的插件（用于生产构建）
function createHtmlPlugin(mode: string, outDir: string): Plugin {
  let entryFileName = ''
  let cssFiles: string[] = []
  
  return {
    name: 'generate-html',
    generateBundle(options, bundle) {
      // 收集入口文件和 CSS 文件
      for (const fileName in bundle) {
        const chunk = bundle[fileName]
        if (chunk.type === 'chunk' && chunk.isEntry) {
          entryFileName = chunk.fileName
        } else if (chunk.type === 'asset' && fileName.endsWith('.css')) {
          cssFiles.push(chunk.fileName)
        }
      }
    },
    writeBundle() {
      // 在构建完成后生成 HTML 文件
      if (entryFileName) {
        const htmlContent = `<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vite App</title>
    ${cssFiles.map(css => `<link rel="stylesheet" crossorigin href="/${css}">`).join('\n    ')}
  </head>
  <body>
    <div id="app"></div>
    <script type="module" crossorigin src="/${entryFileName}"></script>
  </body>
</html>`
        
        writeFileSync(join(outDir, 'index.html'), htmlContent, 'utf-8')
      }
    },
  }
}

// 修复 iconfont 字体文件路径的插件
// 将字体文件转换为 base64 内联到 CSS 中，避免 VS Code Webview 路径解析问题
function createIconfontFixPlugin(): Plugin {
  return {
    name: 'iconfont-fix',
    generateBundle(options, bundle) {
      // 在生产构建时，处理 CSS 文件中的字体路径
      // 首先收集所有字体文件
      const fontFileMap = new Map<string, { source: Buffer; mimeType: string; fileName: string }>()
      
      for (const assetFileName in bundle) {
        const assetChunk = bundle[assetFileName]
        if (assetChunk.type === 'asset' && /\.(woff|woff2|ttf|eot)$/.test(assetFileName)) {
          const fontFileName = assetChunk.fileName
          
          // 根据文件扩展名确定 MIME 类型
          let mimeType = 'application/octet-stream'
          if (fontFileName.endsWith('.woff2')) {
            mimeType = 'font/woff2'
          } else if (fontFileName.endsWith('.woff')) {
            mimeType = 'font/woff'
          } else if (fontFileName.endsWith('.ttf')) {
            mimeType = 'font/ttf'
          } else if (fontFileName.endsWith('.eot')) {
            mimeType = 'application/vnd.ms-fontobject'
          }
          
          // 获取字体文件内容（可能是 Buffer 或 string）
          let fontSource: Buffer
          if (assetChunk.source instanceof Buffer) {
            fontSource = assetChunk.source
          } else if (typeof assetChunk.source === 'string') {
            fontSource = Buffer.from(assetChunk.source, 'binary')
          } else {
            continue
          }
          
          fontFileMap.set(fontFileName, { source: fontSource, mimeType, fileName: fontFileName })
        }
      }
      
      // 处理 CSS 文件
      for (const fileName in bundle) {
        const chunk = bundle[fileName]
        if (chunk.type === 'asset' && fileName.endsWith('.css')) {
          // 获取 CSS 内容
          const source = chunk.source as string
          if (typeof source === 'string') {
            // 替换 CSS 中的字体路径为 base64 data URI
            let modifiedSource = source
            fontFileMap.forEach(({ source: fontSource, mimeType }, fontFileName) => {
              // 将字体文件转换为 base64
              const base64 = fontSource.toString('base64')
              
              // 转义文件名中的特殊字符用于正则匹配
              const escapedFileName = fontFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
              
              // 匹配 url() 中的字体文件路径（包括查询参数）
              const urlPattern = new RegExp(
                `url\\((['"]?)([^'")]*${escapedFileName}[^'")]*)\\1\\)`,
                'gi'
              )
              
              modifiedSource = modifiedSource.replace(urlPattern, (match, quote, path) => {
                // 如果已经是 data URI，跳过
                if (path.trim().startsWith('data:')) {
                  return match
                }
                // 替换为 base64 data URI
                const dataUri = `data:${mimeType};charset=utf-8;base64,${base64}`
                return `url(${quote}${dataUri}${quote})`
              })
            })
            
            // 更新 CSS 内容
            if (modifiedSource !== source) {
              chunk.source = modifiedSource
            }
          }
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  // 根据模式确定输出目录和入口文件
  let outDir = 'media'
  let entry: string
  
  if (mode === 'chat') {
    outDir = 'media/chatPage'
    entry = fileURLToPath(new URL('./src/pages/chat/main.ts', import.meta.url))
  } else if (mode === 'settings') {
    outDir = 'media/settings'
    entry = fileURLToPath(new URL('./src/pages/settings/main.ts', import.meta.url))
  } else {
    // 默认使用 chat
    outDir = 'media/chatPage'
    entry = fileURLToPath(new URL('./src/pages/chat/main.ts', import.meta.url))
  }

  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      createHtmlEntryPlugin(mode), // 开发模式：动态注入入口脚本
      createHtmlPlugin(mode, outDir), // 生产模式：生成 HTML 文件
      createIconfontFixPlugin(), // 修复 iconfont 字体文件路径
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    // 配置静态资源处理，确保字体文件被正确处理
    assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.eot'],
    css: {
      preprocessorOptions: {
        scss: {
          // 自动导入全局变量和 mixins
          additionalData: `@use "@/assets/styles/variables.scss" as *; @use "@/assets/styles/mixins.scss" as *;`,
          api: 'modern-compiler',
        },
      },
      // 配置 CSS 中 url() 的处理方式
      postcss: {
        plugins: [],
      },
    },
    build: {
      outDir,
      rollupOptions: {
        // 开发模式使用 HTML，生产模式使用入口文件
        input: process.env.NODE_ENV === 'production' ? entry : fileURLToPath(new URL('./index.html', import.meta.url)),
        output: {
          // 为不同模式生成不同的入口文件名，避免冲突
          entryFileNames: mode === 'settings' ? 'assets/settings-[hash].js' : 'assets/index-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
  }
})
