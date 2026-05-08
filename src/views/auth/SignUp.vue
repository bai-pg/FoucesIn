<script lang="ts" setup></script>
<template>
  <AuthForm
    :sign-up="true"
    title="欢迎加入"
    subtitle="我们需要您的一些信息"
    email-placeholder="请输入邮箱"
    password-placeholder="请设置密码"
  >
    <template v-slot:actions>
      <div class="mt-6 text-center">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          已有账号？
          <router-link to="/signin" class="font-bold text-blue-600 hover:underline dark:text-blue-400"
            >立即登录</router-link
          >
        </span>
      </div>
    </template>
  </AuthForm>
</template>
