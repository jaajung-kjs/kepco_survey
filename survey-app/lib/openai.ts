import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface DepartmentAnalysisData {
  department: string;
  byType: {
    evaluation_type: string;
    own_avg: number;
    other_avg: number;
    final_avg: number;
    rank: number;
  }[];
  questions: {
    questionNumber: number;
    questionText: string;
    average: number;
    rank: number | null;
    overallAverage: number;
  }[];
  otherQuestions: {
    questionNumber: number;
    questionText: string;
    average: number;
    rank: number | null;
    overallAverage: number;
  }[];
}

export async function generateDepartmentAnalysis(data: DepartmentAnalysisData): Promise<string> {
  const prompt = `
다음은 ${data.department}의 조직 평가 결과입니다. 이 데이터를 분석하여 종합 평가를 작성해주세요.

[평가유형별 최종 점수 및 순위]
${data.byType.map(type => {
  const diff = type.final_avg - type.own_avg;
  const diffText = type.other_avg > 0 ? ` (타부서 평가 반영 ${diff > 0 ? '+' : ''}${diff.toFixed(2)})` : '';
  return `- ${type.evaluation_type}: 본인평가 ${type.own_avg.toFixed(2)}점 → 최종 ${type.final_avg.toFixed(2)}점${diffText} | **${type.rank}위**`;
}).join('\n')}

[본인 평가 문항별 점수 - 상위 5개]
${data.questions
  .sort((a, b) => b.average - a.average)
  .slice(0, 5)
  .map(q => `- Q${q.questionNumber}. ${q.questionText}: ${q.average.toFixed(2)}점 (전체 평균 ${q.overallAverage.toFixed(2)}점, ${q.rank ? `${q.rank}위` : '순위 없음'})`)
  .join('\n')}

[본인 평가 문항별 점수 - 하위 5개]
${data.questions
  .sort((a, b) => a.average - b.average)
  .slice(0, 5)
  .map(q => `- Q${q.questionNumber}. ${q.questionText}: ${q.average.toFixed(2)}점 (전체 평균 ${q.overallAverage.toFixed(2)}점, ${q.rank ? `${q.rank}위` : '순위 없음'})`)
  .join('\n')}

${data.otherQuestions && data.otherQuestions.length > 0 ? `
[타부서 평가 문항별 점수 (간부에 의한 평가)]
${data.otherQuestions
  .map(q => `- ${q.questionText}: ${q.average.toFixed(2)}점 (전체 평균 ${q.overallAverage.toFixed(2)}점, ${q.rank ? `${q.rank}위` : '순위 없음'})`)
  .join('\n')}
` : ''}

다음 항목에 대해 분석해주세요:
1. **강점 분야**:
   - 순위가 높은 평가유형과 문항 분석
   - 전체 평균 대비 우수한 영역

2. **개선 필요 분야**:
   - 순위가 낮은 평가유형과 문항 분석
   - 전체 평균에 미치지 못하는 영역과 원인

3. **본인평가 vs 타부서평가 차이**:
   - 평가유형별 점수 차이 분석
   - 타부서 평가에서 높거나 낮은 영역의 의미

4. **구체적 개선 제안**:
   - 순위와 점수를 기반으로 한 우선순위별 실행 방안 3가지
   - 각 제안에 대한 기대 효과

전문적이고 객관적인 톤으로 작성하되, 구체적인 데이터(점수, 순위, 전체 평균 대비 차이)를 근거로 제시해주세요.
마크다운 형식으로 작성해주세요.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '당신은 조직 문화 및 업무 성과 분석 전문가입니다. 데이터를 기반으로 객관적이고 건설적인 분석을 제공합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || 'AI 분석을 생성할 수 없습니다.';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return 'AI 분석 생성 중 오류가 발생했습니다. OpenAI API 키를 확인해주세요.';
  }
}

interface ManagementAnalysisData {
  byType: {
    evaluation_type: string;
    avg_score: number;
  }[];
  questions: {
    question_number: number;
    question_text: string;
    evaluation_type: string;
    avg_score: number;
    response_count: number;
  }[];
  textKeywords?: Map<number, { keyword: string; count: number }[]>;
}

export async function generateManagementAnalysis(data: ManagementAnalysisData): Promise<string> {
  // 키워드 데이터 포맷팅
  const keywordSection = data.textKeywords ? `
[서술형 응답 키워드 분석]
${Array.from(data.textKeywords.entries())
  .map(([qNum, keywords]) => {
    const questionTitles: { [key: number]: string } = {
      40: 'Q40. 관리처 전반에서 업무협조가 어려운 이유',
      45: 'Q45. 타 부서와의 업무협조 개선 방안',
      50: 'Q50. 향후 관리처가 집중해야 할 핵심 분야',
      51: 'Q51. 관리처 내 역량 차이 감소 방안',
      52: 'Q52. 개선이 가장 필요한 부분',
      53: 'Q53. 관리처 발전을 위한 아이디어',
    };
    const title = questionTitles[qNum] || `Q${qNum}`;
    const topKeywords = keywords.slice(0, 10).map(k => `${k.keyword}(${k.count}회)`).join(', ');
    return `${title}\n  → ${topKeywords}`;
  })
  .join('\n\n')}
` : '';

  const prompt = `
다음은 관리처 전반에 대한 조직 평가 결과입니다. 이 데이터를 분석하여 종합 평가를 작성해주세요.

[평가유형별 평균 점수]
${data.byType.map(type => `- ${type.evaluation_type}: ${type.avg_score.toFixed(2)}점`).join('\n')}

[세부 문항별 점수 - 상위 5개]
${data.questions
  .filter(q => q.avg_score > 0)
  .sort((a, b) => b.avg_score - a.avg_score)
  .slice(0, 5)
  .map(q => `- Q${q.question_number}. ${q.question_text}: ${q.avg_score.toFixed(2)}점 (${q.evaluation_type})`)
  .join('\n')}

[세부 문항별 점수 - 하위 5개]
${data.questions
  .filter(q => q.avg_score > 0)
  .sort((a, b) => a.avg_score - b.avg_score)
  .slice(0, 5)
  .map(q => `- Q${q.question_number}. ${q.question_text}: ${q.avg_score.toFixed(2)}점 (${q.evaluation_type})`)
  .join('\n')}
${keywordSection}

다음 항목에 대해 분석해주세요:
1. **관리처 강점**:
   - 높은 평가를 받은 평가유형과 문항
   - 서술형 응답 키워드에서 나타난 긍정적 요소

2. **개선 영역**:
   - 낮은 점수를 받은 평가유형과 문항
   - 서술형 응답 키워드에서 나타난 문제점과 원인
   - 직원들이 제시한 개선 필요 사항

3. **우선순위별 개선 제안**:
   - 점수 데이터와 키워드 분석을 종합하여 즉시 실행 가능한 제안 3가지
   - 각 제안의 실행 방법과 기대 효과
   - 직원들의 실제 의견(키워드)을 반영한 실질적 방안

전문적이고 객관적인 톤으로 작성하되, 구체적인 데이터(점수)와 직원들의 실제 의견(키워드)을 근거로 제시해주세요.
마크다운 형식으로 작성해주세요.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '당신은 조직 문화 및 업무 성과 분석 전문가입니다. 데이터를 기반으로 객관적이고 건설적인 분석을 제공합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || 'AI 분석을 생성할 수 없습니다.';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return 'AI 분석 생성 중 오류가 발생했습니다. OpenAI API 키를 확인해주세요.';
  }
}
