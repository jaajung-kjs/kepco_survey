import Link from 'next/link';
import DepartmentRadarChart from '@/components/DepartmentRadarChart';
import AIAnalysis from '@/components/AIAnalysis';
import { getDepartmentQuestionScores, getOtherDeptQuestionScores } from '@/lib/scoreCalculator';
import { Department } from '@/lib/constants';

async function getDepartmentScores(department: string) {
  // 전체 부서 점수를 조회하여 순위가 포함된 데이터 사용
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/scores/department`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch department scores');
  }

  const allData = await res.json();

  // 해당 부서의 데이터만 필터링
  const data = allData.find((d: any) => d.department === department);

  if (!data) {
    throw new Error('Department not found');
  }

  // 세부 문항별 점수 조회
  const questionScores = await getDepartmentQuestionScores(department as Department);
  const otherQuestionScores = await getOtherDeptQuestionScores(department as Department);

  // API 응답을 페이지가 기대하는 형식으로 변환
  return {
    department: data.department,
    byType: data.scores?.map((score: any) => ({
      evaluation_type: score.evaluationType,
      own_avg: score.ownScore,
      other_avg: score.otherScore || 0,
      final_avg: score.finalScore,
      rank: score.rank || null,
    })) || [],
    questions: questionScores,
    otherQuestions: otherQuestionScores,
  };
}

export default async function DepartmentAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const department = decodeURIComponent(id);
  const data = await getDepartmentScores(department);

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
          <h1 className="text-3xl font-bold text-gray-900">{department} 분석</h1>
          <p className="text-gray-600 mt-2">부서별 평가 및 순위 분석</p>
        </div>

        {/* 레이더 차트 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">평가유형별 점수 분포</h2>
          <DepartmentRadarChart data={data.byType} />
        </div>

        {/* 평가유형별 상세 테이블 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">평가유형별 상세 점수</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">평가유형</th>
                  <th className="text-center py-3 px-4">본인평가</th>
                  <th className="text-center py-3 px-4">타부서평가</th>
                  <th className="text-center py-3 px-4">최종점수</th>
                  <th className="text-center py-3 px-4">차이</th>
                  <th className="text-center py-3 px-4">순위</th>
                </tr>
              </thead>
              <tbody>
                {data.byType.map((type: any) => {
                  const diff = type.final_avg - type.own_avg;
                  const hasOtherEval = type.other_avg > 0;

                  return (
                    <tr key={type.evaluation_type} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{type.evaluation_type}</td>
                      <td className="text-center py-3 px-4">{type.own_avg.toFixed(2)}점</td>
                      <td className="text-center py-3 px-4">
                        {hasOtherEval ? `${type.other_avg.toFixed(2)}점` : '-'}
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="font-semibold text-blue-600">
                          {type.final_avg.toFixed(2)}점
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        {hasOtherEval ? (
                          <span className={`font-medium ${
                            diff > 0 ? 'text-green-600' :
                            diff < 0 ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {type.rank}위
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 세부 문항별 점수 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">세부 문항별 점수 (Q2-Q20)</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">문항</th>
                  <th className="text-center py-3 px-4">평균 점수</th>
                  <th className="text-center py-3 px-4">전체 평균</th>
                  <th className="text-center py-3 px-4">순위</th>
                </tr>
              </thead>
              <tbody>
                {data.questions.map((q: any) => {
                  return (
                    <tr key={q.questionNumber} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        <span className="font-medium text-gray-700">Q{q.questionNumber}.</span> {q.questionText}
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="font-semibold text-blue-600">{q.average.toFixed(2)}점</span>
                      </td>
                      <td className="text-center py-3 px-4 text-gray-600">
                        {q.overallAverage.toFixed(2)}점
                      </td>
                      <td className="text-center py-3 px-4">
                        {q.rank ? (
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {q.rank}위
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 타부서 평가 세부 문항별 점수 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">타부서 평가 세부 문항별 점수</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">문항</th>
                  <th className="text-center py-3 px-4">평균 점수</th>
                  <th className="text-center py-3 px-4">전체 평균</th>
                  <th className="text-center py-3 px-4">순위</th>
                </tr>
              </thead>
              <tbody>
                {data.otherQuestions.map((q: any) => {
                  return (
                    <tr key={q.questionNumber} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {q.questionText}
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="font-semibold text-blue-600">{q.average.toFixed(2)}점</span>
                      </td>
                      <td className="text-center py-3 px-4 text-gray-600">
                        {q.overallAverage.toFixed(2)}점
                      </td>
                      <td className="text-center py-3 px-4">
                        {q.rank ? (
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {q.rank}위
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI 분석 */}
        <AIAnalysis data={data} type="department" targetKey={department} />
      </div>
    </div>
  );
}
