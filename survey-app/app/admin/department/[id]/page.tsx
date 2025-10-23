'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DepartmentRadarChart from '@/components/DepartmentRadarChart';
import AIAnalysis from '@/components/AIAnalysis';

export default function DepartmentAnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const department = decodeURIComponent(params.id as string);

  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState<any>(null);

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

      // API에서 부서 점수 로드
      const res = await fetch('/api/scores/department?department=' + encodeURIComponent(department));
      const data = await res.json();

      setDepartmentData(data);
      setLoading(false);
    }

    loadData();
  }, [router, department]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!departmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">부서를 찾을 수 없습니다.</div>
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
          <h1 className="text-3xl font-bold text-gray-900">{department} 분석</h1>
        </div>

        {/* 레이더 차트 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">평가유형별 점수</h2>
          <DepartmentRadarChart
            data={departmentData.scores || []}
          />
        </div>

        {/* 평가유형별 상세 점수 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">평가유형별 상세 점수</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평가유형</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">본인평가</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">타부서평가</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">최종점수</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">차이</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">순위</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmentData.scores?.map((score: any) => {
                  const diff = score.ownScore - score.otherScore;
                  return (
                    <tr key={score.evaluationType}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {score.evaluationType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.ownScore.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.otherScore.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {score.finalScore.toFixed(2)}
                      </td>
                      <td className={'px-6 py-4 whitespace-nowrap text-sm ' + (
                        diff > 0 ? 'text-blue-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'
                      )}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.rank > 0 ? `${score.rank}위` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 본인부서 문항별 상세 점수 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">본인부서 문항별 상세 점수 (Q2-Q20)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">문항번호</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">문항 내용</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평균 점수</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">순위</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmentData.ownQuestions?.map((item: any) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.rank > 0 ? `${item.rank}위` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 타부서 문항별 상세 점수 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">타부서 평가 문항별 상세 점수 (Q21-Q25)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">문항번호</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">문항 내용</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평균 점수</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">순위</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmentData.otherQuestions?.map((item: any) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.rank > 0 ? `${item.rank}위` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI 분석 */}
        <AIAnalysis
          data={{
            byType: departmentData.scores || [],
            questions: departmentData.ownQuestions || [],
            otherQuestions: departmentData.otherQuestions || [],
            department
          }}
          type="department"
          targetKey={department}
        />
      </div>
    </div>
  );
}
