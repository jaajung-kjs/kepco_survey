'use client';

import { useState, useEffect } from 'react';
import ScaleQuestion from './ScaleQuestion';
import type { SurveyQuestion } from '@/types';

interface Props {
  questions: SurveyQuestion[];
  onNext: (answers: Record<number, number>) => void;
  onBack: () => void;
}

export default function OwnDeptSurvey({ questions, onNext, onBack }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [error, setError] = useState('');

  const handleAnswerChange = (questionNumber: number, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: value,
    }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 모든 문항에 답변했는지 확인
    const unansweredQuestions = questions.filter(
      (q) => answers[q.question_number] === undefined
    );

    if (unansweredQuestions.length > 0) {
      setError(`모든 문항에 답변해주세요. (미답변: ${unansweredQuestions.length}개)`);
      // 첫 번째 미답변 문항으로 스크롤
      const firstUnanswered = document.getElementById(
        `question-${unansweredQuestions[0].question_number}`
      );
      firstUnanswered?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onNext(answers);
  };

  const getProgress = () => {
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / questions.length) * 100);
  };

  // 평가 유형별로 그룹화
  const groupedQuestions = questions.reduce((acc, question) => {
    const type = question.evaluation_type || '기타';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(question);
    return acc;
  }, {} as Record<string, SurveyQuestion[]>);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900">본인 소속 조직 평가</h2>
          <span className="text-sm text-gray-600">
            진행률: {getProgress()}% ({Object.keys(answers).length}/{questions.length})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {Object.entries(groupedQuestions).map(([type, typeQuestions]) => (
          <div key={type} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-300">
              {type}
            </h3>
            {typeQuestions.map((question) => (
              <div key={question.question_number} id={`question-${question.question_number}`}>
                <ScaleQuestion
                  questionNumber={question.question_number}
                  questionText={question.question_text}
                  value={answers[question.question_number] || null}
                  onChange={(value) => handleAnswerChange(question.question_number, value)}
                />
              </div>
            ))}
          </div>
        ))}

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <div className="flex justify-between">
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
