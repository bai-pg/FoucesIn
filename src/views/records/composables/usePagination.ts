import { ref, computed, watch } from 'vue';
import type { StudyRecord } from '../types';

/**
 * 分页管理组合式函数
 * 负责记录列表的分页逻辑
 */
export function usePagination(records: any) {
  const currentPage = ref(1);
  const pageSize = ref(5); // 默认每页5条
  const isRecordsCollapsed = ref(true); // 默认折叠记录列表

  // 计算总页数 - 添加空值保护
  const totalPages = computed(() => {
    if (!records.value) return 0;
    return Math.ceil(records.value.length / pageSize.value);
  });

  // 当前页的记录 - 添加空值保护
  const paginatedRecords = computed(() => {
    if (!records.value) return [];
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return records.value.slice(start, end);
  });

  /**
   * 切换折叠状态
   */
  function toggleRecordsCollapse() {
    isRecordsCollapsed.value = !isRecordsCollapsed.value;
  }

  /**
   * 跳转到指定页
   */
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  }

  // 每页条数变化时重置到第一页
  watch(pageSize, () => {
    currentPage.value = 1;
  });

  // 数据更新时重置到第一页
  watch(records, () => {
    currentPage.value = 1;
  });

  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedRecords,
    isRecordsCollapsed,
    toggleRecordsCollapse,
    goToPage,
  };
}
