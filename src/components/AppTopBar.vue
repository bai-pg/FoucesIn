<template>
  <header
    class="sticky top-0 z-30 flex items-center justify-between px-3 py-2 sm:p-3 shadow"
  >
    <div class="flex items-center">
      <v-icon-button @click="$emit('update:modelValue', !modelValue)">
        <i-carbon-menu class="h-5 w-5 sm:h-6 sm:w-6" />
      </v-icon-button>
    </div>
    <div class="flex items-center space-x-2 sm:space-x-4">
      <v-icon-button @click="toggleDark()">
        <i-carbon-sun class="h-5 w-5 sm:h-6 sm:w-6 dark:hidden" />
        <i-carbon-moon class="hidden h-5 w-5 sm:h-6 sm:w-6 dark:block" />
      </v-icon-button>
      <v-icon-button @click="showSettings = true">
        <i-carbon-settings class="h-5 w-5 sm:h-6 sm:w-6" />
      </v-icon-button>
    </div>
    
    <!-- 用户设置面板 -->
    <UserSettingsPanel v-model="showSettings" />
  </header>
</template>

<script lang="ts" setup>
import { Ref } from "vue";
import { isDarkKey } from "@/symbols";
import UserSettingsPanel from "./UserSettingsPanel.vue";

/* modelValue here refers to whether or not to show side nav drawer */
defineProps<{
  modelValue: boolean;
}>();

defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const isDark = inject(isDarkKey) as Ref<boolean>;
const toggleDark = useToggle(isDark);

// 控制设置面板显示
const showSettings = ref(false);
</script>
