'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ManagementRadarChart from '@/components/ManagementRadarChart';
import AIAnalysis from '@/components/AIAnalysis';
import { TagCloud } from 'react-tagcloud';

export default function ManagementAnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [managementData, setManagementData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (!userData?.is_admin) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/scores/management');
      const data = await res.json();

      setManagementData(data);
      setLoading(false);
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
            ← 대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">관리처 전반 분석</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">평가유형별 평균 점수</h2>
          <ManagementRadarChart data={managementData.byType || []} />
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">평가유형별 평균 점수</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평가유형</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평균 점수</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {managementData.byType?.map((item: any) => (
                  <tr key={item.evaluationType}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.evaluationType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(item.average || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 문항별 상세 점수 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">문항별 상세 점수</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">문항번호</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">문항 내용</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평균 점수</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {managementData.questionScores?.map((item: any) => (
                  <tr key={item.questionNumber}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Q{item.questionNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.questionText}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(item.avgScore || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 서술형 응답 키워드 분석 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">서술형 응답 키워드 분석</h2>
          <div className="space-y-6">
            {[
              { num: 40, title: '관리처 전반에서 업무협조가 어려운 이유' },
              { num: 45, title: '타 부서와의 업무협조 개선 방안' },
              { num: 50, title: '향후 관리처가 집중해야 할 핵심 분야' },
              { num: 51, title: '관리처 내 역량 차이 감소 방안' },
              { num: 52, title: '개선이 가장 필요한 부분' },
              { num: 53, title: '관리처 발전을 위한 아이디어' },
            ].map(({ num, title }) => {
              const keywords = managementData.textKeywords?.[num];
              const hasData = keywords && keywords.length > 0;

              return (
                <div key={num} className="bg-white rounded-lg shadow p-6">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Q{num}</h3>
                    <h4 className="text-lg font-semibold text-gray-700">{title}</h4>
                  </div>
                  {hasData ? (
                    <>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg min-h-[250px] flex items-center justify-center">
                        <TagCloud
                          minSize={16}
                          maxSize={45}
                          tags={keywords.map((k: any) => ({ value: k.keyword, count: k.count }))}
                          colorOptions={{
                            luminosity: 'dark',
                            hue: 'blue',
                          }}
                        />
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">응답 수:</span> {managementData.textResponses?.filter((r: any) => r.question_number === num).length || 0}개
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">키워드 수:</span> {keywords.length}개
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                      아직 서술형 응답이 없습니다.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <AIAnalysis
          data={managementData}
          type="management"
          targetKey="overall"
        />
      </div>
    </div>
  );
}
