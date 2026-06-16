import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Return a dummy client if config is missing, to avoid breaking startup
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-url')) {
  console.warn("Supabase credentials not configured yet. Please update the .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
