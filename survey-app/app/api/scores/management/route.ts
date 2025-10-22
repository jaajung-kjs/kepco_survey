import { NextRequest, NextResponse } from 'next/server';
import { calculateManagementScores, getTextResponses } from '@/lib/scoreCalculator';

export async function GET(request: NextRequest) {
  try {
    // 관리처 5점척도 점수 계산
    const scores = await calculateManagementScores();

    // 서술형 응답 조회 (Q40, Q45, Q50-Q53)
    const textResponses = await getTextResponses([40, 45, 50, 51, 52, 53]);

    return NextResponse.json({
      scores,
      textResponses,
    });
  } catch (error) {
    console.error('관리처 점수 계산 오류:', error);
    return NextResponse.json(
      { error: '점수 계산에 실패했습니다.' },
      { status: 500 }
    );
  }
}
