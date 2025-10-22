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

export default function OpinionSurvey({ questions, onNext, onBack, submitting = false, submitError = '' }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleChange = (questionNumber: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 서술형 문항은 모두 선택사항이므로 유효성 검증 없이 제출
    onNext(answers);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">종합 의견</h2>
        <p className="text-sm text-gray-600 mt-2">
          아래 질문에 대한 의견을 자유롭게 작성해주세요. (선택사항)
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {questions.map((question) => (
          <TextQuestion
            key={question.question_number}
            questionNumber={question.question_number}
            questionText={question.question_text}
            value={answers[question.question_number] || ''}
            onChange={(value) => handleChange(question.question_number, value)}
            required={false}
          />
        ))}

        {submitError && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <p className="text-sm font-medium text-red-800">{submitError}</p>
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
