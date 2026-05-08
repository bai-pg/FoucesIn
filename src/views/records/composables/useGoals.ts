import { ref, computed } from 'vue';
import { supabase } from '@/services/supabase';
import type { LearningGoal } from '../types';

/**
 * 学习目标管理组合式函数
 * 负责目标的增删改查和进度追踪
 */
export function useGoals() {
  const currentGoal = ref<LearningGoal | null>(null);
  const achieved = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 数据缓存
  const cacheKey = (userId: string, goalType: string) => `goal_${userId}_${goalType}`;
  const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  interface GoalCache {
    timestamp: number;
    goal: LearningGoal | null;
    achieved: number;
  }

  /**
   * 从缓存获取目标数据
   */
  function getCachedGoal(userId: string, goalType: string): GoalCache | null {
    try {
      const cached = localStorage.getItem(cacheKey(userId, goalType));
      if (!cached) return null;
      
      const data: GoalCache = JSON.parse(cached);
      const now = Date.now();
      
      if (now - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(cacheKey(userId, goalType));
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  }

  /**
   * 保存目标数据到缓存
   */
  function setCachedGoal(userId: string, goalType: string, goal: LearningGoal | null, achievedMinutes: number) {
    try {
      const cacheData: GoalCache = {
        timestamp: Date.now(),
        goal,
        achieved: achievedMinutes,
      };
      localStorage.setItem(cacheKey(userId, goalType), JSON.stringify(cacheData));
    } catch (error) {
      console.warn('目标缓存保存失败:', error);
    }
  }

  /**
   * 清除目标缓存（在更新或删除后调用）
   */
  function clearGoalCache(userId: string, goalType?: string) {
    if (goalType) {
      localStorage.removeItem(cacheKey(userId, goalType));
    } else {
      // 清除该用户所有类型的缓存
      ['daily', 'weekly', 'monthly'].forEach(type => {
        localStorage.removeItem(cacheKey(userId, type));
      });
    }
  }

  /**
   * 获取当前周期内的目标
   * @param userId 用户ID
   * @param goalType 目标类型（daily/weekly/monthly）
   */
  async function fetchCurrentGoal(userId: string, goalType: 'daily' | 'weekly' | 'monthly' = 'weekly') {
    loading.value = true;
    error.value = null;

    try {
      // 尝试从缓存加载
      const cached = getCachedGoal(userId, goalType);
      if (cached) {
        currentGoal.value = cached.goal;
        achieved.value = cached.achieved;
        loading.value = false;
        return currentGoal.value;
      }

      const today = new Date().toISOString().slice(0, 10);
      
      const { data, error: fetchError } = await supabase
        .from('learning_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_type', goalType)
        .lte('start_date', today)
        .gte('end_date', today)
        .maybeSingle();

      // Supabase v1: maybeSingle() 返回 null 时不会有错误
      if (fetchError) throw fetchError;

      currentGoal.value = data;

      // 如果存在目标，计算已完成的学习时长
      if (data) {
        const { data: records, error: recordsError } = await supabase
          .from('study_records')
          .select('duration_minutes')
          .eq('user_id', userId)
          .gte('date', data.start_date)
          .lte('date', data.end_date);

        if (recordsError) throw recordsError;

        achieved.value = records?.reduce((sum: number, r: { duration_minutes: number }) => sum + r.duration_minutes, 0) || 0;
      } else {
        achieved.value = 0;
      }

      // 保存到缓存
      setCachedGoal(userId, goalType, currentGoal.value, achieved.value);

      return currentGoal.value;
    } catch (err: any) {
      error.value = err.message;
      console.error('获取目标失败:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 创建或更新目标
   * @param goal 目标数据
   */
  async function upsertGoal(goal: Omit<LearningGoal, 'id' | 'created_at' | 'updated_at'>) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: upsertError } = await supabase
        .from('learning_goals')
        .upsert(goal, { 
          onConflict: 'user_id,goal_type,start_date' 
        })
        .select()
        .single();

      if (upsertError) throw upsertError;

      currentGoal.value = data;
      
      // 清除缓存，下次获取时会重新查询
      clearGoalCache(goal.user_id, goal.goal_type);

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
   * @param goalId 目标ID
   */
  async function deleteGoal(goalId: number) {
    loading.value = true;
    error.value = null;

    try {
      // 先获取当前目标以清除对应的缓存
      const userId = currentGoal.value?.user_id;
      const goalType = currentGoal.value?.goal_type;

      const { error: deleteError } = await supabase
        .from('learning_goals')
        .delete()
        .eq('id', goalId);

      if (deleteError) throw deleteError;

      // 如果删除的是当前目标，清空状态
      if (currentGoal.value?.id === goalId) {
        currentGoal.value = null;
        achieved.value = 0;
      }

      // 清除缓存
      if (userId && goalType) {
        clearGoalCache(userId, goalType);
      }
    } catch (err: any) {
      error.value = err.message;
      console.error('删除目标失败:', err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 计算目标完成百分比
   */
  const progressPercent = computed(() => {
    if (!currentGoal.value || currentGoal.value.target_minutes === 0) {
      return 0;
    }
    // 注意：achieved 值由 GoalManager 组件传入的 totalAchieved 计算
    // 这里保持原有的计算逻辑，但会在组件层覆盖
    return Math.min(100, (achieved.value / currentGoal.value.target_minutes) * 100);
  });

  /**
   * 判断目标是否已完成
   */
  const isGoalCompleted = computed(() => {
    return progressPercent.value >= 100;
  });

  /**
   * 根据目标类型计算日期范围
   * @param goalType 目标类型
   */
  function calculateDateRange(goalType: 'daily' | 'weekly' | 'monthly') {
    const now = new Date();
    let startDate: string;
    let endDate: string;

    if (goalType === 'daily') {
      startDate = endDate = now.toISOString().slice(0, 10);
    } else if (goalType === 'weekly') {
      // 计算本周一
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diff);
      startDate = monday.toISOString().slice(0, 10);
      
      // 计算本周日
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      endDate = sunday.toISOString().slice(0, 10);
    } else {
      // 本月第一天
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      // 本月最后一天
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    }

    return { startDate, endDate };
  }

  return {
    currentGoal,
    achieved,
    loading,
    error,
    progressPercent,
    isGoalCompleted,
    fetchCurrentGoal,
    upsertGoal,
    deleteGoal,
    calculateDateRange,
    clearGoalCache, // 导出清除缓存方法
  };
}