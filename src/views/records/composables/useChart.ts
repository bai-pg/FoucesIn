import { ref, nextTick } from 'vue';
import * as echarts from 'echarts';
import type { StudyRecord, ChartType, ChartDataItem } from '../types';

/**
 * 图表管理组合式函数
 * 负责 ECharts 图表的渲染和切换
 */
export function useChart() {
  const chartType = ref<ChartType>('pie'); // 默认显示饼图
  let chartInstance: any = null;
  let pieChartInstance: any = null;

  /**
   * 渲染柱状图
   */
  function renderBarChart(subjectMap: Map<string, number>) {
    const chartDom = document.getElementById('study-chart');
    if (!chartDom) return;
    
    if (chartInstance) {
      chartInstance.dispose();
    }
    
    chartInstance = echarts.init(chartDom);
    
    chartInstance.setOption({
      backgroundColor: 'transparent',
      title: {
        text: '📊 SUBJECT STATS',
        left: 'center',
        textStyle: {
          fontFamily: "'Press Start 2P', 'Courier New', monospace",
          fontSize: 14,
          color: '#000000',
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 3,
        textStyle: {
          fontFamily: "'Press Start 2P', 'Courier New', monospace",
          fontSize: 10,
          color: '#000000'
        },
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(255, 255, 0, 0.3)'
          }
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '60px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: Array.from(subjectMap.keys()),
        axisLine: {
          lineStyle: {
            color: '#000000',
            width: 3
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          fontFamily: "'Press Start 2P', 'Courier New', monospace",
          fontSize: 9,
          color: '#000000',
          interval: 0,
          rotate: 0,
          margin: 10
        }
      },
      yAxis: {
        type: 'value',
        name: 'MINUTES',
        nameTextStyle: {
          fontFamily: "'Press Start 2P', 'Courier New', monospace",
          fontSize: 10,
          color: '#000000',
          fontWeight: 'bold'
        },
        axisLine: {
          lineStyle: {
            color: '#000000',
            width: 3
          }
        },
        splitLine: {
          lineStyle: {
            color: '#cccccc',
            width: 1,
            type: 'dashed'
          }
        },
        axisLabel: {
          fontFamily: "'Press Start 2P', 'Courier New', monospace",
          fontSize: 9,
          color: '#000000'
        }
      },
      series: [
        {
          name: 'Duration',
          type: 'bar',
          data: Array.from(subjectMap.values()),
          itemStyle: {
            color: '#4ade80',
            borderColor: '#000000',
            borderWidth: 3,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 0,
            shadowOffsetX: 4,
            shadowOffsetY: 4
          },
          emphasis: {
            itemStyle: {
              color: '#22c55e'
            }
          },
          barWidth: '50%',
          label: {
            show: true,
            position: 'top',
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: 9,
            color: '#000000',
            formatter: '{c}'
          }
        }
      ]
    });
  }

  /**
   * 渲染饼图
   */
  function renderPieChart(data: ChartDataItem[], totalDuration: number) {
    const chartDom = document.getElementById('study-pie-chart');
    if (!chartDom) return;
    
    if (pieChartInstance) {
      pieChartInstance.dispose();
    }
    
    pieChartInstance = echarts.init(chartDom);
    
    pieChartInstance.setOption({
      backgroundColor: 'transparent',
      title: {
        text: `TOTAL: ${totalDuration} MIN`,
        left: 'center',
        textStyle: {
          fontFamily: "'Press Start 2P', 'Courier New', monospace",
          fontSize: 14,
          color: '#000000',
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 3,
        textStyle: {
          fontFamily: "'Press Start 2P', 'Courier New', monospace",
          fontSize: 10,
          color: '#000000'
        },
        formatter: '{b}: {c} ({d}%)'
      },
      series: [
        {
          name: 'Duration',
          type: 'pie',
          radius: '50%',
          data,
          itemStyle: {
            color: ({ data }: any) => {
              const colors = ['#4ade80', '#fbbf24', '#f87171', '#6366f1', '#ec4899'];
              return colors[data.index % colors.length];
            },
            borderColor: '#000000',
            borderWidth: 3,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 0,
            shadowOffsetX: 4,
            shadowOffsetY: 4
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            position: 'outside',
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: 9,
            color: '#000000',
            formatter: '{b}: {c} ({d}%)'
          }
        }
      ]
    });
  }

  /**
   * 渲染图表(根据当前类型)
   */
  function renderChart(records: StudyRecord[]) {
    if (records.length === 0) return;
    
    // 按科目汇总时长
    const subjectMap = new Map<string, number>();
    records.forEach(r => {
      const old = subjectMap.get(r.subject) || 0;
      subjectMap.set(r.subject, old + r.duration_minutes);
    });
    
    // 计算总时长
    const totalDuration = Array.from(subjectMap.values()).reduce((sum, val) => sum + val, 0);
    
    // 构建饼图数据(带百分比)
    const pieData: ChartDataItem[] = Array.from(subjectMap.entries()).map(([subject, duration]) => ({
      name: subject,
      value: duration,
      percent: ((duration / totalDuration) * 100).toFixed(1)
    }));
    
    // 根据当前类型渲染对应的图表
    if (chartType.value === 'bar') {
      renderBarChart(subjectMap);
      if (pieChartInstance) {
        pieChartInstance.dispose();
        pieChartInstance = null;
      }
    } else {
      renderPieChart(pieData, totalDuration);
      if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
      }
    }
  }

  /**
   * 切换图表类型
   */
  function toggleChartType(records: StudyRecord[]) {
    chartType.value = chartType.value === 'bar' ? 'pie' : 'bar';
    nextTick(() => {
      renderChart(records);
    });
  }

  return {
    chartType,
    renderChart,
    toggleChartType,
  };
}
