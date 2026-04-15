import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 3000,
    // Proxy chỉ dùng khi dev local (docker không ảnh hưởng)
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // 👈 Đổi IP backend của bạn
        changeOrigin: true,
      },
      '/mqtt': {
        target: 'http://localhost:8083', // 👈 Đổi IP MQTT Broker WS
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
  },
})