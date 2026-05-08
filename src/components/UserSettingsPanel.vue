<template>
  <el-dialog
    v-model="visible"
    title="⚙️ 用户设置"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- 个人资料标签页 -->
      <el-tab-pane label="👤 个人资料" name="profile">
        <div v-loading="profileLoading" class="profile-section">
          <!-- 查看模式 -->
          <div v-if="!editMode" class="profile-view">
            <div class="profile-header">
              <div class="avatar-container">
                <el-avatar :size="80" :src="avatarUrl">
                  <el-icon :size="40"><UserFilled /></el-icon>
                </el-avatar>
                <el-button 
                  class="avatar-edit-btn"
                  size="small"
                  circle
                  @click="triggerAvatarUpload"
                >
                  <el-icon><Camera /></el-icon>
                </el-button>
                <input 
                  ref="avatarInput"
                  type="file" 
                  accept="image/*"
                  style="display: none"
                  @change="handleAvatarChange"
                />
              </div>
              <div class="header-actions">
                <el-text type="info" size="small">
                  点击头像可更换
                </el-text>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="editMode = true"
                  :icon="Edit"
                  class="edit-btn"
                >
                  编辑资料
                </el-button>
              </div>
            </div>
            
            <el-descriptions :column="1" border class="profile-info">
              <el-descriptions-item label="昵称">
                {{ profile?.full_name || '未设置' }}
              </el-descriptions-item>
              <el-descriptions-item label="用户ID">
                <el-text type="info" size="small">
                  {{ profile?.id?.slice(0, 8) + '...' || '未登录' }}
                </el-text>
              </el-descriptions-item>
              <el-descriptions-item label="邮箱">
                {{ profile?.email || '未设置' }}
              </el-descriptions-item>
              <el-descriptions-item label="简介">
                {{ profile?.bio || '暂无简介' }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 编辑模式 -->
          <el-form 
            v-else
            class="profile-form"
            label-width="80px"
            @submit.prevent="handleSaveProfile"
          >
            <!-- 头像上传区域（编辑模式下也可修改） -->
            <el-form-item label="头像">
              <div class="avatar-upload-area">
                <el-avatar :size="60" :src="avatarUrl">
                  <el-icon :size="30"><UserFilled /></el-icon>
                </el-avatar>
                <el-button 
                  size="small"
                  @click="triggerAvatarUpload"
                  :loading="uploadingAvatar"
                >
                  {{ avatarUrl ? '更换头像' : '上传头像' }}
                </el-button>
                <input 
                  ref="avatarInputEdit"
                  type="file" 
                  accept="image/*"
                  style="display: none"
                  @change="handleAvatarChange"
                />
              </div>
              <el-text type="info" size="small">
                支持 JPG、PNG 格式，大小不超过 2MB
              </el-text>
            </el-form-item>

            <el-form-item label="昵称">
              <el-input 
                v-model="profileForm.full_name" 
                placeholder="请输入昵称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item label="邮箱">
              <el-input 
                v-model="profileForm.email" 
                type="email"
                disabled
              />
            </el-form-item>
            
            <el-form-item label="简介">
              <el-input 
                v-model="profileForm.bio" 
                type="textarea"
                placeholder="写一段简短的个人简介..."
                :rows="3"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSaveProfile" :loading="saving">
                保存
              </el-button>
              <el-button @click="handleCancelEdit">
                取消
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 偏好设置标签页 -->
      <el-tab-pane label="🎨 偏好设置" name="preferences">
        <div v-loading="preferencesLoading" class="preferences-section">
          <el-form 
            label-width="120px" 
            class="preferences-form"
          >
            <!-- 主题设置 -->
            <el-form-item label="主题">
              <el-switch
                v-model="preferencesStore.preferences.theme"
                active-value="dark"
                inactive-value="light"
                active-text="暗色"
                inactive-text="亮色"
                @change="handleThemeChange"
              />
            </el-form-item>

            <!-- 邮件通知 -->
            <el-form-item label="邮件通知">
              <el-switch
                v-model="preferencesStore.preferences.email_notifications"
                active-text="开启"
                inactive-text="关闭"
                @change="handleNotificationChange"
              />
            </el-form-item>

            <!-- 默认视图 -->
            <el-form-item label="默认视图">
              <el-select
                v-model="preferencesStore.preferences.default_view"
                placeholder="选择默认视图"
                @change="handleViewChange"
              >
                <el-option label="仪表盘" value="dashboard" />
                <el-option label="学习记录" value="records" />
                <el-option label="工作流" value="workflow" />
              </el-select>
            </el-form-item>

            <el-divider content-position="left">番茄钟设置</el-divider>

            <!-- 番茄钟工作时长 -->
            <el-form-item label="专注时长">
              <el-input-number
                v-model="preferencesStore.preferences.pomodoro_work_duration"
                :min="5"
                :max="60"
                :step="5"
                @change="handlePomodoroWorkDurationChange"
              >
                <template #suffix>
                  <span>分钟</span>
                </template>
              </el-input-number>
            </el-form-item>

            <!-- 番茄钟休息时长 -->
            <el-form-item label="休息时长">
              <el-input-number
                v-model="preferencesStore.preferences.pomodoro_rest_duration"
                :min="1"
                :max="30"
                :step="1"
                @change="handlePomodoroRestDurationChange"
              >
                <template #suffix>
                  <span>分钟</span>
                </template>
              </el-input-number>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Edit, UserFilled, Camera } from '@element-plus/icons-vue';
