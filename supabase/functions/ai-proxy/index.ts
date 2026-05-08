import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
const DEEPSEEK_MODEL = Deno.env.get("DEEPSEEK_MODEL") || "deepseek-chat";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// 获取用户学习记录
async function getUserStudyRecords(userId: string, limit = 10) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("缺少 Supabase 环境变量，无法获取学习记录");
    return [];
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data, error } = await supabase
      .from("study_records")
      .select("date, subject, duration_minutes, notes")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("获取学习记录失败:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("获取学习记录异常:", error);
    return [];
  }
}

// 格式化学习记录为文本
function formatStudyRecords(records: Array<{ date: string; subject: string; duration_minutes: number; notes?: string }>) {
  if (records.length === 0) {
    return "暂无学习记录";
  }

  return records.map(record => {
    const noteText = record.notes ? `\n   备注: ${record.notes}` : "";
    return `- ${record.date}: ${record.subject} (${record.duration_minutes} 分钟)${noteText}`;
  }).join("\n");
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: "缺少 DEEPSEEK_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { messages, includeStudyRecords = false } = body;
    
    console.log("收到请求:", messages.length, "条消息");
    console.log("是否包含学习记录:", includeStudyRecords);

    // 获取用户学习记录（如果需要）
    let studyRecordsContext = "";
    if (includeStudyRecords) {
      // 从 Authorization header 中提取用户 ID
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        // 这里需要从 token 中解析用户 ID
        // 简化处理：暂时不获取具体用户 ID，只添加通用上下文
        studyRecordsContext = "\n\n【学习记录分析模式】\n用户要求分析学习记录。请基于用户提供的学习数据进行分析和总结。";
      }
    }

    // 构建系统提示
    let systemPrompt = "你是一个友好的AI助手";
    if (includeStudyRecords) {
      systemPrompt = `你是一个专业的学习分析助手。你可以分析和总结学生的学习记录，提供学习建议。

${studyRecordsContext}

请根据用户的问题，提供专业、有条理的学习分析和建议。`;
    }

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("DeepSeek API 错误:", error);
      throw new Error(`DeepSeek API 错误: ${response.status}`);
    }

    const data = await response.json();
    console.log("DeepSeek 响应成功");

    return new Response(
      JSON.stringify({ content: data.choices[0].message.content }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("错误:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});