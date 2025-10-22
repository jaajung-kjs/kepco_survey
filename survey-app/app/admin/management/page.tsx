import Link from 'next/link';
import ManagementRadarChart from '@/components/ManagementRadarChart';
import TextResponseWordCloud from '@/components/TextResponseWordCloud';
import AIAnalysis from '@/components/AIAnalysis';

async function getManagementScores() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/scores/management`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch management scores');
  }

  const data = await res.json();

  // API 응답을 페이지가 기대하는 형식으로 변환
  return {
    byType: data.scores?.map((score: any) => ({
      evaluation_type: score.evaluationType,
      avg_score: score.average,
      response_count: score.questions?.reduce((sum: number, q: any) => sum + (q.average > 0 ? 1 : 0), 0) || 0,
    })) || [],
    questions: data.scores?.flatMap((score: any) =>
      score.questions?.map((q: any) => ({
        question_number: q.questionNumber,
        question_text: q.questionText,
        evaluation_type: score.evaluationType,
        avg_score: q.average,
        response_count: 0,
      })) || []
    ) || [],
    textResponses: data.textResponses || [],
  };
}

export default async function ManagementAnalysisPage() {
  const data = await getManagementScores();

  // 서술형 문항 목록
  const textQuestions = [
    { number: 40, text: 'Q40. 관리처 전반에서 업무협조가 어려운 이유' },
    { number: 45, text: 'Q45. 타 부서와의 업무협조 개선 방안' },
    { number: 50, text: 'Q50. 향후 관리처가 집중해야 할 핵심 분야' },
    { number: 51, text: 'Q51. 관리처 내 역량 차이 감소 방안' },
    { number: 52, text: 'Q52. 개선이 가장 필요한 부분' },
    { number: 53, text: 'Q53. 관리처 발전을 위한 아이디어' },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">관리처 전반 분석</h1>
          <p className="text-gray-600 mt-2">관리처 전체에 대한 평가 및 서술형 응답 분석</p>
        </div>

        {/* 레이더 차트 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">평가유형별 점수 분포</h2>
          <ManagementRadarChart data={data.byType} />
        </div>

        {/* 평가유형별 상세 테이블 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">평가유형별 평균 점수</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">평가유형</th>
                  <th className="text-center py-3 px-4">평균 점수</th>
                  <th className="text-center py-3 px-4">응답 수</th>
                </tr>
              </thead>
              <tbody>
                {data.byType.map((type: any) => (
                  <tr key={type.evaluation_type} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{type.evaluation_type}</td>
                    <td className="text-center py-3 px-4">
                      <span className="font-semibold text-purple-600">
                        {type.avg_score.toFixed(2)}점
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-gray-600">
                      {type.response_count}명
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 세부 문항별 점수 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">세부 문항별 점수</h2>
          <div className="space-y-6">
            {data.byType.map((type: any) => {
              const questions = data.questions.filter(
                (q: any) => q.evaluation_type === type.evaluation_type && q.avg_score > 0
              );

              if (questions.length === 0) return null;

              return (
                <div key={type.evaluation_type}>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">
                    {type.evaluation_type}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-2 px-4 text-sm">문항</th>
                          <th className="text-center py-2 px-4 text-sm">평균 점수</th>
                          <th className="text-center py-2 px-4 text-sm">응답 수</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questions.map((q: any) => (
                          <tr key={q.question_number} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4 text-sm">{q.question_text}</td>
                            <td className="text-center py-2 px-4 text-sm font-medium">
                              {q.avg_score.toFixed(2)}점
                            </td>
                            <td className="text-center py-2 px-4 text-sm text-gray-600">
                              {q.response_count}명
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 서술형 응답 워드클라우드 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">서술형 응답 키워드 분석</h2>
          <div className="space-y-8">
            {textQuestions.map((question) => (
              <div key={question.number} className="border-t pt-6 first:border-t-0 first:pt-0">
                <h3 className="font-semibold text-lg mb-4 text-gray-800">
                  {question.text}
                </h3>
                <TextResponseWordCloud
                  responses={data.textResponses}
                  questionNumber={question.number}
                />
              </div>
            ))}
          </div>
        </div>

        {/* AI 분석 */}
        <AIAnalysis data={data} type="management" />
      </div>
    </div>
  );
}
