import { ref } from 'vue';
import { supabase } from '@/services/supabase';
import type { Profile } from '@/views/records/types';

export function useUserProfile() {
  const profile = ref<Profile | null>(null);
  const loading = ref(false);

  // 加载用户资料
  const loadProfile = async (userId: string) => {
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      profile.value = data;
    } catch (error) {
      console.error('加载用户资料失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 更新用户资料
  const updateProfile = async (userId: string, updates: Partial<Profile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // 更新本地数据
      if (profile.value) {
        profile.value = {
          ...profile.value,
          ...updates
        };
      }
    } catch (error) {
      console.error('更新用户资料失败:', error);
      throw error;
    }
  };

  /**
   * 上传头像到 Supabase Storage
   * @param userId 用户ID
   * @param file 图片文件
   * @returns 头像URL
   */
  const uploadAvatar = async (userId: string, file: File): Promise<string> => {
    try {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        throw new Error('只能上传图片文件');
      }

      // 验证文件大小（限制为 2MB）
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('图片大小不能超过 2MB');
      }

      // 生成唯一文件名
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      // 文件路径格式: {userId}/{timestamp}.{ext}
      // 这样 storage.foldername() 返回的就是 userId
      const filePath = `${userId}/${fileName}`;

      // 上传文件到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 获取公共访问URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('上传头像失败:', error);
      throw error;
    }
  };

  /**
   * 删除旧头像文件
   * @param avatarUrl 头像URL
   */
  const deleteOldAvatar = async (avatarUrl: string) => {
    try {
      if (!avatarUrl) return;

      // 从URL中提取文件路径
      // URL格式: https://xxx.supabase.co/storage/v1/object/public/avatars/{userId}/{timestamp}.{ext}
      const url = new URL(avatarUrl);
      const pathParts = url.pathname.split('/');
      // 找到 'avatars' 后面的部分
      const avatarsIndex = pathParts.indexOf('avatars');
      if (avatarsIndex !== -1 && avatarsIndex < pathParts.length - 1) {
        const filePath = pathParts.slice(avatarsIndex + 1).join('/');
        await supabase.storage
          .from('avatars')
          .remove([filePath]);
      }
    } catch (error) {
      console.warn('删除旧头像失败:', error);
      // 不抛出错误，避免影响主流程
    }
  };

  return {
    profile,
    loading,
    loadProfile,
    updateProfile,
    uploadAvatar,
    deleteOldAvatar
  };
}