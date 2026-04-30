import { ref } from 'vue';
import type { StudyRecord } from '../types';

/**
 * 本地 AI 周报生成组合式函数
 * 使用智能模板引擎 + 规则拼接生成自然语言总结
 */
export function useWeeklyReport() {
  const report = ref<string>('');
  const isGenerating = ref(false);
  const loadingProgress = ref(0);

  // 词库 - 用于增加文本的多样性
  const templates = {
    openings: [
      '本周学习情况如下：',
      '以下是本周的学习总结：',
      '本周学习回顾：',
      '学习周报已生成：',
    ],
    achievements: [
      '表现非常出色！',
      '学习效率很高！',
      '进步明显！',
      '继续保持这个节奏！',
      '学习态度值得肯定！',
    ],
    suggestions: [
      '建议下周可以适当调整学习计划，保持学习的持续性。',
      '希望下周能够继续保持这种学习热情！',
      '可以尝试增加一些新的学习内容，拓宽知识面。',
      '注意休息和学习的平衡，保持良好的学习状态。',
      '建议在薄弱环节多投入一些时间。',
    ],
    connectors: [
      '同时',
      '此外',
      '另外',
      '值得一提的是',
    ],
  };

  /**
   * 获取本周的学习记录
   */
  function getThisWeekRecords(records: StudyRecord[]): StudyRecord[] {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (周日) - 6 (周六)
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    return records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= monday;
    });
  }

  /**
   * 按科目统计学习时间
   */
  function calculateSubjectStats(records: StudyRecord[]): Map<string, number> {
    const stats = new Map<string, number>();
    
    records.forEach(record => {
      const current = stats.get(record.subject) || 0;
      stats.set(record.subject, current + record.duration_minutes);
    });

    return stats;
  }

  /**
   * 生成学习时长描述
   */
  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}小时${mins}分钟`;
    } else if (hours > 0) {
      return `${hours}小时`;
    } else {
      return `${mins}分钟`;
    }
  }

  /**
   * 根据数据生成评价
   */
  function generateEvaluation(totalMinutes: number): string {
    if (totalMinutes >= 600) {
      return '本周学习强度非常高，展现了极强的学习毅力！';
    } else if (totalMinutes >= 300) {
      return '本周学习量充足，保持了良好的学习习惯。';
    } else if (totalMinutes >= 120) {
      return '本周有一定的学习投入，可以继续加强。';
    } else {
      return '本周学习时间较少，建议下周增加学习时长。';
    }
  }

  /**
   * 生成周报文本
   */
  async function generateReport(records: StudyRecord[]) {
    isGenerating.value = true;
    loadingProgress.value = 0;

    // 模拟加载进度（给用户反馈）
    const progressInterval = setInterval(() => {
      loadingProgress.value += 10;
      if (loadingProgress.value >= 90) {
        clearInterval(progressInterval);
      }
    }, 100);

    // 等待一小段时间模拟"AI 思考"
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const weekRecords = getThisWeekRecords(records);
      
      if (weekRecords.length === 0) {
        report.value = '📊 本周暂无学习记录，记得开始学习哦！';
        return;
      }

      const subjectStats = calculateSubjectStats(weekRecords);
      const totalMinutes = Array.from(subjectStats.values()).reduce((sum, val) => sum + val, 0);
      
      // 随机选择模板元素
      const opening = templates.openings[Math.floor(Math.random() * templates.openings.length)];
      const achievement = templates.achievements[Math.floor(Math.random() * templates.achievements.length)];
      const suggestion = templates.suggestions[Math.floor(Math.random() * templates.suggestions.length)];
      const connector = templates.connectors[Math.floor(Math.random() * templates.connectors.length)];

      // 构建科目详情
      let subjectDetails = '';
      const sortedSubjects = Array.from(subjectStats.entries()).sort((a, b) => b[1] - a[1]);
      
      sortedSubjects.forEach(([subject, minutes], index) => {
        const percentage = ((minutes / totalMinutes) * 100).toFixed(1);
        if (index === 0) {
          subjectDetails += `其中【${subject}】投入最多，达到${formatDuration(minutes)}（占${percentage}%）`;
        } else {
          subjectDetails += `，${subject}${formatDuration(minutes)}`;
        }
      });

      // 找出最勤奋的一天
      const dailyStats = new Map<string, number>();
      weekRecords.forEach(record => {
        const current = dailyStats.get(record.date) || 0;
        dailyStats.set(record.date, current + record.duration_minutes);
      });
      
      const bestDay = Array.from(dailyStats.entries()).sort((a, b) => b[1] - a[1])[0];
      const bestDayDate = bestDay ? new Date(bestDay[0]).toLocaleDateString('zh-CN', { 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      }) : '';

      // 组装完整报告
      const evaluation = generateEvaluation(totalMinutes);
      
      report.value = `🎯 ${opening}\n\n` +
        `📈 **总体情况**\n` +
        `本周共学习 ${weekRecords.length} 次，累计学习 ${formatDuration(totalMinutes)}。${evaluation}\n\n` +
        `📚 **科目分布**\n` +
        `${subjectDetails}。\n\n` +
        `⭐ **亮点时刻**\n` +
        `${bestDayDate}是本周最勤奋的一天，学习了${formatDuration(bestDay[1])}。${achievement}\n\n` +
        `💡 **下周建议**\n` +
        `${connector}，${suggestion}\n\n` +
        `---\n` +
        `✨ 继续加油，每天进步一点点！`;

      loadingProgress.value = 100;
    } catch (error) {
      console.error('生成周报失败:', error);
      report.value = '❌ 生成周报失败，请稍后重试。';
    } finally {
      isGenerating.value = false;
      setTimeout(() => {
        loadingProgress.value = 0;
      }, 500);
    }
  }

  /**
   * 清除报告
   */
  function clearReport() {
    report.value = '';
  }

  return {
    report,
    isGenerating,
    loadingProgress,
    generateReport,
    clearReport,
  };
}
