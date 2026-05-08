<template>
  <div class="cat-logo-container">
    <!-- 可爱的猫咪 Logo - 等待你添加真实图片 -->
    <div class="cat-logo-emoji">🐱</div>
    
    <!-- 
      使用说明：
      1. 将你的猫咪图片保存到：src/assets/images/cat-logo.png
      2. 然后取消下面的注释，删除上面的 emoji div
    -->
    <!--
    <img 
      src="/src/assets/images/cat-logo.png"
      alt="Vuepabase Logo - 可爱猫咪"
      class="cat-logo"
    />
    -->
  </div>
</template>

<script lang="ts" setup>
// 当前使用 emoji 🐱 作为临时 Logo
// 请按照上述说明添加真实图片
</script>

<style scoped>
.cat-logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* Emoji 猫咪样式 */
.cat-logo-emoji {
  font-size: 80px;
  line-height: 1;
  animation: cat-bounce 2s ease-in-out infinite;
  cursor: pointer;
  transition: transform 0.3s ease;
  filter: drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.3));
}

.cat-logo-emoji:hover {
  transform: scale(1.1) rotate(-5deg);
  animation-play-state: paused;
}

@keyframes cat-bounce {
  0%, 100% { 
    transform: translateY(0) scale(1); 
  }
  50% { 
    transform: translateY(-15px) scale(1.05); 
  }
}

/* 真实图片样式（添加图片后启用） */
.cat-logo {
  width: 120px;
  height: auto;
  image-rendering: auto;
  transition: transform 0.3s ease;
  filter: drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.3));
  animation: cat-bounce 2s ease-in-out infinite;
}

.cat-logo:hover {
  transform: scale(1.05) rotate(-2deg);
  animation-play-state: paused;
}

/* 像素风样式 */
.pixel-art .cat-logo-emoji,
.pixel-art .cat-logo {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>
