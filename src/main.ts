import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { pinia } from "@/stores";
import VWave from "v-wave";
import { isDarkKey } from "./symbols";
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { useDark } from '@vueuse/core';
import "./main.css";

// 注册 deep-chat 自定义元素
import { DeepChat } from "deep-chat";
if (!customElements.get('deep-chat')) {
  customElements.define('deep-chat', DeepChat);
}

const app = createApp(App);

const isDark = useDark();
app.provide(isDarkKey, isDark);

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(router).use(pinia).use(VWave, {}).use(ElementPlus);

// 延迟加载 Purge Icons，避免阻塞首屏渲染
import("@purge-icons/generated").then(() => {
  console.log('Purge Icons loaded');
}).catch(err => {
  console.warn('Failed to load Purge Icons:', err);
});

app.mount("#app");