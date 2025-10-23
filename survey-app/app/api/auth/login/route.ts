import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 조회
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 확인
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 세션 생성 (쿠키에 user_id 저장)
    const isProduction = process.env.NODE_ENV === 'production';
    const maxAge = 60 * 60 * 24 * 7; // 7일

    // Set-Cookie 헤더를 직접 생성
    const userIdCookie = `user_id=${user.id}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${isProduction ? '; Secure' : ''}`;
    const isAdminCookie = `is_admin=${user.is_admin}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${isProduction ? '; Secure' : ''}`;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        is_admin: user.is_admin,
        has_completed: user.has_completed,
      },
    }, {
      headers: {
        'Set-Cookie': [userIdCookie, isAdminCookie].join(', '),
      },
    });

    console.log('[Login] Set cookies for user:', user.username);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
