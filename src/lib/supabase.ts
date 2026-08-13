import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qrpedhptgihapolvziil.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_XbcxVJYKOdWv3ncpHaQjwg_-dgKHufC';

export const supabase = createClient(supabaseUrl, supabaseKey);
