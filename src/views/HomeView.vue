<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "@/services/supabase";

const user = ref<any>(null);

onMounted(async () => {
  // Supabase v2: 使用 getUser() 获取用户信息
  const { data, error } = await supabase.auth.getUser();
  
  if (data?.user) {
    user.value = data.user;
  } else {
    console.error('获取用户信息失败:', error);
  }
});
</script>

<template>
  <h1 class="text-3xl font-medium">Home</h1>
  <pre>{{ user }}</pre>
</template>