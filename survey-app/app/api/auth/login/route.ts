import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: '아이디와 비밀번호를 입력해주세요.' },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();

  // username을 email 형식으로 변환
  const email = `${username}@survey.local`;

  // Supabase Auth 로그인
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  }

  // users 테이블에서 사용자 정보 조회
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', data.user.id)
    .single();

  if (!user) {
    return NextResponse.json(
      { error: '사용자 정보를 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      auth_user_id: user.auth_user_id,
      username: user.username,
      is_admin: user.is_admin,
      has_completed: user.has_completed,
    },
  });
}
