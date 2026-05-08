<script lang="ts" setup>
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const { supabase } = useAuthStore();

onMounted(async () => {
  // Supabase v2: 使用 getUser() 检查用户
  const { data, error } = await supabase.auth.getUser();
  if (data?.user) {
    console.log("arrived on callback page with an existing user, so going home");
    setTimeout(() => {
      router.push("/");
    }, 0);
  } else {
    console.error("OAuth callback error:", error);
    router.push("/signin");
  }
});
</script>
<template>
  <LoadingIcon class="mx-auto w-16" />
</template>
