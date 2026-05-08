<template>
  <div class="custom-chat-container">
    <!-- 未登录提示 -->
    <div v-if="!isLoggedIn" class="auth-required">
      <div class="auth-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <h3>需要登录</h3>
        <p>请先登录以使用 AI 助手功能</p>
        <router-link to="/signin" class="login-btn">去登录</router-link>
      </div>
    </div>

    <!-- 聊天界面 -->
    <template v-else>
      <!-- 模式切换按钮 -->
      <div class="mode-switcher">
        <button 
          :class="['mode-btn', !isStudyAnalysisMode ? 'active' : '']"
          @click="toggleStudyAnalysisMode"
        >
          💬 普通对话
        </button>
        <button 
          :class="['mode-btn', isStudyAnalysisMode ? 'active' : '']"
          @click="toggleStudyAnalysisMode"
        >
          📊 学习分析
        </button>
      </div>
      
      <!-- 学习分析模式提示 -->
      <div v-if="isStudyAnalysisMode" class="mode-info">
        <span class="info-icon">ℹ️</span>
        <span>学习分析模式：AI 将基于你的学习记录提供分析和建议</span>
      </div>
      
      <div class="messages-container">
        <div
          v-for="(msg, index) in displayMessages"
          :key="index"
          :class="['message', msg.role]"
        >
          <div class="message-content">{{ msg.content }}</div>
        </div>
        <div v-if="isLoading" class="loading">
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
        </div>
      </div>
      <div class="input-container">
        <input
          v-model="inputMessage"
          @keyup.enter="sendMessage"
          placeholder="Ask me anything!"
          class="chat-input"
          :disabled="isLoading"
        />
        <button @click="sendMessage" class="send-btn" :disabled="isLoading">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M22 2H11l-5 5L2 2v14l3-3h9l5 5V2z"></path>
          </svg>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import type { Session } from "@supabase/supabase-js";

const props = defineProps<{
  initialMessages?: Array<{ role: string; content: string }>;
}>();

const emit = defineEmits<{
  (
    e: "new-message",
    message: { role: string; content: string; timestamp: number }
  ): void;
}>();

const authStore = useAuthStore();
// 保存完整的对话历史（用于多轮对话上下文）
const conversationHistory = ref<Array<{ role: string; content: string }>>(
  props.initialMessages || []
);
// 用于显示的简化消息列表（只显示最近的消息）
const displayMessages = ref<Array<{ role: string; content: string }>>([]);
const inputMessage = ref("");
const isLoading = ref(false);
const isLoggedIn = ref(false);
let currentSession: Session | null = null;

// 学习分析模式
const isStudyAnalysisMode = ref(false);

// 从环境变量获取 Supabase URL 和 AI 代理 URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const AI_PROXY_URL = `${supabaseUrl}/functions/v1/ai-proxy`;

// 最大保留的对话轮数（避免上下文过长）
const MAX_CONVERSATION_TURNS = 20;

// 切换学习分析模式
const toggleStudyAnalysisMode = () => {
  isStudyAnalysisMode.value = !isStudyAnalysisMode.value;
  // 切换模式时清空对话历史
  conversationHistory.value = [];
  displayMessages.value = [];
};

// 检查用户是否已登录
const checkLoginStatus = async () => {
  const { data: { session } } = await authStore.supabase.auth.getSession();
  currentSession = session;
  isLoggedIn.value = !!session;
  return session;
};

