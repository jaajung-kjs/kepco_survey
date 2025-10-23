'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DepartmentRadarChartSmall from '@/components/DepartmentRadarChartSmall';
import LogoutButton from '@/components/LogoutButton';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
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

      // 통계 로드
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // 점수 로드
      const scoresRes = await fetch('/api/scores/department');
      const scoresData = await scoresRes.json();

      // 부서 순서 정의
      const departmentOrder = [
        '지역협력부', '계통운영부', '송전운영부', '변전운영부', '전자제어부',
        '토건운영부', '강릉전력', '동해전력', '원주전력', '태백전력'
      ];

      // 부서 순서대로 정렬
      const sortedScores = Array.isArray(scoresData)
        ? scoresData.sort((a, b) => {
            const indexA = departmentOrder.indexOf(a.department);
            const indexB = departmentOrder.indexOf(b.department);
            return indexA - indexB;
          })
        : [];

      setAllScores(sortedScores);

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
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-600 mt-2">설문조사 현황 및 분석</p>
        </div>

        {/* 전체 응답 현황 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">전체 응답 현황</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">전체 대상</div>
              <div className="text-3xl font-bold text-blue-900 mt-2">{stats.overall.total}명</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">응답 완료</div>
              <div className="text-3xl font-bold text-green-900 mt-2">{stats.overall.completed}명</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium">응답률</div>
              <div className="text-3xl font-bold text-purple-900 mt-2">{stats.overall.rate.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/management"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">관리처 전반 분석</h3>
            <p className="text-gray-600 text-sm">관리처 설문 결과 종합 분석</p>
          </Link>

          <Link
            href="/admin/ranking"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">전체 순위</h3>
            <p className="text-gray-600 text-sm">부서별 종합 순위 및 평가유형별 순위</p>
          </Link>

          <LogoutButton />
        </div>

        {/* 부서별 레이더 차트 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">부서별 평가 현황</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allScores.map((score: any) => (
              <DepartmentRadarChartSmall
                key={score.department}
                department={score.department}
                data={score.scores}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
