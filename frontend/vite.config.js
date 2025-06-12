import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
     alias: {
         '@img': path.resolve(__dirname, './public/images'),
         '@pages': path.resolve(__dirname, './src/pages'),
         '@components': path.resolve(__dirname, './src/components'),
         '@api': path.resolve(__dirname, './src/api'),
         '@assets': path.resolve(__dirname, './src/assets'),
         '@context': path.resolve(__dirname, './src/context'),
         '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
  },
})