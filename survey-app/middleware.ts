import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('user_id')?.value;
  const pathname = request.nextUrl.pathname;

  // 로그인 페이지는 인증 불필요
  if (pathname === '/login') {
    // 이미 로그인한 경우 리다이렉트
    if (userId) {
      return NextResponse.redirect(new URL('/survey', request.url));
    }
    return NextResponse.next();
  }

  // 루트 경로는 로그인 페이지로 리다이렉트
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 보호된 경로: 로그인 필요
  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/survey/:path*', '/admin/:path*'],
};
