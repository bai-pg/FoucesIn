/**
 * 工作流画布类型定义
 */

// 节点类型
export type NodeType = 'task' | 'condition' | 'start' | 'end';

// 节点数据
export interface WorkflowNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  label: string;
  description?: string;
  subject?: string;
  duration?: number;
  data?: Record<string, any>;
}

// 连线数据
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

// 完整工作流 Schema
export interface WorkflowSchema {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  created_at?: string;
  updated_at?: string;
}

// X6 图配置
export interface GraphConfig {
  width: number;
  height: number;
  gridSize: number;
  enableGrid: boolean;
  enableSnapline: boolean;
  enableKeyboard: boolean;
  enableHistory: boolean;
}