import { useUserProfile } from '@/views/records/composables/useUserProfile';
import { usePreferencesStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

// 控制弹窗显示
const visible = ref(props.modelValue);
watch(() => props.modelValue, (val) => {
  visible.value = val;
});
watch(visible, (val) => {
  emit('update:modelValue', val);
});

// 标签页切换
const activeTab = ref('profile');

// 用户资料相关
const { profile, loading: profileLoading, loadProfile, updateProfile, uploadAvatar, deleteOldAvatar } = useUserProfile();
const editMode = ref(false);
const saving = ref(false);
const uploadingAvatar = ref(false);
const avatarUrl = ref('');
const authStore = useAuthStore();

// 文件输入引用
const avatarInput = ref<HTMLInputElement | null>(null);
const avatarInputEdit = ref<HTMLInputElement | null>(null);

const profileForm = ref({
  full_name: '',
  email: '',
  bio: ''
});

// 偏好设置相关
const preferencesStore = usePreferencesStore();
const preferencesLoading = ref(false);

// 加载用户数据
watch(visible, async (isVisible) => {
  if (isVisible) {
    const { data } = await authStore.supabase.auth.getUser();
    if (data?.user) {
      // 加载用户资料
      await loadProfile(data.user.id);
      if (profile.value) {
        profileForm.value.full_name = profile.value.full_name || '';
        profileForm.value.email = profile.value.email || '';
        profileForm.value.bio = profile.value.bio || '';
        avatarUrl.value = profile.value.avatar_url || '';
      }
      
      // 加载偏好设置
      preferencesLoading.value = true;
      try {
        await preferencesStore.loadPreferences(data.user.id);
      } finally {
        preferencesLoading.value = false;
      }
    }
  }
});

/**
 * 触发头像上传
 */
const triggerAvatarUpload = () => {
  const input = editMode.value ? avatarInputEdit.value : avatarInput.value;
  if (input) {
    input.click();
  }
};

/**
 * 处理头像文件选择
 */
const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  const { data } = await authStore.supabase.auth.getUser();
  if (!data?.user) {
    ElMessage.error('请先登录');
    return;
  }

  uploadingAvatar.value = true;
  try {
    // 删除旧头像
    if (avatarUrl.value) {
      await deleteOldAvatar(avatarUrl.value);
    }

    // 上传新头像
    const newAvatarUrl = await uploadAvatar(data.user.id, file);
    
    // 更新数据库中的头像URL
    await updateProfile(data.user.id, { avatar_url: newAvatarUrl });
    
    // 更新本地显示
    avatarUrl.value = newAvatarUrl;
    
    ElMessage.success('头像上传成功');
  } catch (error: any) {
    console.error('头像上传失败:', error);
    ElMessage.error(error.message || '头像上传失败');
  } finally {
    uploadingAvatar.value = false;
    // 清空文件输入，允许重复选择同一文件
    if (target) {
      target.value = '';
    }
  }
};

// 保存个人资料
const handleSaveProfile = async () => {
  if (!profileForm.value.full_name.trim()) {
    ElMessage.warning('请输入昵称');
    return;
  }

  const { data } = await authStore.supabase.auth.getUser();
  if (!data?.user) return;

  saving.value = true;
  try {
    await updateProfile(data.user.id, {
      full_name: profileForm.value.full_name.trim(),
      bio: profileForm.value.bio.trim()
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
const handleCancelEdit = () => {
  if (profile.value) {
    profileForm.value.full_name = profile.value.full_name || '';
    profileForm.value.email = profile.value.email || '';
    profileForm.value.bio = profile.value.bio || '';
    avatarUrl.value = profile.value.avatar_url || '';
  }
  editMode.value = false;
};

// 偏好设置处理函数
async function handleThemeChange(value: 'light' | 'dark') {
  try {
    await preferencesStore.updatePreference('theme', value);
    ElMessage.success('主题已切换');
  } catch (error) {
    console.error('切换主题失败:', error);
    ElMessage.error('切换失败，请重试');
  }
}

async function handleNotificationChange(value: boolean) {
  try {
    await preferencesStore.updatePreference('email_notifications', value);
    ElMessage.success('通知设置已更新');
  } catch (error) {
    console.error('更新通知设置失败:', error);
    ElMessage.error('更新失败，请重试');
  }
}

async function handleViewChange(value: string) {
  try {
    await preferencesStore.updatePreference('default_view', value);
    ElMessage.success('默认视图已更新');
  } catch (error) {
    console.error('更新默认视图失败:', error);
    ElMessage.error('更新失败，请重试');
  }
}

async function handlePomodoroWorkDurationChange(value: number) {
  try {
    await preferencesStore.updatePreference('pomodoro_work_duration', value);
    ElMessage.success('专注时长已更新');
  } catch (error) {
    console.error('更新专注时长失败:', error);
    ElMessage.error('更新失败，请重试');
  }
}

async function handlePomodoroRestDurationChange(value: number) {
  try {
    await preferencesStore.updatePreference('pomodoro_rest_duration', value);
    ElMessage.success('休息时长已更新');
  } catch (error) {
    console.error('更新休息时长失败:', error);
    ElMessage.error('更新失败，请重试');
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false;
  editMode.value = false;
};
</script>

<style scoped>
.settings-tabs {
  min-height: 400px;
}

.profile-section,
.preferences-section {
  padding: 10px 0;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.avatar-edit-btn:hover {
  background: white;
  color: #764ba2;
}

.header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border: none;
}

.edit-btn:hover {
  background: rgba(255, 255, 255, 1);
}

.profile-view {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.profile-info {
  margin-top: 15px;
}

.profile-form {
  padding: 15px 0;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.avatar-upload-area {
  display: flex;
  align-items: center;
  gap: 15px;
}

.preferences-form {
  padding: 15px 0;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
  width: 80px;
}

:deep(.el-divider__text) {
  font-size: 14px;
  color: #606266;
}
</style>