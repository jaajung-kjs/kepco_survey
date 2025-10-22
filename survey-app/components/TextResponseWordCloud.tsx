'use client';

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

  // 키워드 데이터 생성
  const wordData = Object.entries(words)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  if (wordData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        키워드를 추출할 수 없습니다.
      </div>
    );
  }

  const totalResponses = filteredResponses.length;
  const maxCount = Math.max(...wordData.map(w => w.count));

  return (
    <div className="py-6">
      <div className="mb-4 text-sm text-gray-600">
        총 {totalResponses}개의 응답 • 상위 {wordData.length}개 키워드
      </div>

      {/* 키워드 빈도 차트 */}
      <div className="space-y-2 mb-6">
        {wordData.map((word, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-24 text-sm font-medium text-gray-700 text-right">
              {word.text}
            </div>
            <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
              <div
                className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${(word.count / maxCount) * 100}%` }}
              >
                <span className="text-xs text-white font-medium">{word.count}회</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 전체 응답 텍스트 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">전체 응답</h4>
        <div className="space-y-3">
          {filteredResponses.map((response, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700 text-sm">{response.response_text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
