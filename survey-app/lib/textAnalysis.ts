interface TextResponse {
  question_number: number;
  question_text: string;
  response_text: string;
}

export interface KeywordCount {
  keyword: string;
  count: number;
}

/**
 * 텍스트 응답에서 상위 키워드 추출
 * @param responses 전체 텍스트 응답 배열
 * @param questionNumber 추출할 질문 번호
 * @param limit 반환할 상위 키워드 개수 (기본값: 10)
 * @returns 키워드와 빈도 배열
 */
export function extractTopKeywords(
  responses: TextResponse[],
  questionNumber: number,
  limit: number = 10
): KeywordCount[] {
  // 해당 질문의 응답만 필터링
  const filteredResponses = responses.filter(
    (r) => r.question_number === questionNumber
  );

  if (filteredResponses.length === 0) {
    return [];
  }

  // 키워드 빈도 계산
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

  // 빈도순으로 정렬하여 상위 N개 반환
  return Object.entries(words)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * 여러 질문의 키워드를 한 번에 추출
 * @param responses 전체 텍스트 응답 배열
 * @param questionNumbers 추출할 질문 번호 배열
 * @param limit 각 질문당 반환할 상위 키워드 개수
 * @returns 질문 번호별 키워드 맵
 */
export function extractKeywordsByQuestions(
  responses: TextResponse[],
  questionNumbers: number[],
  limit: number = 10
): Map<number, KeywordCount[]> {
  const result = new Map<number, KeywordCount[]>();

  for (const qNum of questionNumbers) {
    const keywords = extractTopKeywords(responses, qNum, limit);
    result.set(qNum, keywords);
  }

  return result;
}
