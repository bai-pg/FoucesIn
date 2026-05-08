import { supabase } from "@/services/supabase";
import type { UserPreferences } from '@/views/records/types';

export const useAuthStore = defineStore("auth", {
  state: () => {
    return { supabase };
  },
});

// 用户偏好设置 Store
export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    preferences: {
      user_id: '',
      theme: 'light',
      email_notifications: true,
      default_view: 'dashboard',
      pomodoro_work_duration: 25,
      pomodoro_rest_duration: 5,
    } as UserPreferences,
    loading: false,
    initialized: false,
  }),

  actions: {
    /**
     * 加载用户偏好设置
     */
    async loadPreferences(userId: string) {
      if (this.initialized && this.preferences.user_id === userId) {
        return this.preferences;
      }

      this.loading = true;

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          this.preferences = data;
          this.applyTheme(data.theme);
        } else {
          // 初始化默认偏好设置
          await this.initializeDefaultPreferences(userId);
        }

        this.initialized = true;
        return this.preferences;
      } catch (err: any) {
        console.error('加载偏好设置失败:', err);
        return null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 初始化默认偏好设置
     */
    async initializeDefaultPreferences(userId: string) {
      const defaultPrefs: UserPreferences = {
        user_id: userId,
        theme: 'light',
        email_notifications: true,
        default_view: 'dashboard',
        pomodoro_work_duration: 25,
        pomodoro_rest_duration: 5,
      };

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(defaultPrefs)
        .select()
        .single();

      if (error) {
        console.error('初始化偏好设置失败:', error);
        return null;
      }

      this.preferences = data;
      this.applyTheme(data.theme);
      return data;
    },

    /**
     * 更新单个偏好设置
     */
    async updatePreference<K extends keyof UserPreferences>(
      key: K,
      value: UserPreferences[K]
    ) {
      // 先更新本地状态（实现即时响应）
      (this.preferences as any)[key] = value;

      // 如果是主题变更，立即应用
      if (key === 'theme') {
        this.applyTheme(value as 'light' | 'dark');
      }

      // 异步同步到数据库
      try {
        const { error } = await supabase
          .from('user_preferences')
          .update({ [key]: value, updated_at: new Date().toISOString() })
          .eq('user_id', this.preferences.user_id);

        if (error) throw error;
      } catch (err: any) {
        console.error('同步偏好设置到数据库失败:', err);
        // 如果同步失败，重新加载以保持一致性
        await this.loadPreferences(this.preferences.user_id);
      }
    },

    /**
     * 批量更新偏好设置
     */
    async updatePreferences(updates: Partial<UserPreferences>) {
      // 先更新本地状态
      Object.assign(this.preferences, updates);

      // 如果包含主题变更，立即应用
      if (updates.theme) {
        this.applyTheme(updates.theme);
      }

      // 异步同步到数据库
      try {
        const { error } = await supabase
          .from('user_preferences')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('user_id', this.preferences.user_id);

        if (error) throw error;
      } catch (err: any) {
        console.error('批量同步偏好设置失败:', err);
        await this.loadPreferences(this.preferences.user_id);
      }
    },

    /**
     * 应用主题
     */
    applyTheme(theme: 'light' | 'dark') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },

    /**
     * 切换主题
     */
    async toggleTheme() {
      const newTheme = this.preferences.theme === 'light' ? 'dark' : 'light';
      await this.updatePreference('theme', newTheme);
    },
  },

  getters: {
    // 获取当前主题
    currentTheme: (state) => state.preferences.theme,
    // 获取番茄钟工作时长
    pomodoroWorkDuration: (state) => state.preferences.pomodoro_work_duration,
    // 获取番茄钟休息时长
    pomodoroRestDuration: (state) => state.preferences.pomodoro_rest_duration,
  },
});