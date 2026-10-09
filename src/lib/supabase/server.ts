import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 
              process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  if (!cachedClient) {
    try {
      cachedClient = createSupabaseClient(url, key, {
        auth: { persistSession: false },
        global: {
          fetch: (input, init) => {
            // Enforce a 4-second timeout so stalled DNS or paused instances don't block the server
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 4000);
            return fetch(input, { ...init, signal: controller.signal })
              .finally(() => clearTimeout(timer));
          }
        }
      });
    } catch (e) {
      console.warn('[Supabase Server] Client initialization error:', e);
      return null;
    }
  }

  return cachedClient;
}

export async function pingSupabase(): Promise<{ ok: boolean; status: string; count?: number; error?: string }> {
  const client = getSupabaseServerClient();
  if (!client) {
    return { ok: false, status: 'NOT_CONFIGURED', error: 'Missing Supabase URL or key' };
  }

  try {
    const { data, count, error } = await client
      .from('risks')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return { ok: false, status: 'ERROR', error: error.message };
    }

    return { ok: true, status: 'CONNECTED', count: count || 0 };
  } catch (err: any) {
    const isDnsError = err.cause?.code === 'ENOTFOUND' || err.message?.includes('ENOTFOUND');
    if (isDnsError) {
      return { 
        ok: false, 
        status: 'PAUSED_OR_DNS_UNREACHABLE', 
        error: `Supabase instance host unreachable (${err.cause?.hostname || 'ENOTFOUND'}). The project may be paused in the Supabase Dashboard.` 
      };
    }
    return { ok: false, status: 'FAILED', error: err.message };
  }
}
