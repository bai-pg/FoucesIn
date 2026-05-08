import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

const STORAGE_KEY = 'vuepabase_chat_messages';
const MAX_MESSAGES = 100; // 限制最大消息数量，避免存储过大

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([]);

  // 从 localStorage 加载消息
  const loadMessages = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 只保留最近的消息
        messages.value = parsed.slice(-MAX_MESSAGES);
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      messages.value = [];
    }
  };

  // 保存消息到 localStorage
  const saveMessages = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value));
    } catch (error) {
      console.error('Failed to save chat messages:', error);
      // 如果存储失败（配额已满），清理旧消息
      if (messages.value.length > 10) {
        messages.value = messages.value.slice(-50);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value));
        } catch (e) {
          console.error('Still failed to save after cleanup:', e);
        }
      }
    }
  };

  // 添加新消息
  const addMessage = (message: ChatMessage) => {
    const newMessage: ChatMessage = {
      ...message,
      timestamp: message.timestamp || Date.now(),
    };
    
    messages.value.push(newMessage);
    
    // 如果消息过多，删除最早的消息
    if (messages.value.length > MAX_MESSAGES) {
      messages.value = messages.value.slice(-MAX_MESSAGES);
    }
    
    saveMessages();
  };

  // 清空所有消息
  const clearMessages = () => {
    messages.value = [];
    localStorage.removeItem(STORAGE_KEY);
  };

  // 删除指定消息
  const removeMessage = (index: number) => {
    if (index >= 0 && index < messages.value.length) {
      messages.value.splice(index, 1);
      saveMessages();
    }
  };

  // 获取最后 N 条消息
  const getLastMessages = (count: number = 10) => {
    return messages.value.slice(-count);
  };

  // 自动保存（深度监听）
  watch(
    messages,
    () => {
      saveMessages();
    },
    { deep: true }
  );

  // 初始化时加载消息
  loadMessages();

  return {
    messages,
    addMessage,
    clearMessages,
    removeMessage,
    getLastMessages,
    loadMessages,
  };
});
