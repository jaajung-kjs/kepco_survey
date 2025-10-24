import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');

    if (department) {
      // 특정 부서 점수 조회 (sum과 count도 함께)
      const { data: deptData, error: deptError } = await supabase
        .from('department_scores')
        .select('*')
        .eq('department', department)
        .single();

      if (deptError) throw deptError;
      if (!deptData) {
        return NextResponse.json({ error: '부서를 찾을 수 없습니다.' }, { status: 404 });
      }

      // RPC로 순위 계산
      const { data: rankings, error: rankError } = await supabase
        .rpc('get_department_rankings');

      if (rankError) throw rankError;

      // 해당 부서의 순위 찾기
      const deptRanking = rankings?.find((r: any) => r.department === department);

      const scores = [
        {
          evaluationType: '조직문화',
          ownScore: deptData.org_culture_avg || 0,
          otherScore: 0, // 타부서 평가 없음
          finalScore: deptData.org_culture_avg || 0,
          rank: (deptData.org_culture_avg || 0) > 0 ? (deptRanking?.org_culture_rank || 0) : 0
        },
        {
          evaluationType: '업무충실',
          ownScore: deptData.work_integrity_own_avg || 0,
          otherScore: deptData.work_integrity_other_avg || 0,
          finalScore: deptData.work_integrity_avg || 0,
          rank: (deptData.work_integrity_avg || 0) > 0 ? (deptRanking?.work_integrity_rank || 0) : 0
        },
        {
          evaluationType: '업무협조',
          ownScore: deptData.work_cooperation_own_avg || 0,
          otherScore: deptData.work_cooperation_other_avg || 0,
          finalScore: deptData.work_cooperation_avg || 0,
          rank: (deptData.work_cooperation_avg || 0) > 0 ? (deptRanking?.work_cooperation_rank || 0) : 0
        },
        {
          evaluationType: '업무혁신',
          ownScore: deptData.work_innovation_own_avg || 0,
          otherScore: deptData.work_innovation_other_avg || 0,
          finalScore: deptData.work_innovation_avg || 0,
          rank: (deptData.work_innovation_avg || 0) > 0 ? (deptRanking?.work_innovation_rank || 0) : 0
        }
      ];

      // 문항별 순위 조회
      const { data: questionRankings, error: qRankError } = await supabase
        .rpc('get_question_rankings', { target_dept: department });

      const { data: otherQuestionRankings, error: oRankError } = await supabase
        .rpc('get_other_question_rankings', { target_dept: department });

      // 문항 제목 조회
      const { data: questions } = await supabase
        .from('survey_questions')
        .select('question_number, question_text')
        .in('question_number', [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]);

      // 본인부서 문항별 점수 (Q2-Q20)
      const ownQuestions = [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(qNum => {
        const question = questions?.find(q => q.question_number === qNum);
        const ranking = questionRankings?.find((r: any) => r.question_number === qNum);
        const avgScore = ranking?.avg_score || 0;
        const countKey = `q${qNum}_count`;
        const hasResponses = (deptData as any)?.[countKey] > 0;
        return {
          questionNumber: qNum,
          questionText: question?.question_text || '',
          avgScore: avgScore,
          rank: hasResponses ? (ranking?.rank || 0) : 0
        };
      });

      // 타부서 문항별 점수 (other_Q1-Q5 = Q21-Q25)
      const otherQuestions = [1,2,3,4,5].map(qNum => {
        const question = questions?.find(q => q.question_number === qNum + 20); // Q21-Q25
        const ranking = otherQuestionRankings?.find((r: any) => r.question_number === qNum);
        const avgScore = ranking?.avg_score || 0;
        const countKey = `other_q${qNum}_count`;
        const hasResponses = (deptData as any)?.[countKey] > 0;
        return {
          questionNumber: qNum + 20, // 실제 문항번호
          questionText: question?.question_text || '',
          avgScore: avgScore,
          rank: hasResponses ? (ranking?.rank || 0) : 0
        };
      });

      return NextResponse.json({
        department,
        scores,
        finalAverage: deptData.overall_avg || 0,
        ownQuestions,
        otherQuestions
      });
    } else {
      // 전체 부서 점수 조회
      const { data: allDepts, error } = await supabase
        .from('department_scores')
        .select('department, org_culture_avg, work_integrity_avg, work_cooperation_avg, work_innovation_avg, overall_avg');

      if (error) throw error;

      const result = allDepts?.map(dept => ({
        department: dept.department,
        scores: [
          { evaluationType: '조직문화', finalScore: dept.org_culture_avg || 0 },
          { evaluationType: '업무충실', finalScore: dept.work_integrity_avg || 0 },
          { evaluationType: '업무협조', finalScore: dept.work_cooperation_avg || 0 },
          { evaluationType: '업무혁신', finalScore: dept.work_innovation_avg || 0 }
        ],
        finalAverage: dept.overall_avg || 0
      })) || [];

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('부서 점수 조회 오류:', error);
    return NextResponse.json(
      { error: '점수 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
