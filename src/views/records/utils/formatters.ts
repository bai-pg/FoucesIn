/**
 * 格式化日期为友好显示
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 格式化时长为友好显示
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} MIN`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} H`;
  }
  return `${hours} H ${mins} MIN`;
}

/**
 * 生成随机颜色(用于图表)
 */
export function generateColor(index: number): string {
  const colors = ['#4ade80', '#fbbf24', '#f87171', '#6366f1', '#ec4899'];
  return colors[index % colors.length];
}
