import { ref } from 'vue';
import { supabase } from '@/services/supabase';
import type { UserPreferences } from '../types';

/**
 * 用户偏好设置组合式函数
 * 负责加载、保存用户的个性化配置
 */
export function useUserPreferences() {
  const preferences = ref<UserPreferences>({
    user_id: '',
    theme: 'light',
    email_notifications: true,
    default_view: 'dashboard',
    pomodoro_work_duration: 25,
    pomodoro_rest_duration: 5,
  });

  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * 加载用户偏好设置
   * @param userId 用户ID
   */
  async function loadPreferences(userId: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Supabase v1: maybeSingle() 返回 null 时不会有错误
      if (fetchError) throw fetchError;

      if (data) {
        preferences.value = data;
        applyTheme(data.theme);
      } else {
        // 如果没有偏好设置，创建默认值
        await initializeDefaultPreferences(userId);
      }

      return preferences.value;
    } catch (err: any) {
      error.value = err.message;
      console.error('加载偏好设置失败:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 初始化默认偏好设置
   */
  async function initializeDefaultPreferences(userId: string) {
    const defaultPrefs: UserPreferences = {
      user_id: userId,
      theme: 'light',
      email_notifications: true,
      default_view: 'dashboard',
      pomodoro_work_duration: 25,
      pomodoro_rest_duration: 5,
    };

    const { data, error: upsertError } = await supabase
      .from('user_preferences')
      .upsert(defaultPrefs)
      .select()
      .single();

    if (upsertError) {
      console.error('初始化偏好设置失败:', upsertError);
      return null;
    }

    preferences.value = data;
    applyTheme(data.theme);
    return data;
  }

  /**
   * 更新单个偏好设置
   * @param key 偏好键名
   * @param value 偏好值
   */
  async function updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) {
    loading.value = true;
    error.value = null;

    try {
      // 先更新本地状态
      (preferences.value as any)[key] = value;

      // 如果是主题变更,立即应用
      if (key === 'theme') {
        applyTheme(value as 'light' | 'dark');
      }

      // 同步到数据库
      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({ [key]: value, updated_at: new Date().toISOString() })
        .eq('user_id', preferences.value.user_id);

      if (updateError) throw updateError;

      console.log(`偏好设置已更新: ${key} = ${value}`);
    } catch (err: any) {
      error.value = err.message;
      console.error('更新偏好设置失败:', err);
      // 回滚本地状态
      await loadPreferences(preferences.value.user_id);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 批量更新偏好设置
   */
  async function updatePreferences(updates: Partial<UserPreferences>) {
    loading.value = true;
    error.value = null;

    try {
      // 更新本地状态
      Object.assign(preferences.value, updates);

      // 如果包含主题变更，立即应用
      if (updates.theme) {
        applyTheme(updates.theme);
      }

      // 同步到数据库
      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', preferences.value.user_id);

      if (updateError) throw updateError;

      console.log('偏好设置已批量更新');
    } catch (err: any) {
      error.value = err.message;
      console.error('批量更新偏好设置失败:', err);
      // 回滚本地状态
      await loadPreferences(preferences.value.user_id);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 应用主题
   */
  function applyTheme(theme: 'light' | 'dark') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  /**
   * 切换主题
   */
  async function toggleTheme() {
    const newTheme = preferences.value.theme === 'light' ? 'dark' : 'light';
    await updatePreference('theme', newTheme);
  }

  return {
    preferences,
    loading,
    error,
    loadPreferences,
    updatePreference,
    updatePreferences,
    toggleTheme,
    applyTheme,
  };
}
