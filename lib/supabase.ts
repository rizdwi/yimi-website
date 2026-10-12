import { createClient } from '@supabase/supabase-js';

// TIDAK ADA fallback hardcoded. Anon key memang public-by-design (dibawa ke
// browser via NEXT_PUBLIC_), tapi menanamnya di kode membuat rotasi key
// mustahil tanpa deploy ulang. Ambil selalu dari environment.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum diset. ' +
      'Set di .env.local (dev) atau Vercel Environment Variables (production).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
