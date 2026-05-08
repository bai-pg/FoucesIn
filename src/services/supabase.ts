import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;

// 验证配置
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 配置缺失！请检查 .env 文件中的 VITE_SUPABASE_URL 和 VITE_SUPABASE_KEY');
}

// 添加连接超时和重试配置
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: { 'x-application-name': 'vuepabase' },
  },
});

// 监听认证状态变化，便于调试
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase Auth State Change:', event, session?.user?.id);
});