<template>
  <el-card class="profile-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="card-title">👤 用户资料</span>
        <el-button 
          v-if="!editMode" 
          type="primary" 
          size="small" 
          @click="editMode = true"
          :icon="Edit"
        >
          编辑
        </el-button>
      </div>
    </template>

    <!-- 查看模式 -->
    <div v-if="!editMode" class="profile-view" v-loading="loading">
      <div class="profile-avatar">
        <el-avatar :size="60" :src="avatarUrl">
          <el-icon :size="30"><UserFilled /></el-icon>
        </el-avatar>
      </div>
      
      <div class="profile-info">
        <div class="info-item">
          <span class="label">昵称：</span>
          <span class="value">{{ profile?.full_name || '未设置' }}</span>
        </div>
        <div class="info-item">
          <span class="label">ID：</span>
          <span class="value">{{ profile?.id?.slice(0, 8) + '...' || '未登录' }}</span>
        </div>
        <div class="info-item">
          <span class="label">邮箱：</span>
          <span class="value text-small">{{ profile?.email || '未设置' }}</span>
        </div>
        <div class="info-item">
          <span class="label">简介：</span>
          <span class="value text-small">{{ profile?.bio || '暂无简介' }}</span>
        </div>
      </div>
    </div>

    <!-- 编辑模式 -->
    <el-form 
      v-else
      class="profile-form"
      label-width="80px"
      @submit.prevent="handleSave"
    >
      <el-form-item label="昵称">
        <el-input 
          v-model="formData.full_name" 
          placeholder="请输入昵称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="邮箱">
        <el-input 
          v-model="formData.email" 
          type="email"
          placeholder="请输入邮箱"
          disabled
        />
      </el-form-item>
      
      <el-form-item label="简介">
        <el-input 
          v-model="formData.bio" 
          type="textarea"
          placeholder="写一段简短的个人简介..."
          :rows="3"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存
        </el-button>
        <el-button @click="handleCancel">
          取消
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Edit, UserFilled } from '@element-plus/icons-vue';
import { useUserProfile } from '@/views/records/composables/useUserProfile';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  userId: string;
}>();

const { profile, loading, loadProfile, updateProfile } = useUserProfile();

const editMode = ref(false);
const saving = ref(false);
const avatarUrl = ref('');

const formData = ref({
  full_name: '',
  email: '',
  bio: ''
});

// 加载用户资料
onMounted(async () => {
  if (props.userId) {
    await loadProfile(props.userId);
    if (profile.value) {
      formData.value.full_name = profile.value.full_name || '';
      formData.value.email = profile.value.email || '';
      formData.value.bio = profile.value.bio || '';
    }
  }
});

// 监听 userId 变化
watch(() => props.userId, async (newUserId) => {
  if (newUserId) {
    await loadProfile(newUserId);
    if (profile.value) {
      formData.value.full_name = profile.value.full_name || '';
      formData.value.email = profile.value.email || '';
      formData.value.bio = profile.value.bio || '';
    }
  }
});

// 保存修改
const handleSave = async () => {
  if (!formData.value.full_name.trim()) {
    ElMessage.warning('请输入昵称');
    return;
  }

  saving.value = true;
  try {
    await updateProfile(props.userId, {
      full_name: formData.value.full_name.trim(),
      bio: formData.value.bio.trim()
    });
    ElMessage.success('保存成功');
    editMode.value = false;
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  } finally {
    saving.value = false;
  }
};

// 取消编辑
const handleCancel = () => {
  if (profile.value) {
    formData.value.full_name = profile.value.full_name || '';
    formData.value.email = profile.value.email || '';
    formData.value.bio = profile.value.bio || '';
  }
  editMode.value = false;
};
</script>

<style scoped>
.profile-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px !important;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
}

.profile-view {
  text-align: center;
  padding: 15px 0;
}

.profile-avatar {
  margin-bottom: 12px;
}

.profile-info {
  text-align: left;
  padding: 0 10px;
}

.info-item {
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
}

.info-item .label {
  font-weight: 600;
  color: #606266;
  min-width: 50px;
  flex-shrink: 0;
  font-size: 13px;
}

.info-item .value {
  color: #303133;
  word-break: break-all;
  font-size: 13px;
}

.info-item .text-small {
  font-size: 12px;
}

.profile-form {
  padding: 10px 0;
}

:deep(.el-form-item) {
  margin-bottom: 12px;
}

:deep(.el-form-item__label) {
  font-size: 13px;
}
</style>