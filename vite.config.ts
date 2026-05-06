import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './vuepabase/src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    },
    // 开发服务器优化
    hmr: {
      overlay: true,
    },
  },
  build: {
    // 生产构建优化
    rollupOptions: {
      output: {
        // 手动分包策略
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Vue 核心库
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vue-vendor';
            }
            // Element Plus UI 库
            if (id.includes('element-plus') || id.includes('@element-plus')) {
              return 'element-plus';
            }
            // ECharts 图表库
            if (id.includes('echarts') || id.includes('vue-echarts')) {
              return 'echarts-vendor';
            }
            // Supabase SDK
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // AntV X6 工作流库
            if (id.includes('@antv/x6')) {
              return 'x6-vendor';
            }
          }
        },
        // 资源文件命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 启用 gzip 压缩报告
    reportCompressedSize: true,
    // 减少 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    // 预构建优化 - 提前编译大型依赖
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      '@element-plus/icons-vue',
      'echarts',
      'vue-echarts',
      '@supabase/supabase-js',
      '@vueuse/core',
    ],
    // 排除不需要预构建的依赖
    exclude: ['@xenova/transformers'],
  },
});