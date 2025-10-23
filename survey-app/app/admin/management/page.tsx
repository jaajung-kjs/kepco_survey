import Link from 'next/link';
import { redirect } from 'next/navigation';
import ManagementRadarChart from '@/components/ManagementRadarChart';
import TextResponseWordCloud from '@/components/TextResponseWordCloud';
import AIAnalysis from '@/components/AIAnalysis';
import { extractKeywordsByQuestions } from '@/lib/textAnalysis';
import { getManagementScores as fetchManagementScores } from '@/lib/api/scores';
import { requireAdmin } from '@/lib/auth';

async function getManagementScoresData() {
  const data = await fetchManagementScores();

  interface Question {
    questionNumber: number;
    questionText: string;
    average: number;
  }

  interface Score {
    evaluationType: string;
    average: number;
    questions?: Question[];
  }

  interface ApiResponse {
    scores?: Score[];
    textResponses?: Array<{ question_number: number; question_text: string; response_text: string }>;
  }

  const apiData = data as ApiResponse;

  // API 응답을 페이지가 기대하는 형식으로 변환
  return {
    byType: apiData.scores?.map((score) => ({
      evaluation_type: score.evaluationType,
      avg_score: score.average,
      response_count: score.questions?.reduce((sum, q) => sum + (q.average > 0 ? 1 : 0), 0) || 0,
    })) || [],
    questions: apiData.scores?.flatMap((score) =>
      score.questions?.map((q) => ({
        question_number: q.questionNumber,
        question_text: q.questionText,
        evaluation_type: score.evaluationType,
        avg_score: q.average,
        response_count: 0,
      })) || []
    ) || [],
    textResponses: apiData.textResponses || [],
  };
}

export default async function ManagementAnalysisPage() {
  // 관리자 인증 체크 (User 페이지와 동일한 방식)
  const user = await requireAdmin().catch(() => null);

  if (!user) {
    redirect('/login');
  }

  const data = await getManagementScoresData();

  // 서술형 문항 목록
  const textQuestions = [
    { number: 40, text: 'Q40. 관리처 전반에서 업무협조가 어려운 이유' },
    { number: 45, text: 'Q45. 타 부서와의 업무협조 개선 방안' },
    { number: 50, text: 'Q50. 향후 관리처가 집중해야 할 핵심 분야' },
    { number: 51, text: 'Q51. 관리처 내 역량 차이 감소 방안' },
    { number: 52, text: 'Q52. 개선이 가장 필요한 부분' },
    { number: 53, text: 'Q53. 관리처 발전을 위한 아이디어' },
  ];

  // 키워드 추출 (AI 분석용)
  const textKeywords = extractKeywordsByQuestions(
    data.textResponses,
    [40, 45, 50, 51, 52, 53],
    10
  );

  // AI 분석에 전달할 데이터
  const analysisData = {
    ...data,
    textKeywords,
  };

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
                </tr>
              </thead>
              <tbody>
                {data.byType.map((type: { evaluation_type: string; avg_score: number; response_count: number }) => (
                  <tr key={type.evaluation_type} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{type.evaluation_type}</td>
                    <td className="text-center py-3 px-4">
                      <span className="font-semibold text-purple-600">
                        {type.avg_score.toFixed(2)}점
                      </span>
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
            {data.byType.map((type: { evaluation_type: string; avg_score: number; response_count: number }) => {
              const questions = data.questions.filter(
                (q: { evaluation_type: string; avg_score: number }) => q.evaluation_type === type.evaluation_type && q.avg_score > 0
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
                        </tr>
                      </thead>
                      <tbody>
                        {questions.map((q: { question_number: number; question_text: string; evaluation_type: string; avg_score: number; response_count: number }) => (
                          <tr key={q.question_number} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4 text-sm">
                              <span className="font-medium text-gray-700">Q{q.question_number}.</span> {q.question_text}
                            </td>
                            <td className="text-center py-2 px-4 text-sm font-medium text-purple-600">
                              {q.avg_score.toFixed(2)}점
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
        <AIAnalysis data={analysisData} type="management" />
      </div>
    </div>
  );
}
