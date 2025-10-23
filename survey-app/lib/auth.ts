import { cookies } from 'next/headers';
import { supabase } from './supabase';
import { User } from '@/types';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      console.log('[Auth] No user_id cookie found');
      return null;
    }

    console.log('[Auth] Found user_id:', userId);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.log('[Auth] User lookup failed:', error);
      return null;
    }

    console.log('[Auth] User found:', user.username);
    return user as User;
  } catch (error) {
    console.error('[Auth] Error in getCurrentUser:', error);
    return null;
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();

  if (!user.is_admin) {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}
