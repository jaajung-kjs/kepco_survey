'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import RankingBarChart from '@/components/RankingBarChart';

export default function RankingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allScores, setAllScores] = useState<any[]>([]);

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

      const res = await fetch('/api/scores/department');
      const data = await res.json();

      setAllScores(data);
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

  const sortedByFinal = [...allScores].sort((a, b) => b.finalAverage - a.finalAverage);

  const getTypeRanking = (type: string) => {
    return [...allScores]
      .map(dept => {
        const typeScore = dept.scores?.find((s: any) => s.evaluationType === type);
        return {
          department: dept.department,
          score: typeScore?.finalScore || 0
        };
      })
      .sort((a, b) => b.score - a.score);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
            ← 대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">전체 순위</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">종합 순위 상세</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">순위</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">부서</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평균 점수</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상세</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedByFinal.map((dept, index) => (
                  <tr key={dept.department}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={'text-sm font-bold ' + (
                        index === 0 ? 'text-yellow-600' : 
                        index === 1 ? 'text-gray-400' : 
                        index === 2 ? 'text-orange-600' : 
                        'text-gray-900'
                      )}>
                        {index + 1}위
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dept.finalAverage.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <Link href={'/admin/department/' + dept.department}>
                        상세 분석 →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['조직문화', '업무충실', '업무협조', '업무혁신'].map(type => {
            const ranking = getTypeRanking(type);
            const chartData = ranking.map((item, index) => ({
              department: item.department,
              score: item.score,
              rank: index + 1
            }));
            return (
              <div key={type} className="bg-white rounded-lg shadow p-6">
                <RankingBarChart data={chartData} title={`${type} 순위`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
