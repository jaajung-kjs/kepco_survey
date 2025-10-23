'use client';

import { handleLogout } from '@/lib/logout';

interface Props {
  completedAt: string;
}

export default function SurveyCompleted({ completedAt }: Props) {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            설문 완료
          </h2>
          <p className="text-gray-600 mb-6">
            설문조사에 참여해 주셔서 감사합니다.
            <br />
            이미 설문을 완료하셨습니다.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            완료일시: {new Date(completedAt).toLocaleString('ko-KR')}
          </p>
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
