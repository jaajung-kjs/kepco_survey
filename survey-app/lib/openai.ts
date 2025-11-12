import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface DepartmentAnalysisData {
  department: string;
  byType: {
    evaluationType: string;
    ownScore: number;
    otherScore: number;
    finalScore: number;
    rank: number;
  }[];
  questions: {
    questionNumber: number;
    questionText: string;
    avgScore: number;
    rank: number;
  }[];
  otherQuestions: {
    questionNumber: number;
    questionText: string;
    avgScore: number;
    rank: number;
  }[];
}

export async function generateDepartmentAnalysis(data: DepartmentAnalysisData): Promise<string> {
  const prompt = `
다음은 ${data.department}의 조직 평가 결과입니다. 아래 데이터를 기반으로 종합 분석 보고서를 작성해주세요.

[평가유형별 상세 점수]
${data.byType.map(type => {
  return `- ${type.evaluationType}: ${type.finalScore.toFixed(2)}점 (${type.rank}위/10위)`;
}).join('\n')}

[본인 부서 문항별 상세 점수 - 점수 높은 순]
${data.questions
  .sort((a, b) => b.avgScore - a.avgScore)
  .map(q => `- ${q.questionText}: ${q.avgScore.toFixed(2)}점 (${q.rank}위/10위)`)
  .join('\n')}

${data.otherQuestions && data.otherQuestions.length > 0 ? `
[타부서가 평가한 문항별 상세 점수 - 점수 높은 순]
${data.otherQuestions
  .sort((a, b) => b.avgScore - a.avgScore)
  .map(q => `- ${q.questionText}: ${q.avgScore.toFixed(2)}점 (${q.rank}위/10위)`)
  .join('\n')}
` : ''}

**보고서 작성 형식:**
다음 5개 섹션으로 구성된 보고서를 작성해주세요.

1. 전반적인 평가 결과 요약
2. 두드러진 강점 영역과 그 의미
3. 개선이 필요한 영역과 배경
4. 데이터에서 발견되는 주요 패턴과 시사점
5. 결론

**작성 지침:**
- 각 섹션을 ## 제목으로 구분하여 작성하세요
- 점수와 순위 데이터를 구체적으로 인용하며 분석하세요
- 전문적이고 객관적인 톤을 유지하세요
- 마크다운 형식으로 가독성 있게 작성하세요
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
    evaluationType: string;
    average: number;
  }[];
  questionScores: {
    questionNumber: number;
    questionText: string;
    avgScore: number;
  }[];
  textKeywords?: Record<number, { keyword: string; count: number }[]> | Map<number, { keyword: string; count: number }[]>;
}

export async function generateManagementAnalysis(data: ManagementAnalysisData): Promise<string> {
  // 키워드 데이터 포맷팅
  const keywordSection = data.textKeywords ? `
[서술형 응답 키워드 분석]
${Object.entries(data.textKeywords)
  .map(([qNumStr, keywords]) => {
    const qNum = parseInt(qNumStr);
    const questionTitles: { [key: number]: string } = {
      40: 'Q40. 관리처 전반에서 업무협조가 어려운 이유',
      45: 'Q45. 타 부서와의 업무협조 개선 방안',
      50: 'Q50. 향후 관리처가 집중해야 할 핵심 분야',
      51: 'Q51. 관리처 내 역량 차이 감소 방안',
      52: 'Q52. 개선이 가장 필요한 부분',
      53: 'Q53. 관리처 발전을 위한 아이디어',
    };
    const title = questionTitles[qNum] || `Q${qNum}`;
    const topKeywords = keywords.slice(0, 10)
      .map((k: { keyword: string; count: number }, index: number) => `  ${index + 1}. ${k.keyword} (${k.count}회)`)
      .join('\n');
    return `${title}\n${topKeywords}`;
  })
  .join('\n\n')}
` : '';

  const prompt = `
다음은 관리처 전반에 대한 조직 평가 결과입니다. 아래 데이터를 기반으로 종합 분석 보고서를 작성해주세요.

[평가유형별 평균 점수]
${data.byType.map(type => `- ${type.evaluationType}: ${type.average.toFixed(2)}점`).join('\n')}

[세부 문항별 점수 - 점수 높은 순]
${data.questionScores
  .filter(q => q.avgScore > 0)
  .sort((a, b) => b.avgScore - a.avgScore)
  .map(q => `- ${q.questionText}: ${q.avgScore.toFixed(2)}점`)
  .join('\n')}
${keywordSection}

**보고서 작성 형식:**
다음 6개 섹션으로 구성된 보고서를 작성해주세요.

1. 전반적인 평가 결과 요약
2. 두드러진 강점 영역과 그 의미
3. 개선이 필요한 영역과 배경
4. 서술형 응답 문항별 키워드 분석
   - 각 문항(Q40, Q45, Q50, Q51, Q52, Q53)의 질문 의도를 파악하고, 해당 질문에 대한 전체적인 응답 경향을 분석
   - 키워드들을 개별적으로 설명하지 말고, 여러 키워드를 종합하여 질문에 대한 답변의 전반적인 의미를 해석
   - 예: "Q40에서 협업(3회), 소통부족(1회) 등의 키워드는 업무협조 어려움의 근본 원인이 **부서 간 소통과 협력 문화의 부재**임을 보여줍니다"
   - 빈도가 높은 키워드 그룹을 중심으로 주요 경향을 파악하고, 그것이 질문과 어떻게 연결되는지 설명
   - 문항 간 키워드 연관성이 있다면 함께 언급
5. 데이터에서 발견되는 주요 패턴과 시사점
6. 결론

**작성 지침:**
- 각 섹션을 ## 제목으로 구분하여 작성하세요
- 섹션 4에서는 각 서술형 문항을 ### 소제목으로 구분하여 작성하세요
- **중요**: 섹션 4에서 키워드를 나열하지 말고, 질문에 대한 종합적인 답변 경향을 서술하세요
- 점수 데이터와 키워드 데이터를 구체적으로 인용하며 분석하세요
- 여러 키워드를 묶어서 주요 테마나 경향을 도출하세요
- 전문적이고 객관적인 톤을 유지하세요
- 마크다운 형식으로 가독성 있게 작성하세요
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
