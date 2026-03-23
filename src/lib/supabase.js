import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'; // Placeholder if missing
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('CRITICAL: VITE_SUPABASE_URL is missing from environment variables!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
