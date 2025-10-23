'use client';

import { handleLogout } from '@/lib/logout';

export default function LogoutButton() {
  return (
    <button
      onClick={handleLogout}
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left w-full"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">로그아웃</h3>
      <p className="text-gray-600 text-sm">관리자 세션 종료</p>
    </button>
  );
}
