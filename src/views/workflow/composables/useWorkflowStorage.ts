import { ref } from 'vue';
import { supabase } from '@/services/supabase';
import type { WorkflowSchema } from '../types';

/**
 * 工作流数据管理组合式函数
 * 负责工作流的增删改查操作
 */
export function useWorkflowStorage() {
  const workflows = ref<WorkflowSchema[]>([]);
  const currentWorkflow = ref<WorkflowSchema | null>(null);
  const loading = ref(false);

  /**
   * 获取当前用户的所有工作流
   */
  async function fetchWorkflows() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    loading.value = true;

    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('获取工作流失败:', error);
      alert('获取工作流失败: ' + error.message);
    } else {
      workflows.value = data || [];
    }

    loading.value = false;
  }

  /**
   * 获取单个工作流详情
   */
  async function fetchWorkflowById(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    loading.value = true;

    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('获取工作流详情失败:', error);
      alert('获取工作流详情失败: ' + error.message);
    } else {
      currentWorkflow.value = data;
    }

    loading.value = false;
    return data;
  }

  /**
   * 创建工作流
   */
  async function createWorkflow(schema: Omit<WorkflowSchema, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('请先登录');
      return null;
    }

    loading.value = true;

    const { data, error } = await supabase
      .from('workflows')
      .insert({
        user_id: user.id,
        name: schema.name,
        description: schema.description,
        nodes: schema.nodes,
        edges: schema.edges,
      })
      .select()
      .single();

    if (error) {
      console.error('创建工作流失败:', error);
      alert('创建工作流失败: ' + error.message);
    } else {
      alert('创建工作流成功!');
      await fetchWorkflows();
    }

    loading.value = false;
    return data;
  }

  /**
   * 更新工作流
   */
  async function updateWorkflow(id: string, updates: Partial<WorkflowSchema>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    loading.value = true;

    const { data, error } = await supabase
      .from('workflows')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('更新工作流失败:', error);
      alert('更新工作流失败: ' + error.message);
    } else {
      await fetchWorkflows();
    }

    loading.value = false;
    return data;
  }

  /**
   * 删除工作流
   */
  async function deleteWorkflow(id: string) {
    if (!confirm('确定要删除这个工作流吗?')) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    loading.value = true;

    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('删除工作流失败:', error);
      alert('删除工作流失败: ' + error.message);
    } else {
      alert('删除工作流成功!');
      await fetchWorkflows();
      if (currentWorkflow.value?.id === id) {
        currentWorkflow.value = null;
      }
    }

    loading.value = false;
  }

  /**
   * 保存当前画布状态
   */
  async function saveCurrentWorkflow(schema: WorkflowSchema) {
    if (schema.id) {
      return await updateWorkflow(schema.id, {
        nodes: schema.nodes,
        edges: schema.edges,
        name: schema.name,
        description: schema.description,
      });
    } else {
      return await createWorkflow(schema);
    }
  }

  return {
    workflows,
    currentWorkflow,
    loading,
    fetchWorkflows,
    fetchWorkflowById,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    saveCurrentWorkflow,
  };
}