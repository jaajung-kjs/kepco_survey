import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractKeywordsByQuestion } from '@/lib/keywordExtractor';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 관리처 평균 점수 조회 (트리거로 자동 계산됨)
    const { data: managementData, error: scoresError } = await supabase
      .from('management_scores')
      .select('*')
      .single();

    if (scoresError) throw scoresError;

    // 평가유형별로 포맷팅
    const byType = [
      {
        evaluationType: '조직문화',
        average: managementData?.org_culture_avg || 0
      },
      {
        evaluationType: '업무충실',
        average: managementData?.work_integrity_avg || 0
      },
      {
        evaluationType: '업무협조',
        average: managementData?.work_cooperation_avg || 0
      },
      {
        evaluationType: '업무혁신',
        average: managementData?.work_innovation_avg || 0
      }
    ];

    // 서술형 응답 조회 (Q40, Q45, Q50-Q53)
    const { data: textResponses, error: textError } = await supabase
      .from('text_responses')
      .select('*')
      .in('question_number', [40, 45, 50, 51, 52, 53])
      .order('question_number');

    if (textError) throw textError;

    // 키워드 추출
    const keywordsByQuestion = extractKeywordsByQuestion(textResponses || []);
    const textKeywords = Object.fromEntries(keywordsByQuestion);

    // 문항 제목 조회 (Q26-Q49, Q40/Q45 제외)
    const { data: questions } = await supabase
      .from('survey_questions')
      .select('question_number, question_text')
      .in('question_number', [26,27,28,29,30,31,32,33,34,35,36,37,38,39,41,42,43,44,46,47,48,49]);

    // 문항별 점수 (순위 없음)
    const questionScores = [26,27,28,29,30,31,32,33,34,35,36,37,38,39,41,42,43,44,46,47,48,49].map(qNum => {
      const question = questions?.find(q => q.question_number === qNum);
      const avgKey = `q${qNum}_avg`;
      return {
        questionNumber: qNum,
        questionText: question?.question_text || '',
        avgScore: (managementData as any)?.[avgKey] || 0
      };
    });

    return NextResponse.json({
      byType,
      textResponses,
      textKeywords,
      overallAverage: managementData?.overall_avg || 0,
      questionScores
    });
  } catch (error) {
    console.error('관리처 점수 조회 오류:', error);
    return NextResponse.json(
      { error: '점수 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
