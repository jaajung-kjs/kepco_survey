import Link from 'next/link';
import DepartmentRadarChartSmall from '@/components/DepartmentRadarChartSmall';

async function getStats() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/stats`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch stats');
  }

  return res.json();
}

async function getAllDepartmentScores() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/scores/department`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch department scores');
  }

  const data = await res.json();

  interface DeptScore {
    department: string;
    scores?: Array<{
      evaluationType: string;
      finalScore: number;
    }>;
  }

  return data.map((dept: DeptScore) => ({
    department: dept.department,
    byType: dept.scores?.map((score) => ({
      evaluation_type: score.evaluationType,
      final_avg: score.finalScore,
    })) || [],
  }));
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const allScores = await getAllDepartmentScores();

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
              <div className="text-3xl font-bold text-purple-900 mt-2">
                {stats.overall.rate.toFixed(1)}%
              </div>
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
            <p className="text-gray-600 text-sm">관리처 전체에 대한 평가 및 서술형 응답 분석</p>
          </Link>

          <Link
            href="/admin/ranking"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">전체 순위</h3>
            <p className="text-gray-600 text-sm">부서별 종합 순위 및 평가유형별 순위</p>
          </Link>

          <Link
            href="/api/auth/logout"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">로그아웃</h3>
            <p className="text-gray-600 text-sm">관리자 세션 종료</p>
          </Link>
        </div>

        {/* 부서별 레이더 차트 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">부서별 평가 현황</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {allScores.map((dept: { department: string; byType: Array<{ evaluation_type: string; final_avg: number }> }) => (
              <Link
                key={dept.department}
                href={`/admin/department/${encodeURIComponent(dept.department)}`}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer"
              >
                <DepartmentRadarChartSmall
                  data={dept.byType}
                  department={dept.department}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
