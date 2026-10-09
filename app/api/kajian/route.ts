import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import kajianFallback from '@/content/kajian.json';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('jadwal_kajian')
      .select('*')
      .order('tanggal', { ascending: true });

    if (error) {
      console.error('Supabase error fetching public jadwal_kajian:', error);
    } else if (data && data.length > 0) {
      return NextResponse.json({ kajian: data });
    }
  } catch (err) {
    console.error('Failed to load public kajian from Supabase:', err);
  }

  return NextResponse.json({ kajian: kajianFallback });
}
