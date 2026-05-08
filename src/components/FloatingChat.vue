<template>
  <div class="floating-chat-container">
    <!-- 聊天弹窗 -->
    <Transition name="chat-popup">
      <div v-if="isChatOpen" class="chat-popup-overlay" @click="closeChat">
        <div class="chat-popup" @click.stop>
          <div class="chat-header">
            <span class="chat-title">AI 学习助手</span>
            <button class="close-btn" @click="closeChat" aria-label="关闭聊天">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="chat-content">
            <AiChat 
              :initial-messages="formattedMessages" 
              @new-message="handleNewMessage" 
            />
          </div>
        </div>
      </div>
    </Transition>

    <!-- 浮动按钮（可拖动） -->
    <Transition name="float-btn">
      <button 
        v-if="!isChatOpen" 
        ref="floatBtnRef"
        class="float-chat-btn"
        :style="buttonPosition"
        @mousedown="startDrag"
        @touchstart="startDragTouch"
        @click="handleClick"
        aria-label="打开AI助手"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="btn-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import AiChat from './AiChat.vue';
import { useChatStore } from '@/stores/chat';
import type { ChatMessage } from '@/stores/chat';

const chatStore = useChatStore();
const isChatOpen = ref(false);
const unreadCount = ref(0);
const floatBtnRef = ref<HTMLElement | null>(null);

// 拖动相关状态
const isDragging = ref(false);
const buttonPosition = ref({
  bottom: '24px',
  right: '24px',
  left: 'auto',
  top: 'auto'
});
let dragStartX = 0;
let dragStartY = 0;
let initialRight = 24;
let initialBottom = 24;

// 将 store 中的消息格式化为 Deep Chat 需要的格式
const formattedMessages = computed(() => {
  return chatStore.messages.map((msg: ChatMessage) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
    timestamp: msg.timestamp,
  }));
});

// 从 localStorage 恢复按钮位置
const restoreButtonPosition = () => {
  const savedPosition = localStorage.getItem('chatButtonPosition');
  if (savedPosition) {
    try {
      const pos = JSON.parse(savedPosition);
      buttonPosition.value = pos;
    } catch (e) {
      console.error('恢复按钮位置失败:', e);
    }
  }
};

// 保存按钮位置到 localStorage
const saveButtonPosition = () => {
  localStorage.setItem('chatButtonPosition', JSON.stringify(buttonPosition.value));
};

const openChat = () => {
  isChatOpen.value = true;
  unreadCount.value = 0;
};

const closeChat = () => {
  isChatOpen.value = false;
};

const handleNewMessage = (message: any) => {
  // 将 Deep Chat 的消息格式转换为 store 需要的格式
  const chatMessage: ChatMessage = {
    role: message.role === 'user' ? 'user' : 'assistant',
    content: message.text || '',
    timestamp: message.timestamp || Date.now(),
  };
  
  chatStore.addMessage(chatMessage);
  
  // 如果聊天窗口未打开，增加未读计数
  if (!isChatOpen.value) {
    unreadCount.value++;
  }
};

// 鼠标拖动开始
const startDrag = (e: MouseEvent) => {
  isDragging.value = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  
  // 获取当前按钮位置
  const btn = floatBtnRef.value;
  if (btn) {
    const rect = btn.getBoundingClientRect();
    initialRight = window.innerWidth - rect.right;
    initialBottom = window.innerHeight - rect.bottom;
  }
  
  // 添加全局事件监听
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  
  e.preventDefault();
};

// 鼠标拖动中
const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return;
  
  const deltaX = e.clientX - dragStartX;
  const deltaY = e.clientY - dragStartY;
  
  // 计算新位置
  const newRight = initialRight - deltaX;
  const newBottom = initialBottom - deltaY;
  
  // 限制在屏幕范围内
  const btnWidth = 64;
  const btnHeight = 64;
  const maxRight = window.innerWidth - btnWidth - 10;
  const maxBottom = window.innerHeight - btnHeight - 10;
  
  buttonPosition.value = {
    right: `${Math.max(10, Math.min(maxRight, newRight))}px`,
    bottom: `${Math.max(10, Math.min(maxBottom, newBottom))}px`,
    left: 'auto',
    top: 'auto'
  };
};

// 鼠标拖动结束
const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  saveButtonPosition();
};

// 触摸拖动开始（移动端支持）
const startDragTouch = (e: TouchEvent) => {
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  startDrag(mouseEvent);
};

// 处理点击事件（区分拖动和点击）
const handleClick = (e: MouseEvent) => {
  // 如果是拖动操作，不触发打开聊天
  if (isDragging.value) return;
  openChat();
};

onMounted(() => {
  console.log('FloatingChat initialized with messages:', chatStore.messages.length);
  restoreButtonPosition();
});

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
});
</script>

<style scoped>
.floating-chat-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.float-chat-btn {
  position: fixed;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  /* 位置由动态样式控制 */
}

.float-chat-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.float-chat-btn:active {
  transform: scale(0.95);
}

.btn-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.chat-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 24px;
  z-index: 999;
}

.chat-popup {
  width: 100%;
  max-width: 480px;
  height: 600px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-title {
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chat-content {
  flex: 1;
  overflow: hidden;
}

.chat-popup-enter-active,
.chat-popup-leave-active {
  transition: all 0.3s ease;
}

.chat-popup-enter-from,
.chat-popup-leave-to {
  opacity: 0;
}

.chat-popup-enter-from .chat-popup,
.chat-popup-leave-to .chat-popup {
  transform: translateY(100%);
}

.float-btn-enter-active,
.float-btn-leave-active {
  transition: all 0.3s ease;
}

.float-btn-enter-from,
.float-btn-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

/* 移动端适配 */
@media (max-width: 640px) {
  .floating-chat-container {
    bottom: 16px;
    right: 16px;
  }

  .float-chat-btn {
    width: 56px;
    height: 56px;
  }

  .chat-popup {
    height: 80vh;
    max-height: 600px;
  }

  .chat-popup-overlay {
    padding: 16px;
  }
}
</style>
