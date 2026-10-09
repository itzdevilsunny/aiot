// Central Groq AI Client for Enterprise Risk Register Copilot
// Model Strategy: Primary: qwen/qwen3.8-27b (27B Ultra-Fast Reasoning), Secondary Fallback: openai/gpt-oss-120b

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqCallOptions {
  messages: GroqChatMessage[];
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface GroqCallResult {
  content: string;
  model: string;
  success: boolean;
  error?: string;
}

const GROQ_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b'
];

export async function callGroqAI(options: GroqCallOptions): Promise<GroqCallResult> {
  const apiKey = (process.env.GROQ_API_KEY || '').trim();

  if (!apiKey || apiKey.length < 10) {
    return {
      content: '',
      model: 'none',
      success: false,
      error: 'GROQ_API_KEY not configured or invalid'
    };
  }

  const { messages, jsonMode = false, temperature = 0.25, maxTokens = 2048 } = options;

  let lastError = '';

  for (const model of GROQ_MODELS) {
    try {
      const payload: any = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      };

      if (jsonMode) {
        payload.response_format = { type: 'json_object' };
      }

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        lastError = `Groq model ${model} HTTP ${res.status}: ${errorText}`;
        console.warn(`[Groq AI] ${model} failed, trying fallback:`, lastError);
        continue;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '';

      if (content) {
        return {
          content,
          model,
          success: true
        };
      }
    } catch (err: any) {
      lastError = err?.message || String(err);
      console.warn(`[Groq AI] Exception calling ${model}:`, lastError);
    }
  }

  return {
    content: '',
    model: 'none',
    success: false,
    error: lastError || 'All Groq model attempts failed'
  };
}
