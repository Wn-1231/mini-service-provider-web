import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 添加以下配置以忽略 Node.js 版本检查
  optimizeDeps: {
    force: true
  },
  server: {
    hmr: {
      overlay: false
    },
    host: '0.0.0.0',
    allowedHosts: ['xvmniy.cn', 'localhost', 'windows.dev.zhihu.com']
  }
})
