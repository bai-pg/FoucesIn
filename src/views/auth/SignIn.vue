<script lang="ts" setup></script>
<template>
  <AuthForm
    :sign-up="false"
    title=""
    subtitle="请输入您的账号信息"
    email-placeholder="请输入邮箱"
    password-placeholder="请输入密码"
  >
    <template v-slot:actions>
      <div class="mt-6 text-center">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          还没有账号？
          <router-link to="/signup" class="font-bold text-blue-600 hover:underline dark:text-blue-400"
            >立即注册</router-link
          >
        </span>
      </div>
    </template>
  </AuthForm>
</template>
