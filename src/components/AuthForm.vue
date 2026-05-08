<script lang="ts" setup>
import { useAuthStore } from "@/stores/auth";
import { Ref, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ElButton, ElInput, ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';

// 定义凭据接口
interface Credentials {
  email: string;
  password: string;
}

const props = defineProps<{
  signUp: boolean;
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
}>();

const credentials: Ref<Credentials> = ref({
  email: "",
  password: "",
});

const router = useRouter();

const emailLoading = ref(false);
async function emailAuth() {
  emailLoading.value = true;
  const { supabase } = useAuthStore();
  
  try {
    if (props.signUp) {
      // 注册
      const { data, error } = await supabase.auth.signUp(credentials.value);
      if (error) throw error;
      if (data.user) {
        ElMessage.success('注册成功！请检查邮箱验证。');
        router.push('/signin');
      }
    } else {
      // 登录
      const { data, error } = await supabase.auth.signInWithPassword(credentials.value);
      if (error) throw error;
      if (data.user) {
        ElMessage.success('登录成功！');
        router.push('/');
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败，请重试');
  } finally {
    emailLoading.value = false;
  }
}

const gitHubLoading = ref(false);
async function gitHubAuth() {
  gitHubLoading.value = true;
  const { supabase } = useAuthStore();
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      }
    });
    if (error) throw error;
  } catch (error: any) {
    ElMessage.error(error.message);
    gitHubLoading.value = false;
  }
}

const googleLoading = ref(false);
async function googleAuth() {
  googleLoading.value = true;
  const { supabase } = useAuthStore();
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      }
    });
    if (error) throw error;
  } catch (error: any) {
    ElMessage.error(error.message);
    googleLoading.value = false;
  }
}

const twitterLoading = ref(false);
async function twitterAuth() {
  twitterLoading.value = true;
  const { supabase } = useAuthStore();
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      }
    });
    if (error) throw error;
  } catch (error: any) {
    ElMessage.error(error.message);
    twitterLoading.value = false;
  }
}

const facebookLoading = ref(false);
async function facebookAuth() {
  facebookLoading.value = true;
  const { supabase } = useAuthStore();
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      }
    });
    if (error) throw error;
  } catch (error: any) {
    ElMessage.error(error.message);
    facebookLoading.value = false;
  }
}

const loading = computed(
  () =>
    gitHubLoading.value ||
    emailLoading.value ||
    googleLoading.value ||
    twitterLoading.value ||
    facebookLoading.value
);
</script>
<template>
  <div class="pixel-auth-form w-full">
    <!-- 标题 -->
    <h2 class="pixel-title mb-2 text-center text-2xl font-bold">
      {{ title }}
    </h2>
    <p class="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
      {{ subtitle }}
    </p>
    
    <!-- 登录表单 -->
    <el-form 
      class="flex w-full flex-col items-start" 
      @submit.prevent="emailAuth"
      label-position="top"
    >
      <el-form-item label="邮箱" class="w-full pixel-form-item">
        <el-input
          v-model="credentials.email"
          :placeholder="emailPlaceholder"
          :disabled="loading"
          required
          type="email"
          size="large"
          :prefix-icon="User"
          class="pixel-input"
        />
      </el-form-item>
      
      <el-form-item label="密码" class="w-full pixel-form-item">
        <el-input
          v-model="credentials.password"
          :placeholder="passwordPlaceholder"
          :disabled="loading"
          required
          type="password"
          size="large"
          :prefix-icon="Lock"
          show-password
          class="pixel-input"
        />
      </el-form-item>

      <router-link
        v-if="!signUp"
        to="/forgotpassword"
        class="pixel-link mb-4 text-sm font-bold hover:underline"
        >忘记密码？</router-link
      >

      <el-button
        type="primary"
        size="large"
        :loading="emailLoading"
        :disabled="loading"
        native-type="submit"
        class="pixel-button w-full"
      >
        {{ signUp ? "注册" : "登录" }}
      </el-button>
    </el-form>
    
    <!-- 第三方登录 -->
    <div class="mt-4">
      <p class="mb-3 text-center text-xs text-gray-500">或使用以下方式登录</p>
      <div class="flex justify-center space-x-3">
        <el-button
          :loading="gitHubLoading"
          :disabled="loading"
          @click="gitHubAuth"
          class="pixel-social-btn github"
          circle
          size="large"
        >
          <i-mdi-github class="h-5 w-5" />
        </el-button>
        <el-button
          :loading="googleLoading"
          :disabled="loading"
          @click="googleAuth"
          class="pixel-social-btn google"
          circle
          size="large"
        >
          <i-mdi-google class="h-5 w-5" />
        </el-button>
        <el-button
          :loading="twitterLoading"
          :disabled="loading"
          @click="twitterAuth"
          class="pixel-social-btn twitter"
          circle
          size="large"
        >
          <i-mdi-twitter class="h-5 w-5" />
        </el-button>
        <el-button
          :loading="facebookLoading"
          :disabled="loading"
          @click="facebookAuth"
          class="pixel-social-btn facebook"
          circle
          size="large"
        >
          <i-mdi-facebook class="h-5 w-5" />
        </el-button>
      </div>
    </div>

    <!-- 底部链接 -->
    <slot name="actions" />
  </div>
