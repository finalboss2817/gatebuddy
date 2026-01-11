
import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables in a browser context
const getEnv = (key: string, fallback: string) => {
  try {
    // @ts-ignore
    return (typeof process !== 'undefined' && process.env?.[key]) || fallback;
  } catch {
    return fallback;
  }
};

const supabaseUrl = getEnv('SUPABASE_URL', 'https://cfatfpoedxblilfyhgfx.supabase.co');
const supabaseKey = getEnv('SUPABASE_KEY', 'sb_publishable_wh6bSxuxhCMShCXzZg3BVg_HzEENdDx');

export const supabase = createClient(supabaseUrl, supabaseKey);
