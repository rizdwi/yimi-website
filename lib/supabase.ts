import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fopqfjqztvmktzvahjrh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcHFmanF6dHZta3R6dmFoanJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMzU5NjQsImV4cCI6MjEwNjkxMTk2NH0.bv0p8usebA5nDRf5SnVeTtnUNRRUrNeVTysLK4wNKpo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
