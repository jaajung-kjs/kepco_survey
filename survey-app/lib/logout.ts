'use client';

import { createClient } from './supabase';

export async function handleLogout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = '/login';
}
