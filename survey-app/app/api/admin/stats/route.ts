import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // supabase already imported;

  try {
    // 전체 사용자 수 및 응답 완료 수
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('username, is_admin, has_completed');

    if (usersError) throw usersError;

    const totalUsers = users.filter(u => !u.is_admin).length;
    const completedUsers = users.filter(u => !u.is_admin && u.has_completed).length;
    const responseRate = totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0;

    // 부서별 응답 현황 (users 테이블에서 username으로 부서 추출)
    const departmentStats: { [key: string]: { total: number; completed: number } } = {};

    users.forEach(user => {
      if (user.is_admin) return;

      // username 형식: "부서명_직원" 또는 "간부1"
      const username = user.username || '';
      let department = '';

      if (username.includes('_')) {
        department = username.split('_')[0];
      } else if (username.startsWith('간부')) {
        // 간부는 모든 부서를 대표하므로 별도 카운트하지 않음
        return;
      }

      if (department) {
        if (!departmentStats[department]) {
          departmentStats[department] = { total: 0, completed: 0 };
        }
        departmentStats[department].total += 1;
        if (user.has_completed) {
          departmentStats[department].completed += 1;
        }
      }
    });

    // 부서별 응답률 계산
    const departmentResponse = Object.entries(departmentStats).map(([dept, stats]) => ({
      department: dept,
      total: stats.total,
      completed: stats.completed,
      rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
    }));

    return NextResponse.json({
      overall: {
        total: totalUsers,
        completed: completedUsers,
        rate: responseRate,
      },
      byDepartment: departmentResponse,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
