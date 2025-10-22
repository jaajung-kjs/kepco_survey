'use client';

import { useState } from 'react';
import ScaleQuestion from './ScaleQuestion';
import TextQuestion from './TextQuestion';
import type { SurveyQuestion } from '@/types';

interface Props {
  questions: SurveyQuestion[];
  onNext: (scaleAnswers: Record<number, number>, textAnswers: Record<number, string>) => void;
  onBack: () => void;
}

export default function ManagementSurvey({ questions, onNext, onBack }: Props) {
  const [scaleAnswers, setScaleAnswers] = useState<Record<number, number>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  const handleScaleChange = (questionNumber: number, value: number) => {
    setScaleAnswers((prev) => ({
      ...prev,
      [questionNumber]: value,
    }));
    setError('');
  };

  const handleTextChange = (questionNumber: number, value: string) => {
    setTextAnswers((prev) => ({
      ...prev,
      [questionNumber]: value,
    }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 5점척도 문항 검증
    const scaleQuestions = questions.filter(q => q.response_type === '5점척도');
    const unansweredScaleQuestions = scaleQuestions.filter(
      (q) => scaleAnswers[q.question_number] === undefined
    );

    if (unansweredScaleQuestions.length > 0) {
      setError(`모든 5점척도 문항에 답변해주세요. (미답변: ${unansweredScaleQuestions.length}개)`);
      // 첫 번째 미답변 문항으로 스크롤
      const firstUnanswered = document.getElementById(
        `question-${unansweredScaleQuestions[0].question_number}`
      );
      firstUnanswered?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onNext(scaleAnswers, textAnswers);
  };

  const getProgress = () => {
    const scaleQuestions = questions.filter(q => q.response_type === '5점척도');
    const answeredCount = Object.keys(scaleAnswers).length;
    return Math.round((answeredCount / scaleQuestions.length) * 100);
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

  // Q39의 답변 확인 (협업 체계 평가)
  const q39Answer = scaleAnswers[39];
  const showQ40 = q39Answer !== undefined && q39Answer <= 2; // 1점 또는 2점인 경우에만 Q40 표시

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900">관리처 전반 평가</h2>
          <span className="text-sm text-gray-600">
            진행률: {getProgress()}% ({Object.keys(scaleAnswers).length}/{questions.filter(q => q.response_type === '5점척도').length})
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
          <div key={type} className="mb-4">
            <h3 className="text-base font-semibold text-gray-800 mb-2 pb-1 border-b-2 border-gray-300">
              {type}
            </h3>
            {typeQuestions.map((question) => {
              // Q40 조건부 렌더링 처리
              if (question.question_number === 40 && !showQ40) {
                return null;
              }

              return (
                <div key={question.question_number} id={`question-${question.question_number}`}>
                  {question.response_type === '5점척도' ? (
                    <ScaleQuestion
                      questionNumber={question.question_number}
                      questionText={question.question_text}
                      value={scaleAnswers[question.question_number] || null}
                      onChange={(value) => handleScaleChange(question.question_number, value)}
                    />
                  ) : (
                    <TextQuestion
                      questionNumber={question.question_number}
                      questionText={question.question_text}
                      value={textAnswers[question.question_number] || ''}
                      onChange={(value) => handleTextChange(question.question_number, value)}
                      required={false}
                    />
                  )}
                </div>
              );
            })}
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
