import Link from 'next/link';
import RankingBarChart from '@/components/RankingBarChart';
import AIAnalysis from '@/components/AIAnalysis';
import { getDepartmentQuestionScores, getOtherDeptQuestionScores } from '@/lib/scoreCalculator';
import { Department } from '@/lib/constants';

async function getAllDepartmentScores() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/scores/department`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch department scores');
  }

  const data = await res.json();

  // API 응답을 페이지가 기대하는 형식으로 변환
  return data.map((dept: any) => ({
    department: dept.department,
    byType: dept.scores?.map((score: any) => ({
      evaluation_type: score.evaluationType,
      final_avg: score.finalScore,
      rank: score.rank || 1,
    })) || [],
  }));
}

export default async function RankingPage() {
  const allScores = await getAllDepartmentScores();

  // 모든 부서의 상세 데이터 가져오기 (AI 분석용)
  const allDepartmentData = await Promise.all(
    allScores.map(async (dept: any) => {
      const questionScores = await getDepartmentQuestionScores(dept.department as Department);
      const otherQuestionScores = await getOtherDeptQuestionScores(dept.department as Department);

      return {
        department: dept.department,
        byType: dept.byType,
        questions: questionScores,
        otherQuestions: otherQuestionScores,
      };
    })
  );

  // 평가유형별 순위 데이터 생성
  const evaluationTypes = ['조직문화', '업무충실', '업무협조', '업무혁신'];

  const rankingsByType = evaluationTypes.map((evalType) => {
    const rankings = allScores.map((dept: any) => {
      const typeScore = dept.byType.find((t: any) => t.evaluation_type === evalType);
      return {
        department: dept.department,
        score: typeScore?.final_avg || 0,
        rank: typeScore?.rank || 0,
      };
    });
    return { type: evalType, data: rankings };
  });

  // 종합 순위 (전체 평균)
  const overallRankings = allScores.map((dept: any) => {
    const totalScore = dept.byType.reduce((sum: number, type: any) => sum + type.final_avg, 0);
    const avgScore = totalScore / dept.byType.length;
    return {
      department: dept.department,
      score: avgScore,
    };
  });

  // 순위 매기기 (동점 처리)
  overallRankings.sort((a: any, b: any) => b.score - a.score);
  let currentRank = 1;
  for (let i = 0; i < overallRankings.length; i++) {
    // 이전 점수와 비교하여 동점이면 같은 순위, 아니면 현재 인덱스 + 1
    if (i > 0 && Math.abs(overallRankings[i - 1].score - overallRankings[i].score) > 0.01) {
      currentRank = i + 1;
    }
    overallRankings[i].rank = currentRank;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← 대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">전체 순위</h1>
          <p className="text-gray-600 mt-2">부서별 종합 순위 및 평가유형별 순위</p>
        </div>

        {/* 종합 순위 테이블 - 최신 트렌드 디자인 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-lg font-bold text-gray-900">종합 순위</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="text-center py-3 px-4 w-20">순위</th>
                  <th className="text-left py-3 px-6">부서명</th>
                  <th className="text-center py-3 px-4 w-28">평균 점수</th>
                  <th className="text-center py-3 px-4 w-32"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overallRankings.map((item: any, index: number) => (
                  <tr
                    key={item.department}
                    className="hover:bg-blue-50/50 transition-colors group"
                  >
                    <td className="text-center py-3 px-4">
                      {item.rank === 1 ? (
                        <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 text-white font-bold text-sm shadow-sm">
                          1
                        </div>
                      ) : item.rank === 2 ? (
                        <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 text-white font-bold text-sm shadow-sm">
                          2
                        </div>
                      ) : item.rank === 3 ? (
                        <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 text-white font-bold text-sm shadow-sm">
                          3
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">
                          {item.rank}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                          {item.department.substring(0, 2)}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{item.department}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {item.score.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400">점</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Link
                        href={`/admin/department/${encodeURIComponent(item.department)}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all group-hover:bg-blue-100"
                      >
                        상세
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 평가유형별 순위 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {rankingsByType.map((ranking) => (
            <div key={ranking.type} className="bg-white rounded-lg shadow p-6">
              <RankingBarChart data={ranking.data} title={`${ranking.type} 순위`} />
            </div>
          ))}
        </div>

        {/* 모든 부서 AI 분석 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">부서별 AI 종합 분석</h2>
          <div className="grid grid-cols-1 gap-6">
            {allDepartmentData.map((deptData: any) => (
              <div key={deptData.department} className="bg-white rounded-lg shadow">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                  <h3 className="text-xl font-bold">{deptData.department}</h3>
                </div>
                <div className="p-6">
                  <AIAnalysis data={deptData} type="department" targetKey={deptData.department} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
