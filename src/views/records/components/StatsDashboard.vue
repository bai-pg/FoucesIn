<script setup lang="ts">
import { ref, onMounted, watch, shallowRef } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, PieChart, BarChart } from 'echarts/charts';
import { 
  TitleComponent, 
  TooltipComponent, 
  LegendComponent, 
  GridComponent 
} from 'echarts/components';
import { supabase } from '@/services/supabase';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

interface Props {
  userId: string;
}

const props = defineProps<Props>();

interface StudyRecord {
  date: string;
  duration_minutes: number;
  subject?: string;
  user_id?: string;
}

// 图表配置 - 使用 shallowRef 避免深度响应式带来的性能开销
const weeklyOption = shallowRef({});
const pieOption = shallowRef({});
const loading = ref(false);

// 数据缓存
const cacheKey = (userId: string) => `stats_${userId}`;
const CACHE_DURATION = 2 * 60 * 1000; // 2分钟缓存

interface CacheData {
  timestamp: number;
  weeklyData: any;
  pieData: any;
}

/**
 * 从缓存获取数据
 */
function getCachedData(userId: string): CacheData | null {
  try {
    const cached = localStorage.getItem(cacheKey(userId));
    if (!cached) return null;
    
    const data: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    // 检查缓存是否过期
    if (now - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey(userId));
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

/**
 * 保存数据到缓存
 */
function setCachedData(userId: string, weeklyData: any, pieData: any) {
  try {
    const cacheData: CacheData = {
      timestamp: Date.now(),
      weeklyData,
      pieData,
    };
    localStorage.setItem(cacheKey(userId), JSON.stringify(cacheData));
  } catch (error) {
    console.warn('缓存保存失败:', error);
  }
}

/**
 * 获取近7天学习数据
 */
async function fetchWeeklyData() {
  const today = new Date();
  const dates = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const { data } = await supabase
    .from('study_records')
    .select('date, duration_minutes')
    .eq('user_id', props.userId)
    .gte('date', dates[0]);

  const map: Record<string, number> = {};
  (data as StudyRecord[])?.forEach(r => {
    map[r.date] = (map[r.date] || 0) + r.duration_minutes;
  });

  const values = dates.map(d => map[d] || 0);

  return {
    option: {
      title: {
        text: '📈 近7天学习趋势',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 600,
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c} 分钟',
      },
      xAxis: {
        type: 'category',
        data: dates.map(d => d.slice(5)), // 显示 MM-DD
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: '分钟',
      },
      series: [
        {
          data: values,
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.3,
          },
          itemStyle: {
            color: '#409EFF',
          },
          lineStyle: {
            width: 3,
          },
        },
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
    },
    rawData: { dates, values },
  };
}

/**
 * 获取科目分布数据
 */
async function fetchSubjectDistribution() {
  const { data } = await supabase
    .from('study_records')
    .select('subject, duration_minutes')
    .eq('user_id', props.userId);

  const map = new Map<string, number>();
  (data as StudyRecord[])?.forEach(r => {
    map.set(r.subject!, (map.get(r.subject!) || 0) + r.duration_minutes);
  });

  const subjects = Array.from(map.keys());
  const values = subjects.map(s => map.get(s) || 0);

  return {
    option: {
      title: {
        text: '🥧 科目学习占比',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 600,
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} 分钟 ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}: {d}%',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          data: subjects.map((s, i) => ({
            name: s,
            value: values[i],
          })),
        },
      ],
    },
    rawData: { subjects, values },
  };
}

/**
 * 加载所有统计数据
 */
async function loadStats(forceRefresh = false) {
  // 尝试从缓存加载
  if (!forceRefresh) {
    const cached = getCachedData(props.userId);
    if (cached) {
      weeklyOption.value = cached.weeklyData;
      pieOption.value = cached.pieData;
      return;
    }
  }

  loading.value = true;
  try {
    // 并行请求两个接口
    const [weeklyResult, pieResult] = await Promise.all([
      fetchWeeklyData(),
      fetchSubjectDistribution(),
    ]);

    weeklyOption.value = weeklyResult.option;
    pieOption.value = pieResult.option;

    // 保存到缓存
    setCachedData(props.userId, weeklyResult.option, pieResult.option);
  } catch (error) {
    console.error('加载统计数据失败:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadStats();
});

// 监听 userId 变化，重新加载数据
watch(() => props.userId, (newUserId, oldUserId) => {
  if (newUserId && newUserId !== oldUserId) {
    loadStats(true); // 用户切换时强制刷新
  }
});
</script>

<template>
  <div class="stats-dashboard">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card" v-loading="loading">
          <v-chart 
            class="chart" 
            :option="weeklyOption" 
            autoresize 
          />
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card" v-loading="loading">
          <v-chart 
            class="chart" 
            :option="pieOption" 
            autoresize 
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.stats-dashboard {
  margin-top: 20px;
}

.chart-card {
  height: 400px;
}

.chart {
  height: 100%;
  width: 100%;
}
</style>