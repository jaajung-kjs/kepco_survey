'use client';

import { useState } from 'react';
import type { SurveyQuestion } from '@/types';

interface Props {
  questions: SurveyQuestion[];
  onNext: (answers: Record<string, Record<string, number>>) => void;
  onBack: () => void;
  currentDepartment: string;
  initialAnswers?: Record<string, Record<string, number>>;
}

const OTHER_DEPARTMENTS = [
  '지역협력부',
  '계통운영부',
  '송전운영부',
  '변전운영부',
  '전자제어부',
  '토건운영부',
  '강릉전력',
  '동해전력',
  '원주전력',
  '태백전력',
] as const;

export default function OtherDeptEvaluation({
  questions,
  onNext,
  onBack,
  currentDepartment,
  initialAnswers = {}
}: Props) {
  // answers[questionNumber][department] = score
  const [answers, setAnswers] = useState<Record<string, Record<string, number>>>(initialAnswers);
  const [error, setError] = useState('');

  // Filter out current department from evaluation
  const departmentsToEvaluate = OTHER_DEPARTMENTS.filter(dept => dept !== currentDepartment);

  const handleAnswerChange = (questionNumber: number, department: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: {
        ...(prev[questionNumber] || {}),
        [department]: value,
      },
    }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if all questions are answered for all departments
    const totalRequired = questions.length * departmentsToEvaluate.length;
    let answeredCount = 0;

    for (const question of questions) {
      for (const dept of departmentsToEvaluate) {
        if (answers[question.question_number]?.[dept]) {
          answeredCount++;
        }
      }
    }

    if (answeredCount < totalRequired) {
      const unanswered = totalRequired - answeredCount;
      setError(`모든 항목에 답변해주세요. (미답변: ${unanswered}개)`);
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    onNext(answers);
  };

  const getProgress = () => {
    const totalRequired = questions.length * departmentsToEvaluate.length;
    let answeredCount = 0;

    for (const question of questions) {
      for (const dept of departmentsToEvaluate) {
        if (answers[question.question_number]?.[dept]) {
          answeredCount++;
        }
      }
    }

    return Math.round((answeredCount / totalRequired) * 100);
  };

  // Group questions by evaluation type
  const groupedQuestions = questions.reduce((acc, question) => {
    const type = question.evaluation_type || '기타';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(question);
    return acc;
  }, {} as Record<string, SurveyQuestion[]>);

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까? 작성 중인 내용은 저장되지 않습니다.')) {
      return;
    }
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900">타 부서/지사 평가</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              진행률: {getProgress()}%
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              로그아웃
            </button>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          본인이 속한 부서({currentDepartment})를 제외한 {departmentsToEvaluate.length}개 부서를 평가해주세요.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {Object.entries(groupedQuestions).map(([type, typeQuestions]) => (
          <div key={type} className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-1 border-b-2 border-blue-500">
              {type}
            </h3>

            {typeQuestions.map((question) => (
              <div key={question.question_number} className="mb-8">
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  Q{question.question_number}. {question.question_text}
                  <span className="text-red-500 ml-1">*</span>
                </h4>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          부서명
                        </th>
                        <th className="border border-gray-300 px-3 py-3 text-center text-sm font-medium text-gray-700">
                          전혀<br/>그렇지<br/>않다
                        </th>
                        <th className="border border-gray-300 px-3 py-3 text-center text-sm font-medium text-gray-700">
                          그렇지<br/>않다
                        </th>
                        <th className="border border-gray-300 px-3 py-3 text-center text-sm font-medium text-gray-700">
                          보통<br/>이다
                        </th>
                        <th className="border border-gray-300 px-3 py-3 text-center text-sm font-medium text-gray-700">
                          그렇다
                        </th>
                        <th className="border border-gray-300 px-3 py-3 text-center text-sm font-medium text-gray-700">
                          매우<br/>그렇다
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentsToEvaluate.map((dept) => (
                        <tr key={dept} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                            {dept}
                          </td>
                          {[1, 2, 3, 4, 5].map((score) => (
                            <td key={score} className="border border-gray-300 px-2 py-2 text-center">
                              <input
                                type="radio"
                                name={`q${question.question_number}-${dept}`}
                                value={score}
                                checked={answers[question.question_number]?.[dept] === score}
                                onChange={() => handleAnswerChange(question.question_number, dept, score)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            이전
          </button>
          <button
            type="submit"
            className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            다음
          </button>
        </div>
      </form>
    </div>
  );
}
