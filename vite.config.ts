import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import proxy from './src/index'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    proxy({
      '/demo': {
        target: 'https://host/demo',
        secure: false,
        rewrite: (path:string)=>path.replace('/demo', '')
      }
    }),
  ],
})
