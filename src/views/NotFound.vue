<script lang="ts" setup>
import { useAuthStore } from "@/stores/auth";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const { supabase } = useAuthStore();
const router = useRouter();

const reRoute = ref({
  to: "/signin",
  text: "Sign In",
});

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    reRoute.value = {
      to: "/",
      text: "Go Home",
    };
  }
});
</script>
<template>
  <div class="self-center text-xl font-medium mb-4">404 - Page not found</div>
  <router-link :to="reRoute.to" class="self-center">{{
    reRoute.text
  }}</router-link>
</template>
