import Link from 'next/link';
import RankingBarChart from '@/components/RankingBarChart';

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

  // 순위 매기기
  overallRankings.sort((a: any, b: any) => b.score - a.score);
  overallRankings.forEach((item: any, index: number) => {
    item.rank = index + 1;
  });

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

        {/* 종합 순위 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">부서별 종합 순위</h2>
          <RankingBarChart data={overallRankings} title="전체 평균 점수 기준" />
        </div>

        {/* 종합 순위 테이블 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">종합 순위 상세</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-center py-3 px-4">순위</th>
                  <th className="text-left py-3 px-4">부서명</th>
                  <th className="text-center py-3 px-4">평균 점수</th>
                  <th className="text-center py-3 px-4">상세 분석</th>
                </tr>
              </thead>
              <tbody>
                {overallRankings.map((item: any) => (
                  <tr key={item.department} className="border-b hover:bg-gray-50">
                    <td className="text-center py-3 px-4">
                      <span className={`inline-block w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        item.rank === 1 ? 'bg-yellow-500' :
                        item.rank === 2 ? 'bg-gray-400' :
                        item.rank === 3 ? 'bg-orange-600' :
                        'bg-blue-500'
                      }`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{item.department}</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-lg font-semibold text-purple-600">
                        {item.score.toFixed(2)}점
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Link
                        href={`/admin/department/${encodeURIComponent(item.department)}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        상세 보기 →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 평가유형별 순위 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rankingsByType.map((ranking) => (
            <div key={ranking.type} className="bg-white rounded-lg shadow p-6">
              <RankingBarChart data={ranking.data} title={`${ranking.type} 순위`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
