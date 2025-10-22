import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });

  // 쿠키 삭제
  response.cookies.delete('user_id');

  return response;
}