</template>

<style scoped>
/* 像素风表单容器 */
.pixel-auth-form {
  font-family: 'Courier New', monospace;
}

/* 像素风标题 */
.pixel-title {
  position: relative;
  color: #000;
  text-shadow: 
    2px 2px 0 #fff,
    -2px -2px 0 #fff,
    2px -2px 0 #fff,
    -2px 2px 0 #fff;
}

@media (prefers-color-scheme: dark) {
  .pixel-title {
    color: #fff;
    text-shadow: 
      2px 2px 0 #000,
      -2px -2px 0 #000,
      2px -2px 0 #000,
      -2px 2px 0 #000;
  }
}

/* 像素风表单项 */
.pixel-form-item {
  margin-bottom: 16px !important;
}

/* 像素风输入框 */
:deep(.pixel-input .el-input__wrapper) {
  border: 3px solid #000 !important;
  border-radius: 0 !important;
  box-shadow: 
    inset -3px -3px 0 rgba(0, 0, 0, 0.1),
    3px 3px 0 rgba(0, 0, 0, 0.2) !important;
  background-color: #fff !important;
  padding: 8px 12px !important;
}

:deep(.pixel-input .el-input__wrapper:hover) {
  box-shadow: 
    inset -3px -3px 0 rgba(0, 0, 0, 0.15),
    3px 3px 0 rgba(0, 0, 0, 0.3) !important;
}

:deep(.pixel-input .el-input__wrapper.is-focus) {
  box-shadow: 
    inset -3px -3px 0 rgba(0, 0, 0, 0.2),
    3px 3px 0 #409eff !important;
}

/* 暗色模式输入框 */
@media (prefers-color-scheme: dark) {
  :deep(.pixel-input .el-input__wrapper) {
    background-color: #1a1a2e !important;
    border-color: #fff !important;
  }
  
  :deep(.pixel-input .el-input__inner) {
    color: #fff !important;
  }
}

/* 像素风按钮 */
:deep(.pixel-button) {
  border: 3px solid #000 !important;
  border-radius: 0 !important;
  box-shadow: 
    inset -3px -3px 0 rgba(0, 0, 0, 0.2),
    3px 3px 0 rgba(0, 0, 0, 0.3) !important;
  font-weight: bold !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
  transition: all 0.1s !important;
}

:deep(.pixel-button:hover:not(:disabled)) {
  transform: translate(-2px, -2px) !important;
  box-shadow: 
    inset -3px -3px 0 rgba(0, 0, 0, 0.2),
    5px 5px 0 rgba(0, 0, 0, 0.3) !important;
}

:deep(.pixel-button:active:not(:disabled)) {
  transform: translate(2px, 2px) !important;
  box-shadow: 
    inset 3px 3px 0 rgba(0, 0, 0, 0.2),
    1px 1px 0 rgba(0, 0, 0, 0.3) !important;
}

/* 像素风社交按钮 */
:deep(.pixel-social-btn) {
  border: 3px solid #000 !important;
  border-radius: 0 !important;
  box-shadow: 
    inset -2px -2px 0 rgba(0, 0, 0, 0.2),
    2px 2px 0 rgba(0, 0, 0, 0.3) !important;
  transition: all 0.1s !important;
}

:deep(.pixel-social-btn:hover:not(:disabled)) {
  transform: translate(-2px, -2px) !important;
  box-shadow: 
    inset -2px -2px 0 rgba(0, 0, 0, 0.2),
    4px 4px 0 rgba(0, 0, 0, 0.3) !important;
}

:deep(.pixel-social-btn:active:not(:disabled)) {
  transform: translate(2px, 2px) !important;
  box-shadow: 
    inset 2px 2px 0 rgba(0, 0, 0, 0.2),
    1px 1px 0 rgba(0, 0, 0, 0.3) !important;
}

/* GitHub 按钮颜色 */
:deep(.pixel-social-btn.github) {
  background-color: #333 !important;
  color: #fff !important;
}

/* Google 按钮颜色 */
:deep(.pixel-social-btn.google) {
  background-color: #ea4335 !important;
  color: #fff !important;
}

/* Twitter 按钮颜色 */
:deep(.pixel-social-btn.twitter) {
  background-color: #1da1f2 !important;
  color: #fff !important;
}

/* Facebook 按钮颜色 */
:deep(.pixel-social-btn.facebook) {
  background-color: #425f9c !important;
  color: #fff !important;
}

/* 像素风链接 */
.pixel-link {
  color: #409eff;
  position: relative;
  display: inline-block;
}

.pixel-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #409eff;
  transform: scaleX(0);
  transition: transform 0.2s;
}

.pixel-link:hover::after {
  transform: scaleX(1);
}

@media (prefers-color-scheme: dark) {
  .pixel-link {
    color: #66b1ff;
  }
  
  .pixel-link::after {
    background: #66b1ff;
  }
}
</style>
