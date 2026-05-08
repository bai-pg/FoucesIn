import { ref, computed, onUnmounted } from 'vue';
// import { supabase } from '@/services/supabase'; // Removed: Handled by component/store layer
// import type { PomodoroStatus } from '../types'; // Removed if not used elsewhere in this file

/**
 * 番茄钟状态
 */
export type TimerStatus = 'idle' | 'running' | 'paused' | 'rest';

/**
 * 番茄钟配置
 */
export interface PomodoroConfig {
  workDuration: number; // 专注时长（秒）
  restDuration: number; // 休息时长（秒）
}

/**
 * 番茄钟管理组合式函数
 * 负责计时器控制、会话记录和学习记录自动创建
 */
export function usePomodoro(userId: string, config?: Partial<PomodoroConfig>) {
  const status = ref<TimerStatus>('idle');
  const timeLeft = ref((config?.workDuration || 25) * 60); // 默认25分钟
  const initialDuration = ref(timeLeft.value);
  const currentSubject = ref('番茄专注');
  
  let interval: number | null = null;

  // 默认配置
  const defaultConfig: PomodoroConfig = {
    workDuration: (config?.workDuration || 25) * 60,
    restDuration: (config?.restDuration || 5) * 60,
  };

  /**
   * 计算显示的分钟和秒数
   */
  const minutes = computed(() => Math.floor(timeLeft.value / 60));
  const seconds = computed(() => timeLeft.value % 60);

  /**
   * 计算进度百分比
   */
  const progress = computed(() => {
    if (initialDuration.value === 0) return 0;
    return ((initialDuration.value - timeLeft.value) / initialDuration.value) * 100;
  });

  /**
   * 格式化显示时间 (MM:SS)
   */
  const formattedTime = computed(() => {
    const m = String(minutes.value).padStart(2, '0');
    const s = String(seconds.value).padStart(2, '0');
    return `${m}:${s}`;
  });

  /**
   * 清除定时器
   */
  function clearTimer() {
    if (interval !== null) {
      clearInterval(interval);
      interval = null;
    }
  }

  /**
   * 开始计时
   * @param durationSeconds 时长（秒），默认为专注时长
   */
  function startTimer(durationSeconds?: number) {
    clearTimer();
    
    const duration = durationSeconds || defaultConfig.workDuration;
    status.value = 'running';
    initialDuration.value = duration;
    timeLeft.value = duration;

    interval = window.setInterval(() => {
      if (timeLeft.value <= 1) {
        clearTimer();
        handleTimerComplete();
      } else {
        timeLeft.value--;
      }
    }, 1000);
  }

  /**
   * 暂停计时
   */
  function pauseTimer() {
    if (status.value === 'running') {
      clearTimer();
      status.value = 'paused';
    }
  }

  /**
   * 继续计时
   */
  function resumeTimer() {
    if (status.value === 'paused') {
      status.value = 'running';
      interval = window.setInterval(() => {
        if (timeLeft.value <= 1) {
          clearTimer();
          handleTimerComplete();
        } else {
          timeLeft.value--;
        }
      }, 1000);
    }
  }

  /**
   * 重置计时器
   */
  function resetTimer() {
    clearTimer();
    status.value = 'idle';
    timeLeft.value = defaultConfig.workDuration;
    initialDuration.value = defaultConfig.workDuration;
  }

  /**
   * 开始休息
   */
  function startRest() {
    clearTimer();
    status.value = 'rest';
    initialDuration.value = defaultConfig.restDuration;
    timeLeft.value = defaultConfig.restDuration;

    interval = window.setInterval(() => {
      if (timeLeft.value <= 1) {
        clearTimer();
        status.value = 'idle';
      } else {
        timeLeft.value--;
      }
    }, 1000);
  }

  /**
   * 处理计时完成
   */
  function handleTimerComplete() {
    if (status.value === 'running') {
      // 专注完成，通知组件层处理记录保存
      completeFocus();
    } else if (status.value === 'rest') {
      // 休息结束
      status.value = 'idle';
    }
  }

  /**
   * 完成专注，返回专注数据供组件层保存
   * @param subject 专注科目
   */
  function completeFocus(subject?: string) {
    const focusSubject = subject || currentSubject.value;
    
    // 计算实际专注时长（分钟）
    const elapsedSeconds = initialDuration.value - timeLeft.value;
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    if (durationMinutes < 1) {
      console.warn('专注时长不足1分钟，不创建记录');
      resetTimer();
      return null;
    }

    // 重置计时器
    resetTimer();

    console.log('番茄钟完成！请组件层处理记录保存');
    
    // 返回必要的数据，由组件层调用 Store 或 API 进行保存
    return {
      subject: focusSubject,
      durationMinutes,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 设置当前专注科目
   */
  function setSubject(subject: string) {
    currentSubject.value = subject;
  }

  /**
   * 更新配置
   */
  function updateConfig(newConfig: Partial<PomodoroConfig>) {
    if (newConfig.workDuration) {
      defaultConfig.workDuration = newConfig.workDuration * 60;
    }
    if (newConfig.restDuration) {
      defaultConfig.restDuration = newConfig.restDuration * 60;
    }
    
    // 如果当前是空闲状态，应用新配置
    if (status.value === 'idle') {
      resetTimer();
    }
  }

  /**
   * 计算已用时长(分钟)
   */
  const elapsedMinutes = computed(() => {
    const elapsedSeconds = initialDuration.value - timeLeft.value;
    return Math.max(0, Math.round(elapsedSeconds / 60));
  });

  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearTimer();
  });

  return {
    status,
    minutes,
    seconds,
    progress,
    formattedTime,
    currentSubject,
    elapsedMinutes,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    startRest,
    completeFocus,
    setSubject,
    updateConfig,
  };
}
