import { supabase } from './supabase';

export async function createAuditLog(
  pengguna: string,
  modul: string,
  ringkasan: string,
  entitas_id?: string,
  detail?: Record<string, unknown>
) {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      waktu: new Date().toISOString(),
      pengguna: pengguna || 'admin',
      modul,
      entitas_id: entitas_id || null,
      ringkasan,
      detail: detail || {},
    });
    if (error) {
      console.error('Audit log Supabase error:', error.message);
    }
  } catch (error) {
    console.error('Failed to write audit log to Supabase:', error);
  }
}
