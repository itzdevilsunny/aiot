import dns from 'dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore if not supported in runtime
}

export interface GeminiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GeminiCallOptions {
  prompt?: string;
  systemInstruction?: string;
  messages?: GeminiChatMessage[];
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiCallResult {
  content: string;
  model: string;
  success: boolean;
  error?: string;
}

const GEMINI_MODELS = [
  'models/gemini-3.8-flash',
  'models/gemini-flash-latest',
  'models/gemini-2.5-pro'
];

export async function callGeminiAI(options: GeminiCallOptions): Promise<GeminiCallResult> {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey || apiKey.length < 10) {
    return {
      content: '',
      model: 'none',
      success: false,
      error: 'GEMINI_API_KEY not configured or invalid'
    };
  }

  const {
    prompt,
    systemInstruction,
    messages = [],
    jsonMode = false,
    temperature = 0.2,
    maxTokens = 2048
  } = options;

  // Build contents array
  const contents: any[] = [];
  
  if (messages.length > 0) {
    for (const msg of messages) {
      if (msg.role === 'system') continue; // Handled in systemInstruction
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
  } else if (prompt) {
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });
  }

  let systemInstructionText = systemInstruction || '';
  const sysMsg = messages.find(m => m.role === 'system');
  if (sysMsg && !systemInstructionText) {
    systemInstructionText = sysMsg.content;
  }

  let lastError = '';

  for (const model of GEMINI_MODELS) {
    try {
      const payload: any = {
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      };

      if (jsonMode) {
        payload.generationConfig.responseMimeType = 'application/json';
      }

      if (systemInstructionText) {
        payload.systemInstruction = {
          parts: [{ text: systemInstructionText }]
        };
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Connection': 'close'
        },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        lastError = `Gemini model ${model} HTTP ${res.status}: ${errorText}`;
        console.warn(`[Gemini AI] ${model} failed, trying fallback:`, lastError);
        continue;
      }

      const data = await res.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (content) {
        return {
          content,
          model,
          success: true
        };
      }
    } catch (err: any) {
      lastError = err?.message || String(err);
      console.warn(`[Gemini AI] Exception calling ${model}:`, lastError);
    }
  }

  return {
    content: '',
    model: 'none',
    success: false,
    error: lastError || 'All Gemini model attempts failed'
  };
}
