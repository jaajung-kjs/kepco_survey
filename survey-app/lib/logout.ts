import { supabase } from './supabase';

export async function handleLogout() {
  await supabase.auth.signOut();
  window.location.href = '/login';
}
