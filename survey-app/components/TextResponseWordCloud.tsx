'use client';

import { TagCloud } from 'react-tagcloud';

interface TextResponseWordCloudProps {
  responses: {
    question_number: number;
    question_text: string;
    response_text: string;
  }[];
  questionNumber: number;
}

export default function TextResponseWordCloud({
  responses,
  questionNumber,
}: TextResponseWordCloudProps) {
  // 해당 질문의 응답만 필터링
  const filteredResponses = responses.filter(
    (r) => r.question_number === questionNumber
  );

  if (filteredResponses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        아직 응답이 없습니다.
      </div>
    );
  }

  // 간단한 한글 키워드 추출 (공백 기준)
  const words: { [key: string]: number } = {};

  filteredResponses.forEach((response) => {
    const text = response.response_text;
    if (!text || text.trim() === '') return;

    // 공백으로 단어 분리
    const tokens = text.split(/\s+/);

    tokens.forEach((token) => {
      // 2글자 이상인 단어만 포함
      if (token.length >= 2) {
        const normalized = token.trim();
        if (normalized) {
          words[normalized] = (words[normalized] || 0) + 1;
        }
      }
    });
  });

  // react-tagcloud 형식으로 데이터 변환
  const cloudData = Object.entries(words)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  if (cloudData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        키워드를 추출할 수 없습니다.
      </div>
    );
  }

  const totalResponses = filteredResponses.length;

  return (
    <div className="py-6">
      <div className="mb-4 text-sm text-gray-600">
        총 {totalResponses}개의 응답 • 상위 {cloudData.length}개 키워드
      </div>

      {/* 워드클라우드 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <TagCloud
          minSize={14}
          maxSize={48}
          tags={cloudData}
          className="wordcloud"
          colorOptions={{
            luminosity: 'dark',
            hue: 'blue',
          }}
        />
      </div>
    </div>
  );
}
