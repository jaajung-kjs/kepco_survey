'use client';

import { handleLogout } from '@/lib/logout';

export default function SurveyCompletedPage() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          설문 제출 완료
        </h1>

        <p className="text-gray-600 mb-2">
          소중한 의견을 주셔서 감사합니다.
        </p>
        <p className="text-gray-600 mb-8">
          귀하의 응답은 성공적으로 제출되었습니다.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800">
            설문 결과는 한국전력공사 강원본부 전력관리처의 조직 개선 및 발전을 위해 활용될 예정입니다.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
