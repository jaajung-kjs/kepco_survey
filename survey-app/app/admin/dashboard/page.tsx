import Link from 'next/link';
import { DEPARTMENTS } from '@/lib/constants';

async function getStats() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/stats`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch stats');
  }

  return res.json();
}

export default async function AdminDashboard() {
  const stats = await getStats();

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

        {/* 부서별 응답 현황 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">부서별 응답 현황</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">부서명</th>
                  <th className="text-center py-3 px-4">전체</th>
                  <th className="text-center py-3 px-4">완료</th>
                  <th className="text-center py-3 px-4">응답률</th>
                  <th className="text-center py-3 px-4">분석 보기</th>
                </tr>
              </thead>
              <tbody>
                {DEPARTMENTS.map((dept) => {
                  const deptStats = stats.byDepartment.find((d: any) => d.department === dept);
                  const total = deptStats?.total || 0;
                  const completed = deptStats?.completed || 0;
                  const rate = deptStats?.rate || 0;

                  return (
                    <tr key={dept} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{dept}</td>
                      <td className="text-center py-3 px-4">{total}명</td>
                      <td className="text-center py-3 px-4">{completed}명</td>
                      <td className="text-center py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          rate === 100 ? 'bg-green-100 text-green-800' :
                          rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Link
                          href={`/admin/department/${encodeURIComponent(dept)}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          상세 분석 →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}
