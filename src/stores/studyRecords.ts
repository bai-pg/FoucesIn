import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { StudyRecord } from '@/views/records/types'

/**
 * 学习记录 Store
 * 管理学习记录和笔记状态，实现跨组件实时同步
 */
export const useStudyRecordsStore = defineStore('studyRecords', () => {
  // 状态
  const records = ref<StudyRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 缓存配置
  const CACHE_DURATION = 5 * 60 * 1000 // 5分钟
  
  interface RecordsCache {
    timestamp: number
    records: StudyRecord[]
  }

  /**
   * 缓存键名生成
   */
  function getCacheKey(userId: string): string {
    return `records_${userId}`
  }

  /**
   * 从缓存读取
   */
  function getCachedData(userId: string): RecordsCache | null {
    try {
      const cached = localStorage.getItem(getCacheKey(userId))
      if (!cached) return null

      const data: RecordsCache = JSON.parse(cached)
      const now = Date.now()

      if (now - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(getCacheKey(userId))
        return null
      }

      return data
    } catch {
      return null
    }
  }

  /**
   * 写入缓存
   */
  function setCachedData(userId: string, records: StudyRecord[]): void {
    try {
      const cache: RecordsCache = {
        timestamp: Date.now(),
        records
      }
      localStorage.setItem(getCacheKey(userId), JSON.stringify(cache))
    } catch (err) {
      console.error('Failed to cache records:', err)
    }
  }

  /**
   * 清除缓存
   */
  function clearCache(userId: string): void {
    localStorage.removeItem(getCacheKey(userId))
  }

  // 计算属性
  /**
   * 按创建时间倒序排序的记录
   */
  const sortedRecords = computed(() => {
    return [...records.value].sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime()
      const dateB = new Date(b.created_at || '').getTime()
      return dateB - dateA // 最新的在前
    })
  })

  /**
   * 获取指定记录的笔记
   */
  function getRecordNotes(recordId: number): string | undefined {
    const record = records.value.find(r => r.id === recordId)
    return record?.learning_notes
  }

  /**
   * 检查记录是否有笔记
   */
  function hasNotes(recordId: number): boolean {
    const record = records.value.find(r => r.id === recordId)
    return !!(record?.learning_notes && record.learning_notes.trim().length > 0)
  }

  // 异步操作

  /**
   * 获取所有学习记录
   */
  async function fetchRecords(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('未登录')
      }

      // 尝试从缓存读取
      const cached = getCachedData(user.id)
      if (cached) {
        records.value = cached.records
        loading.value = false
        return
      }

      // 从数据库获取
      const { data, error: fetchError } = await supabase
        .from('study_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      records.value = data || []
      
      // 写入缓存
      setCachedData(user.id, records.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取记录失败'
      console.error('Failed to fetch records:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建学习记录
   */
  async function createRecord(record: Omit<StudyRecord, 'id' | 'created_at' | 'user_id'>): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      const { data, error: createError } = await supabase
        .from('study_records')
        .insert([{
          ...record,
          user_id: user.id
        }])
        .select()
        .single()

      if (createError) throw createError

      // 更新本地状态
      records.value.unshift(data)
      
      // 清除缓存
      clearCache(user.id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建记录失败'
      console.error('Failed to create record:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新学习记录（包括笔记）
   */
  async function updateRecord(recordId: number, updates: Partial<StudyRecord>): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      const { error: updateError } = await supabase
        .from('study_records')
        .update(updates)
        .eq('id', recordId)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // 更新本地状态
      const index = records.value.findIndex(r => r.id === recordId)
      if (index !== -1) {
        records.value[index] = {
          ...records.value[index],
          ...updates
        }
      }

      // 清除缓存
      clearCache(user.id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新记录失败'
      console.error('Failed to update record:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新笔记（专门的方法）
   */
  async function updateNotes(recordId: number, content: string): Promise<void> {
    return updateRecord(recordId, { learning_notes: content })
  }

  /**
   * 删除学习记录
   */
  async function deleteRecord(recordId: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      const { error: deleteError } = await supabase
        .from('study_records')
        .delete()
        .eq('id', recordId)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      // 更新本地状态
      records.value = records.value.filter(r => r.id !== recordId)
      
      // 清除缓存
      clearCache(user.id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除记录失败'
      console.error('Failed to delete record:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新数据（清除缓存并重新获取）
   */
  async function refresh(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      clearCache(user.id)
    }
    await fetchRecords()
  }

  return {
    // 状态
    records,
    loading,
    error,
    
    // 计算属性
    sortedRecords,
    
    // 查询方法
    getRecordNotes,
    hasNotes,
    
    // CRUD 操作
    fetchRecords,
    createRecord,
    updateRecord,
    updateNotes,
    deleteRecord,
    refresh
  }
})
