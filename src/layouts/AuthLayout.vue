<script lang="ts" setup>
// 导入猫咪图片
import catLogo from '@/assets/images/cat-log.png'
</script>
<template>
  <div class="pixel-login flex h-full min-h-full items-center justify-center p-4">
    <div
      class="pixel-card mx-auto w-full max-w-md rounded-none border-4 border-black bg-white p-8 shadow-pixel"
    >
      <div class="flex flex-col items-center">
        <!-- 猫咪 Logo -->
        <div class="mb-6">
          <img :src="catLogo" alt="猫咪Logo" class="cat-logo" />
        </div>

        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 简洁背景 */
.pixel-login {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 卡片样式 */
.pixel-card {
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 像素艺术图片 */
.pixel-art {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

/* 猫咪图片样式 */
.cat-logo {
  width: 120px;
  height: auto;
  transition: transform 0.2s ease;
}

.cat-logo:hover {
  transform: scale(1.05);
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .pixel-login {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }
  
  .pixel-card {
    background: #0f0f1e;
    border-color: #fff;
  }
}
</style>
