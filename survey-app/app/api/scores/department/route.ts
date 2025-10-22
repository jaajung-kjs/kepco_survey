import { NextRequest, NextResponse } from 'next/server';
import { calculateDepartmentScores, calculateAllDepartmentScores } from '@/lib/scoreCalculator';
import type { Department } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department') as Department | null;

    if (department) {
      // 특정 부서 점수 조회
      const score = await calculateDepartmentScores(department);
      return NextResponse.json(score);
    } else {
      // 전체 부서 점수 조회
      const scores = await calculateAllDepartmentScores();
      return NextResponse.json(scores);
    }
  } catch (error) {
    console.error('부서 점수 계산 오류:', error);
    return NextResponse.json(
      { error: '점수 계산에 실패했습니다.' },
      { status: 500 }
    );
  }
}
