import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path, { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // @符号指向src目录
      "@": resolve(__dirname,"./src")
    }
  },
  server: {
    https: false,
    host: true,
    port: 8089,
    open: false,
    cors: true,
    strictPort: false,
    proxy: {
      '/yoloTest': {
        target: "http://127.0.0.1:9111/",
        ws: true,
        changeOrigin: true
      }
    }
  }
})
