// 学习记录相关类型定义

export interface StudyRecord {
  id: number;
  user_id: string;
  date: string;
  subject: string;
  duration_minutes: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type ChartType = 'bar' | 'pie';

export interface ChartDataItem {
  name: string;
  value: number;
  percent?: string;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
}
