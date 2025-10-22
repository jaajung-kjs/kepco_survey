'use client';

import ReactWordcloud from 'react-wordcloud';

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

  // 워드클라우드 데이터 생성
  const wordCloudData = Object.entries(words).map(([text, value]) => ({
    text,
    value,
  }));

  // 상위 50개만 표시
  const topWords = wordCloudData
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);

  if (topWords.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        키워드를 추출할 수 없습니다.
      </div>
    );
  }

  return (
    <div className="h-96">
      <ReactWordcloud
        words={topWords}
        options={{
          rotations: 2,
          rotationAngles: [0, 90],
          fontSizes: [12, 60],
          padding: 2,
        }}
      />
    </div>
  );
}