// 初始化显示消息
const initDisplayMessages = () => {
  // 只显示最近的几条消息用于展示
  displayMessages.value = conversationHistory.value.slice(-10);
};

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return;

  // 检查是否登录
  const session = await checkLoginStatus();
  if (!session) {
    const errorMessageObj = {
      role: "assistant" as const,
      content: "请先登录以使用 AI 助手功能。",
    };
    conversationHistory.value.push(errorMessageObj);
    displayMessages.value.push(errorMessageObj);
    emit("new-message", {
      ...errorMessageObj,
      timestamp: Date.now(),
    });
    isLoggedIn.value = false;
    return;
  }

  const userMessage = {
    role: "user" as const,
    content: inputMessage.value.trim(),
  };

  // 添加到对话历史
  conversationHistory.value.push(userMessage);
  
  // 更新显示消息
  initDisplayMessages();

  // 触发 new-message 事件
  emit("new-message", {
    ...userMessage,
    timestamp: Date.now(),
  });

  inputMessage.value = "";
  isLoading.value = true;

  try {
    console.log("发送请求到:", AI_PROXY_URL);
    console.log("对话历史长度:", conversationHistory.value.length);

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    // 限制上下文长度，只发送最近的 MAX_CONVERSATION_TURNS 条消息
    const contextMessages = conversationHistory.value.slice(-MAX_CONVERSATION_TURNS);

    const response = await fetch(AI_PROXY_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        messages: contextMessages,
        includeStudyRecords: isStudyAnalysisMode.value, // 添加学习分析模式标记
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("响应状态:", response.status);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "未知错误" }));
      console.error("请求失败:", errorData);
      throw new Error(
        errorData.error?.message || errorData.message || `请求失败: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("收到响应:", data);

    const assistantMessage = {
      role: "assistant" as const,
      content: data.content || data.message || "抱歉，无法获取回复",
    };

    // 添加到对话历史
    conversationHistory.value.push(assistantMessage);
    
    // 更新显示消息
    initDisplayMessages();

    // 触发 new-message 事件
    emit("new-message", {
      ...assistantMessage,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("聊天请求失败:", error);
    
    let errorMessage = "抱歉，我遇到了一些问题，请稍后再试。";
    
    if (error.name === 'AbortError') {
      errorMessage = "请求超时，请检查网络连接后重试。";
    } else if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_CLOSED')) {
      errorMessage = "无法连接到 AI 服务，请检查网络连接。";
    } else if (error.message) {
      errorMessage = `错误: ${error.message}`;
    }

    const errorMessageObj = {
      role: "assistant" as const,
      content: errorMessage,
    };
    conversationHistory.value.push(errorMessageObj);
    displayMessages.value.push(errorMessageObj);

    // 触发 new-message 事件
    emit("new-message", {
      ...errorMessageObj,
      timestamp: Date.now(),
    });
  } finally {
    isLoading.value = false;
  }
};

// 清空对话历史
const clearHistory = () => {
  conversationHistory.value = [];
  displayMessages.value = [];
};

onMounted(async () => {
  console.log("AiChat initialized");
  console.log("Supabase URL:", supabaseUrl);
  console.log("AI Proxy URL:", AI_PROXY_URL);
  
  const session = await checkLoginStatus();
  console.log("User logged in:", isLoggedIn.value);
  
  // 初始化显示消息
  initDisplayMessages();
});

// 暴露清空历史的方法
defineExpose({
  clearHistory
});
</script>

<style scoped>
.custom-chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #f5f5f5;
}

.auth-required {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px;
}

.auth-message {
  text-align: center;
  color: #666;
}

.auth-message svg {
  margin-bottom: 16px;
  color: #999;
}

.auth-message h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #333;
}

.auth-message p {
  margin-bottom: 24px;
}

.mode-switcher {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.mode-btn {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.mode-btn:hover {
  border-color: #6c5ce7;
  background: #f8f7ff;
}

.mode-btn.active {
  background: #6c5ce7;
  color: white;
  border-color: #6c5ce7;
}

.mode-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff3cd;
  border-bottom: 1px solid #ffc107;
  font-size: 13px;
  color: #856404;
}

.info-icon {
  font-size: 16px;
}

.login-btn {
  display: inline-block;
  padding: 12px 32px;
  background: #6c5ce7;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s;
}

.login-btn:hover {
  background: #5a4bd1;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
}

.message.user {
  align-self: flex-end;
  background: #6c5ce7;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant {
  align-self: flex-start;
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-content {
  white-space: pre-wrap;
  line-height: 1.5;
}

.loading {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  align-self: flex-start;
  background: white;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: #6c5ce7;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.input-container {
  display: flex;
  gap: 8px;
  padding: 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #6c5ce7;
}

.chat-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.send-btn {
  padding: 12px 20px;
  background: #6c5ce7;
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  background: #5a4bd1;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>