<template>
  <div class="mobile-demo-page">
    <!-- 顶部导航栏（响应式） -->
    <header class="sticky top-0 z-30 bg-white dark:bg-slate-800 shadow-sm" :class="{ 'pt-safe-top': isMobile }">
      <div class="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <h1 class="text-base sm:text-lg font-bold text-gray-800 dark:text-white">移动端适配示例</h1>
        <button class="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors min-h-[44px] sm:min-h-auto">
          操作
        </button>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="px-4 py-6 pb-24 sm:px-6 lg:px-8" :class="{ 'pb-safe-bottom': isMobile }">
      <!-- 卡片示例 -->
      <section class="mb-6">
        <h2 class="text-base font-semibold mb-3 text-gray-700 dark:text-gray-200">卡片组件</h2>
        <div 
          class="rounded-lg shadow-sm bg-white dark:bg-slate-800 p-4 cursor-pointer transition-transform active:scale-98 sm:active:scale-100"
          @click="handleCardClick"
        >
          <h3 class="font-medium text-gray-800 dark:text-white mb-2">点击我有反馈</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            这是一个移动端优化的卡片，在移动端点击时会有缩放效果
          </p>
        </div>
      </section>

      <!-- 网格布局示例（响应式） -->
      <section class="mb-6">
        <h2 class="text-base font-semibold mb-3 text-gray-700 dark:text-gray-200">响应式网格</h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <div 
            v-for="i in 8" 
            :key="i"
            class="rounded-lg shadow-sm bg-white dark:bg-slate-800 p-3 text-center"
          >
            <div class="text-2xl mb-1">📱</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">项目 {{ i }}</div>
          </div>
        </div>
      </section>

      <!-- 表单示例 -->
      <section class="mb-6">
        <h2 class="text-base font-semibold mb-3 text-gray-700 dark:text-gray-200">表单输入</h2>
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <input 
            type="text"
            class="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] text-base"
            placeholder="请输入姓名"
            v-model="formData.name"
          />
          <input 
            type="email"
            class="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] text-base"
            placeholder="请输入邮箱"
            v-model="formData.email"
          />
          <textarea 
            class="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] text-base"
            placeholder="请输入备注"
            rows="3"
            v-model="formData.note"
          ></textarea>
          <button type="submit" class="w-full px-4 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors min-h-[44px]">
            提交表单
          </button>
        </form>
      </section>

      <!-- 列表示例 -->
      <section class="mb-6">
        <h2 class="text-base font-semibold mb-3 text-gray-700 dark:text-gray-200">列表项</h2>
        <ul class="bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
          <li 
            v-for="item in listItems" 
            :key="item.id"
            class="px-4 py-3 border-b flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 min-h-[44px]"
            @click="handleItemClick(item)"
          >
            <div class="flex items-center space-x-3">
              <span class="text-xl">{{ item.icon }}</span>
              <span class="text-gray-800 dark:text-white">{{ item.name }}</span>
            </div>
            <span class="text-gray-400">›</span>
          </li>
        </ul>
      </section>

      <!-- 响应式显示示例 -->
      <section class="mb-6">
        <h2 class="text-base font-semibold mb-3 text-gray-700 dark:text-gray-200">响应式显示</h2>
        <div class="only-mobile bg-green-100 dark:bg-green-900 p-3 rounded-lg mb-2">
          <p class="text-green-800 dark:text-green-200 text-sm">
            📱 这段内容仅在移动端显示（< 640px）
          </p>
        </div>
        <div class="only-desktop bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
          <p class="text-purple-800 dark:text-purple-200 text-sm">
            💻 这段内容仅在桌面端显示（≥ 640px）
          </p>
        </div>
      </section>
    </main>

    <!-- 底部固定栏（仅移动端显示） -->
    <footer class="only-mobile fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 pb-safe-bottom">
      <div class="flex items-center justify-around py-3">
        <button class="flex flex-col items-center space-y-1 tap-highlight-transparent">
          <span class="text-xl">🏠</span>
          <span class="text-xs text-gray-600 dark:text-gray-400">首页</span>
        </button>
        <button class="flex flex-col items-center space-y-1 tap-highlight-transparent">
          <span class="text-xl">🔍</span>
          <span class="text-xs text-gray-600 dark:text-gray-400">搜索</span>
        </button>
        <button class="flex flex-col items-center space-y-1 tap-highlight-transparent">
          <span class="text-xl">👤</span>
          <span class="text-xs text-gray-600 dark:text-gray-400">我的</span>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const formData = ref({
  name: '',
  email: '',
  note: ''
})

const listItems = ref([
  { id: 1, name: '设置', icon: '⚙️' },
  { id: 2, name: '通知', icon: '🔔' },
  { id: 3, name: '帮助', icon: '❓' },
  { id: 4, name: '关于', icon: 'ℹ️' },
])

// 检测是否为移动端
const isMobile = computed(() => window.innerWidth < 768)

const handleCardClick = () => {
  console.log('卡片被点击')
}

const handleSubmit = () => {
  console.log('表单提交:', formData.value)
  alert('表单提交成功！')
}

const handleItemClick = (item: any) => {
  console.log('点击列表项:', item)
}
</script>

<style scoped>
.mobile-demo-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.dark .mobile-demo-page {
  background-color: #0f172a;
}

/* 安全区域支持 */
.pt-safe-top {
  padding-top: env(safe-area-inset-top);
}

.pb-safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 移动端触摸反馈 */
@media (max-width: 768px) {
  .active\\:scale-98:active {
    transform: scale(0.98);
  }
}
</style>
