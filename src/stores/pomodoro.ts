import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * 番茄钟状态类型
 */
export type TimerStatus = 'idle' | 'running' | 'paused' | 'rest';

/**
 * 番茄钟 Store
 * 管理番茄钟的全局状态,支持页面切换时保持状态
 */
export const usePomodoroStore = defineStore('pomodoro', () => {
  // 状态
  const status = ref<TimerStatus>('idle');
  const timeLeft = ref(25 * 60); // 剩余时间(秒)
  const initialDuration = ref(25 * 60); // 初始时长(秒)
  const currentSubject = ref('番茄专注');
  const workDuration = ref(25 * 60); // 专注时长(秒)
  const restDuration = ref(5 * 60); // 休息时长(秒)
  
  // 计时器引用
  let interval: number | null = null;

  // 缓存键名
  const STORAGE_KEY = 'pomodoro_state';

  /**
   * 从 localStorage 恢复状态
   */
  function restoreState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const state = JSON.parse(saved);
      
      // 恢复状态
      status.value = state.status || 'idle';
      timeLeft.value = state.timeLeft || (25 * 60);
      initialDuration.value = state.initialDuration || (25 * 60);
      currentSubject.value = state.currentSubject || '番茄专注';
      workDuration.value = state.workDuration || (25 * 60);
      restDuration.value = state.restDuration || (5 * 60);

      // 如果之前是运行状态,恢复为暂停状态(避免后台计时)
      if (status.value === 'running') {
        status.value = 'paused';
        // 注意:不自动恢复计时器,需要用户手动点击"继续"
      }

      console.log('番茄钟状态已恢复:', status.value);
    } catch (err) {
      console.warn('恢复番茄钟状态失败:', err);
    }
  }

  /**
   * 保存状态到 localStorage
   */
  function saveState() {
    try {
      const state = {
        status: status.value,
        timeLeft: timeLeft.value,
        initialDuration: initialDuration.value,
        currentSubject: currentSubject.value,
        workDuration: workDuration.value,
        restDuration: restDuration.value,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('保存番茄钟状态失败:', err);
    }
  }

  /**
   * 清除 localStorage 中的状态
   */
  function clearState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('清除番茄钟状态失败:', err);
    }
  }

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
   * @param durationSeconds 时长(秒),默认为专注时长
   */
  function startTimer(durationSeconds?: number) {
    clearTimer();
    
    const duration = durationSeconds || workDuration.value;
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

    saveState();
  }

  /**
   * 暂停计时
   */
  function pauseTimer() {
    if (status.value === 'running') {
      clearTimer();
      status.value = 'paused';
      saveState();
      console.log('番茄钟已暂停,剩余时间:', timeLeft.value, '秒');
    }
  }

  /**
   * 继续计时
   */
  function resumeTimer() {
    if (status.value === 'paused') {
      // 先清除可能存在的旧定时器
      clearTimer();
      
      status.value = 'running';
      interval = window.setInterval(() => {
        if (timeLeft.value <= 1) {
          clearTimer();
          handleTimerComplete();
        } else {
          timeLeft.value--;
        }
      }, 1000);

      saveState();
      console.log('番茄钟已继续,剩余时间:', timeLeft.value, '秒');
    }
  }

  /**
   * 重置计时器
   */
  function resetTimer() {
    clearTimer();
    status.value = 'idle';
    timeLeft.value = workDuration.value;
    initialDuration.value = workDuration.value;
    saveState();
  }

  /**
   * 开始休息
   */
  function startRest() {
    clearTimer();
    status.value = 'rest';
    initialDuration.value = restDuration.value;
    timeLeft.value = restDuration.value;

    interval = window.setInterval(() => {
      if (timeLeft.value <= 1) {
        clearTimer();
        status.value = 'idle';
        saveState();
      } else {
        timeLeft.value--;
      }
    }, 1000);

    saveState();
  }

  /**
   * 处理计时完成
   */
  function handleTimerComplete() {
    if (status.value === 'running') {
      // 专注完成,状态变为 idle,由组件层处理记录保存
      status.value = 'idle';
      saveState();
    } else if (status.value === 'rest') {
      // 休息结束
      status.value = 'idle';
      saveState();
    }
  }

  /**
   * 完成专注,返回专注数据供组件层保存
   * @param subject 专注科目
   */
  function completeFocus(subject?: string) {
    const focusSubject = subject || currentSubject.value;
    
    // 计算实际专注时长(分钟)
    const elapsedSeconds = initialDuration.value - timeLeft.value;
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    if (durationMinutes < 1) {
      console.warn('专注时长不足1分钟,不创建记录');
      resetTimer();
      return null;
    }

    // 重置计时器
    resetTimer();

    console.log('番茄钟完成!请组件层处理记录保存');
    
    // 返回必要的数据,由组件层调用 Store 或 API 进行保存
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
    saveState();
  }

  /**
   * 更新配置
   */
  function updateConfig(newConfig: { workDuration?: number; restDuration?: number }) {
    if (newConfig.workDuration) {
      workDuration.value = newConfig.workDuration * 60;
    }
    if (newConfig.restDuration) {
      restDuration.value = newConfig.restDuration * 60;
    }
    
    // 只在空闲状态下重置计时器,暂停或运行中不重置
    if (status.value === 'idle') {
      resetTimer();
    }
    // 如果是暂停状态,更新 initialDuration 以匹配新的配置(但不重置 timeLeft)
    else if (status.value === 'paused' && newConfig.workDuration) {
      // 暂停状态下,根据已用时间比例调整 initialDuration
      const elapsedSeconds = initialDuration.value - timeLeft.value;
      initialDuration.value = workDuration.value;
      timeLeft.value = workDuration.value - elapsedSeconds;
      // 确保不会出现负数
      if (timeLeft.value < 0) {
        timeLeft.value = 0;
      }
      console.log('暂停状态下更新配置,调整后剩余时间:', timeLeft.value);
    }
    
    saveState();
  }

  /**
   * 计算已用时长(分钟)
   */
  const elapsedMinutes = computed(() => {
    const elapsedSeconds = initialDuration.value - timeLeft.value;
    return Math.max(0, Math.round(elapsedSeconds / 60));
  });

  /**
   * 初始化 Store
   */
  let initialized = false;
  let visibilityHandler: (() => void) | null = null;
  let beforeunloadHandler: (() => void) | null = null;

  function init() {
    if (initialized) {
      console.warn('番茄钟 Store 已初始化,跳过');
      return;
    }

    initialized = true;
    
    // 恢复状态前先清除旧定时器
    clearTimer();
    restoreState();
    
    console.log('番茄钟 Store 初始化完成,当前状态:', status.value, '剩余时间:', timeLeft.value);
    
    // 监听页面关闭事件,清空状态
    beforeunloadHandler = () => {
      clearTimer();
      clearState();
      console.log('页面关闭,已清空番茄钟状态');
    };
    window.addEventListener('beforeunload', beforeunloadHandler);

    // 监听页面可见性变化,页面不可见时暂停计时
    visibilityHandler = () => {
      if (document.hidden && status.value === 'running') {
        // 页面隐藏时自动暂停
        console.log('页面隐藏,自动暂停番茄钟');
        pauseTimer();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);
  }

  /**
   * 清理 Store(用于组件卸载时)
   */
  function cleanup() {
    // 在清理前先保存当前状态,确保时间被正确记录
    if (status.value === 'paused' || status.value === 'running') {
      saveState();
      console.log('组件卸载前保存状态:', status.value, '剩余时间:', timeLeft.value);
    }
    
    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler);
      visibilityHandler = null;
    }
    if (beforeunloadHandler) {
      window.removeEventListener('beforeunload', beforeunloadHandler);
      beforeunloadHandler = null;
    }
    clearTimer();
    initialized = false;
    console.log('番茄钟 Store 已清理');
  }

  return {
    // 状态
    status,
    timeLeft,
    initialDuration,
    currentSubject,
    workDuration,
    restDuration,
    // 计算属性
    minutes,
    seconds,
    progress,
    formattedTime,
    elapsedMinutes,
    // 方法
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    startRest,
    completeFocus,
    setSubject,
    updateConfig,
    init,
    cleanup,
    clearState,
  };
});
