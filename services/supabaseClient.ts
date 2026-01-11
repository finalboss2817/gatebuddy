
import { createClient } from '@supabase/supabase-js';

// Pulling from environment variables with hardcoded fallbacks for the current session.
// When deploying to Vercel, set SUPABASE_URL and SUPABASE_KEY in the environment variables.
const supabaseUrl = process.env.SUPABASE_URL || 'https://cfatfpoedxblilfyhgfx.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_wh6bSxuxhCMShCXzZg3BVg_HzEENdDx';

export const supabase = createClient(supabaseUrl, supabaseKey);
