// 한국어 불용어 리스트
const STOP_WORDS = new Set([
  '이', '그', '저', '것', '수', '등', '및', '의', '가', '을', '를', '에', '와', '과', '로', '으로', '는', '은', '이다', '있다', '하다', '되다',
  '그리고', '하지만', '그러나', '또한', '또', '및', '등등', '즉', '예를들어', '때문에', '위해', '통해', '대한', '같은', '위한', '통한',
  '있는', '없는', '하는', '되는', '있습니다', '없습니다', '합니다', '됩니다', '것입니다', '있어', '없어', '해야', '필요', '생각', '느낌',
  '너무', '매우', '아주', '정말', '진짜', '조금', '약간', '좀', '더', '덜', '가장', '제일', '혹은', '또는', '거나', '든지',
  '있고', '없고', '하고', '되고', '있으며', '없으며', '하며', '되며', '있거나', '없거나', '하거나', '되거나',
  '그것', '이것', '저것', '무엇', '어디', '언제', '누구', '어떻게', '왜', '무슨', '어느', '얼마', '몇',
  '위', '아래', '앞', '뒤', '옆', '안', '밖', '속', '겉', '내', '외', '중', '간', '사이',
]);

export interface KeywordCount {
  keyword: string;
  count: number;
}

/**
 * 텍스트에서 키워드를 추출하고 빈도를 계산합니다
 */
export function extractKeywords(texts: string[], minLength = 2): KeywordCount[] {
  const wordCounts = new Map<string, number>();

  texts.forEach(text => {
    if (!text || text.trim() === '') return;

    // 특수문자 제거 및 공백으로 단어 분리
    const words = text
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .map(word => word.trim())
      .filter(word =>
        word.length >= minLength &&
        !STOP_WORDS.has(word) &&
        !/^\d+$/.test(word) // 숫자만 있는 단어 제외
      );

    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });
  });

  // 빈도수로 정렬하여 반환
  return Array.from(wordCounts.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 문항번호별로 텍스트 응답을 그룹화하고 키워드를 추출합니다
 */
export function extractKeywordsByQuestion(
  responses: Array<{ question_number: number; response_text: string }>
): Map<number, KeywordCount[]> {
  const questionGroups = new Map<number, string[]>();

  // 문항별로 응답 그룹화
  responses.forEach(({ question_number, response_text }) => {
    if (!questionGroups.has(question_number)) {
      questionGroups.set(question_number, []);
    }
    questionGroups.get(question_number)!.push(response_text);
  });

  // 각 문항별로 키워드 추출
  const keywordsByQuestion = new Map<number, KeywordCount[]>();
  questionGroups.forEach((texts, questionNumber) => {
    const keywords = extractKeywords(texts).slice(0, 30); // 상위 30개만
    keywordsByQuestion.set(questionNumber, keywords);
  });

  return keywordsByQuestion;
}
