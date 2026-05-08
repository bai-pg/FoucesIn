// 学习记录相关类型定义

export interface StudyRecord {
  id: number;
  user_id: string;
  date: string;
  subject: string;
  duration_minutes: number;
  notes?: string; // 简单文本笔记（保留兼容）
  learning_notes?: string; // 富文本学习笔记/反思日志
  created_at?: string;
  updated_at?: string;
}

/**
 * 学习目标类型
 */
export interface LearningGoal {
  id: number;
  user_id: string;
  goal_type: 'daily' | 'weekly' | 'monthly';
  target_minutes: number;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * 番茄钟会话状态
 */
export type PomodoroStatus = 'completed' | 'interrupted' | 'skipped';

/**
 * 番茄钟会话
 */
export interface PomodoroSession {
  id: number;
  user_id: string;
  study_record_id?: number | null;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  status: PomodoroStatus;
  subject?: string;
  created_at?: string;
}

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  user_id: string;
  theme: 'light' | 'dark';
  email_notifications: boolean;
  default_view: string;
  pomodoro_work_duration: number; // 专注时长（分钟）
  pomodoro_rest_duration: number; // 休息时长（分钟）
  created_at?: string;
  updated_at?: string;
}

/**
 * 用户资料扩展
 */
export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Profile 类型（用于用户资料卡片）
 */
export interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * 图表数据类型（用于 ECharts）
 */
export interface ChartDataItem {
  name: string;
  value: number;
  percent?: string;
}

/**
 * 图表类型
 */
export type ChartType = 'bar' | 'pie' | 'line';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
}
