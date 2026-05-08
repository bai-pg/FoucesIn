import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 生成文本的向量嵌入
async function generateEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY 未配置');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-ada-002',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`生成嵌入失败: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 验证用户身份
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: '未授权：缺少认证令牌' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // 获取当前用户
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('用户验证失败:', userError);
      return new Response(
        JSON.stringify({ error: '用户验证失败' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 解析请求体
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: '无效的请求格式' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, limit = 5 } = requestBody;

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: '缺少查询参数' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`RAG 搜索: "${query}" for user ${user.id}`);

    // 生成查询的向量嵌入
    let embedding;
    try {
      embedding = await generateEmbedding(query);
    } catch (embedError) {
      console.error('生成嵌入失败:', embedError);
      // 如果生成嵌入失败，回退到文本搜索
      const { data: fallbackRecords, error: fallbackError } = await supabaseClient
        .from('study_records')
        .select('id, title, content, category, created_at')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fallbackError) {
        console.error('回退搜索也失败:', fallbackError);
      }

      return new Response(
        JSON.stringify({
          results: fallbackRecords || [],
          method: 'fallback_text_search',
          message: '向量搜索不可用，使用文本搜索',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 执行向量相似度搜索
    const { data: records, error } = await supabaseClient.rpc('search_similar_records', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit,
      p_user_id: user.id,
    });

    if (error) {
      console.error('向量搜索失败:', error);
      
      // 回退到文本搜索
      const { data: fallbackRecords } = await supabaseClient
        .from('study_records')
        .select('id, title, content, category, created_at')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      return new Response(
        JSON.stringify({
          results: fallbackRecords || [],
          method: 'fallback_text_search',
          message: '向量搜索失败，使用文本搜索',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`找到 ${records?.length || 0} 条相关记录`);

    return new Response(
      JSON.stringify({
        results: records || [],
        method: 'vector_search',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('RAG Search 错误:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || '服务器内部错误',
        results: [],
        method: 'error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
