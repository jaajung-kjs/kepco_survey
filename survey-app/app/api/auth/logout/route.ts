import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // 쿠키 삭제
  response.cookies.delete('user_id');
  response.cookies.delete('is_admin');

  return response;
}

export async function GET(request: NextRequest) {
  // 쿠키 삭제 후 로그인 페이지로 리다이렉트
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.delete('user_id');
  response.cookies.delete('is_admin');

  return response;
}
