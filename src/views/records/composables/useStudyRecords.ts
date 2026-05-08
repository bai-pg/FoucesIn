import { ref } from 'vue';
import { supabase } from '@/services/supabase';
import type { StudyRecord } from '../types';

/**
 * 学习记录管理组合式函数
 * 负责记录的增删改查操作
 */
export function useStudyRecords() {
  const records = ref<StudyRecord[]>([]);
  const loading = ref(false);

  // 表单状态
  const date = ref(new Date().toISOString().slice(0, 10));
  const subject = ref('');
  const duration = ref('');
  const notes = ref('');

  // 编辑状态
  const editingRecord = ref<StudyRecord | null>(null);
  const editDate = ref('');
  const editSubject = ref('');
  const editDuration = ref('');
  const editNotes = ref('');

  /**
   * 获取当前用户的学习记录
   */
  async function fetchRecords() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('study_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取记录失败:', error);
    } else {
      records.value = data || [];
    }
  }

  /**
   * 添加新记录
   */
  async function addRecord() {
    loading.value = true;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('请先登录');
      loading.value = false;
      return;
    }

    const { error } = await supabase.from('study_records').insert({
      user_id: user.id,
      date: date.value,
      subject: subject.value,
      duration_minutes: parseInt(duration.value) || 0,
      notes: notes.value,
    });

    if (error) {
      console.error('添加记录失败:', error);
      alert('添加失败: ' + error.message);
    } else {
      alert('添加成功!');
      resetForm();
      await fetchRecords();
    }
    
    loading.value = false;
  }

  /**
   * 开始编辑记录
   */
  function startEdit(record: StudyRecord) {
    editingRecord.value = record;
    editDate.value = record.date;
    editSubject.value = record.subject;
    editDuration.value = record.duration_minutes.toString();
    editNotes.value = record.notes || '';
  }

  /**
   * 取消编辑
   */
  function cancelEdit() {
    editingRecord.value = null;
    editDate.value = '';
    editSubject.value = '';
    editDuration.value = '';
    editNotes.value = '';
  }

  /**
   * 保存编辑
   */
  async function saveEdit() {
    if (!editingRecord.value) return;
    
    loading.value = true;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('请先登录');
      loading.value = false;
      return;
    }
    
    const { error } = await supabase
      .from('study_records')
      .update({
        date: editDate.value,
        subject: editSubject.value,
        duration_minutes: parseInt(editDuration.value) || 0,
        notes: editNotes.value,
      })
      .eq('id', editingRecord.value.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('更新记录失败:', error);
      alert('更新失败: ' + error.message);
    } else {
      alert('更新成功!');
      cancelEdit();
      await fetchRecords();
    }
    
    loading.value = false;
  }

  /**
   * 删除记录
   */
  async function deleteRecord(id: number) {
    if (!confirm('确定要删除这条记录吗?')) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('study_records')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('删除记录失败:', error);
      alert('删除失败: ' + error.message);
    } else {
      alert('删除成功!');
      await fetchRecords();
    }
  }

  /**
   * 重置表单
   */
  function resetForm() {
    date.value = new Date().toISOString().slice(0, 10);
    subject.value = '';
    duration.value = '';
    notes.value = '';
  }

  /**
   * 保存学习笔记（富文本）
   */
  async function saveLearningNotes(recordId: number, content: string) {
    loading.value = true;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('请先登录');
      loading.value = false;
      return;
    }
    
    const { error } = await supabase
      .from('study_records')
      .update({
        learning_notes: content,
      })
      .eq('id', recordId)
      .eq('user_id', user.id);

    if (error) {
      console.error('保存笔记失败:', error);
      alert('保存失败: ' + error.message);
    } else {
      // 更新本地记录
      const record = records.value.find(r => r.id === recordId);
      if (record) {
        record.learning_notes = content;
      }
      alert('笔记保存成功!');
      await fetchRecords();
    }
    
    loading.value = false;
  }

  return {
    // 状态
    records,
    loading,
    date,
    subject,
    duration,
    notes,
    editingRecord,
    editDate,
    editSubject,
    editDuration,
    editNotes,
    
    // 方法
    fetchRecords,
    addRecord,
    startEdit,
    cancelEdit,
    saveEdit,
    deleteRecord,
    resetForm,
    saveLearningNotes, // 新增
  };
}
