import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase 클라이언트 (브라우저와 서버 양쪽에서 사용)
export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
