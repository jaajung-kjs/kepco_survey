'use client';

import { useState } from 'react';
import TextQuestion from './TextQuestion';
import type { SurveyQuestion } from '@/types';

interface Props {
  questions: SurveyQuestion[];
  onNext: (answers: Record<number, string>) => void;
  onBack: () => void;
  submitting?: boolean;
  submitError?: string;
}

interface OpinionSurveyProps extends Props {
  initialAnswers?: Record<number, string>;
}

export default function OpinionSurvey({ questions, onNext, onBack, submitting = false, submitError = '', initialAnswers = {} }: OpinionSurveyProps) {
  const [answers, setAnswers] = useState<Record<number, string>>(initialAnswers);
  const [error, setError] = useState('');

  const handleChange = (questionNumber: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: value,
    }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 모든 문항 필수 작성 (10자 이상)
    for (const question of questions) {
      const answer = answers[question.question_number] || '';
      if (answer.length < 10) {
        setError(`Q${question.question_number}번 문항은 최소 10자 이상 작성해주세요. (현재 ${answer.length}자)`);
        return;
      }
    }

    onNext(answers);
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">종합 의견</h2>
            <p className="text-sm text-gray-600 mt-2">
              아래 질문에 대한 의견을 작성해주세요. (모든 문항 필수, 최소 10자 이상)
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            로그아웃
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {questions.map((question) => (
          <TextQuestion
            key={question.question_number}
            questionNumber={question.question_number}
            questionText={question.question_text}
            value={answers[question.question_number] || ''}
            onChange={(value) => handleChange(question.question_number, value)}
            required={true}
          />
        ))}

        {(error || submitError) && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <p className="text-sm font-medium text-red-800">{error || submitError}</p>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '제출 중...' : '제출'}
          </button>
        </div>
      </form>
    </div>
  );
}
