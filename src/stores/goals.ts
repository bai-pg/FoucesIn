import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/services/supabase';
import type { LearningGoal } from '@/views/records/types';

/**
 * 学习目标 Store
 * 管理目标状态和进度数据,实现跨组件实时同步
 */
export const useGoalsStore = defineStore('goals', () => {
  // 状态
  const currentGoal = ref<LearningGoal | null>(null);
  const studyRecordsMinutes = ref(0);
  const pomodoroMinutes = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 缓存配置
  const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

  interface GoalCache {
    timestamp: number;
    goal: LearningGoal | null;
    studyMinutes: number;
    pomodoroMinutes: number;
  }

  /**
   * 缓存键名生成
   */
  function getCacheKey(userId: string, goalType: string): string {
    return `goal_${userId}_${goalType}`;
  }

  /**
   * 从缓存读取
   */
  function getCachedData(userId: string, goalType: string): GoalCache | null {
    try {
      const cached = localStorage.getItem(getCacheKey(userId, goalType));
      if (!cached) return null;

      const data: GoalCache = JSON.parse(cached);
      const now = Date.now();

      if (now - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(getCacheKey(userId, goalType));
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  /**
   * 保存到缓存
   */
  function setCachedData(userId: string, goalType: string, goal: LearningGoal | null, studyMin: number, pomoMin: number) {
    try {
      const cacheData: GoalCache = {
        timestamp: Date.now(),
        goal,
        studyMinutes: studyMin,
        pomodoroMinutes: pomoMin,
      };
      localStorage.setItem(getCacheKey(userId, goalType), JSON.stringify(cacheData));
    } catch (err) {
      console.warn('目标缓存保存失败:', err);
    }
  }

  /**
   * 清除缓存
   */
  function clearCache(userId: string, goalType?: string) {
    if (goalType) {
      localStorage.removeItem(getCacheKey(userId, goalType));
    } else {
      ['daily', 'weekly', 'monthly'].forEach(type => {
        localStorage.removeItem(getCacheKey(userId, type));
      });
    }
  }

  // 计算属性
  /**
   * 总完成分钟数(学习记录 + 番茄钟)
   */
  const totalAchieved = computed(() => {
    return studyRecordsMinutes.value + pomodoroMinutes.value;
  });

  /**
   * 完成百分比
   */
  const progressPercent = computed(() => {
    if (!currentGoal.value || currentGoal.value.target_minutes === 0) {
      return 0;
    }
    return Math.min(100, (totalAchieved.value / currentGoal.value.target_minutes) * 100);
  });

  /**
   * 是否已完成目标
   */
  const isGoalCompleted = computed(() => progressPercent.value >= 100);

  /**
   * 剩余分钟数
   */
  const remainingMinutes = computed(() => {
    if (!currentGoal.value) return 0;
    return Math.max(0, currentGoal.value.target_minutes - totalAchieved.value);
  });

  /**
   * 是否有目标
   */
  const hasGoal = computed(() => !!currentGoal.value);

  /**
   * 加载目标及进度数据
   * @param userId 用户ID
   * @param goalType 目标类型
   */
  async function fetchGoalWithProgress(userId: string, goalType: 'daily' | 'weekly' | 'monthly' = 'weekly') {
    loading.value = true;
    error.value = null;

    try {
      // 尝试从缓存加载
      const cached = getCachedData(userId, goalType);
      if (cached) {
        currentGoal.value = cached.goal;
        studyRecordsMinutes.value = cached.studyMinutes;
        pomodoroMinutes.value = cached.pomodoroMinutes;
        loading.value = false;
        return currentGoal.value;
      }

      // 获取日期范围
      const { startDate, endDate } = calculateDateRange(goalType);
      const today = new Date().toISOString().slice(0, 10);

      // 1. 查询当前目标
      const { data: goal, error: goalError } = await supabase
        .from('learning_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_type', goalType)
        .lte('start_date', today)
        .gte('end_date', today)
        .maybeSingle();

      if (goalError) throw goalError;

      currentGoal.value = goal;

      // 2. 查询学习记录
      let studyMinutes = 0;
      if (goal) {
        const { data: records, error: recordsError } = await supabase
          .from('study_records')
          .select('duration_minutes')
          .eq('user_id', userId)
          .gte('date', goal.start_date)
          .lte('date', goal.end_date);

        if (recordsError) throw recordsError;

        studyMinutes = records?.reduce((sum: number, r: { duration_minutes: number }) => sum + r.duration_minutes, 0) || 0;
      }
      studyRecordsMinutes.value = studyMinutes;

      // 3. 查询番茄钟数据
      let pomoMinutes = 0;
      if (goal) {
        const { data: sessions, error: sessionsError } = await supabase
          .from('pomodoro_sessions')
          .select('duration_minutes')
          .eq('user_id', userId)
          .gte('end_time', goal.start_date)
          .lte('end_time', goal.end_date + 'T23:59:59');

        if (!sessionsError) {
          pomodoroMinutes.value = sessions?.reduce((sum: number, s: { duration_minutes: number }) => sum + s.duration_minutes, 0) || 0;
        }
      }
      pomodoroMinutes.value = pomoMinutes;

      // 保存到缓存
      setCachedData(userId, goalType, currentGoal.value, studyMinutes, pomoMinutes);

      return currentGoal.value;
    } catch (err: any) {
      error.value = err.message;
      console.error('加载目标失败:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 仅刷新进度数据(不重新加载目标)
   * 用于学习记录或番茄钟更新后调用
   */
  async function refreshProgress(userId: string) {
    if (!currentGoal.value) return;

    try {
      const goalType = currentGoal.value.goal_type;

      // 刷新学习记录
      const { data: records, error: recordsError } = await supabase
        .from('study_records')
        .select('duration_minutes')
        .eq('user_id', userId)
        .gte('date', currentGoal.value.start_date)
        .lte('date', currentGoal.value.end_date);

      if (!recordsError) {
        studyRecordsMinutes.value = records?.reduce((sum: number, r: { duration_minutes: number }) => sum + r.duration_minutes, 0) || 0;
      }

      // 刷新番茄钟数据
      const { data: sessions, error: sessionsError } = await supabase
        .from('pomodoro_sessions')
        .select('duration_minutes')
        .eq('user_id', userId)
        .gte('end_time', currentGoal.value.start_date)
        .lte('end_time', currentGoal.value.end_date + 'T23:59:59');

      if (!sessionsError) {
        pomodoroMinutes.value = sessions?.reduce((sum: number, s: { duration_minutes: number }) => sum + s.duration_minutes, 0) || 0;
      }

      // 更新缓存
      setCachedData(userId, goalType, currentGoal.value, studyRecordsMinutes.value, pomodoroMinutes.value);
    } catch (err) {
      console.error('刷新进度失败:', err);
    }
  }

  /**
   * 保存目标
   */
  async function saveGoal(userId: string, goalType: 'daily' | 'weekly' | 'monthly', targetMinutes: number) {
    loading.value = true;
    error.value = null;

    try {
      const { startDate, endDate } = calculateDateRange(goalType);

      const { data, error: upsertError } = await supabase
        .from('learning_goals')
        .upsert({
          user_id: userId,
          goal_type: goalType,
          target_minutes: targetMinutes,
          start_date: startDate,
          end_date: endDate,
        }, {
          onConflict: 'user_id,goal_type,start_date'
        })
        .select()
        .single();

      if (upsertError) throw upsertError;

      currentGoal.value = data;

      // 清除缓存并重新加载进度
      clearCache(userId, goalType);
      await refreshProgress(userId);

      return data;
    } catch (err: any) {
      error.value = err.message;
      console.error('保存目标失败:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 删除目标
   */
  async function deleteGoal(userId: string) {
    if (!currentGoal.value) return;

    loading.value = true;
    error.value = null;

    try {
      const goalType = currentGoal.value.goal_type; // 先保存 goalType

      const { error: deleteError } = await supabase
        .from('learning_goals')
        .delete()
        .eq('id', currentGoal.value.id);

      if (deleteError) throw deleteError;

      // 清空状态
      currentGoal.value = null;
      studyRecordsMinutes.value = 0;
      pomodoroMinutes.value = 0;

      // 清除缓存
      clearCache(userId, goalType);
    } catch (err: any) {
      error.value = err.message;
      console.error('删除目标失败:', err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 计算日期范围
   */
  function calculateDateRange(goalType: 'daily' | 'weekly' | 'monthly') {
    const now = new Date();
    let startDate: string;
    let endDate: string;

    if (goalType === 'daily') {
      startDate = endDate = now.toISOString().slice(0, 10);
    } else if (goalType === 'weekly') {
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diff);
      startDate = monday.toISOString().slice(0, 10);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      endDate = sunday.toISOString().slice(0, 10);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    }

    return { startDate, endDate };
  }

  return {
    // 状态
    currentGoal,
    studyRecordsMinutes,
    pomodoroMinutes,
    loading,
    error,
    // 计算属性
    totalAchieved,
    progressPercent,
    isGoalCompleted,
    remainingMinutes,
    hasGoal,
    // 方法
    fetchGoalWithProgress,
    refreshProgress,
    saveGoal,
    deleteGoal,
    clearCache,
  };
});