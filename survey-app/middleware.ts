import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 루트 경로는 로그인 페이지로 리다이렉트
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 모든 auth API는 캐시 없이 처리
  if (pathname.startsWith('/api/auth/')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  }

  // 나머지는 페이지 레벨에서 인증 처리
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/api/auth/:path*',
  ],
};
