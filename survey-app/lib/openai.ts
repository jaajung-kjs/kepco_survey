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
    question_number: number;
    question_text: string;
    evaluation_type: string;
    avg_score: number;
    response_count: number;
  }[];
}

export async function generateDepartmentAnalysis(data: DepartmentAnalysisData): Promise<string> {
  const prompt = `
다음은 ${data.department}의 조직 평가 결과입니다. 이 데이터를 분석하여 종합 평가를 작성해주세요.

[평가유형별 최종 점수]
${data.byType.map(type => {
  const diff = type.final_avg - type.own_avg;
  const diffText = type.other_avg > 0 ? ` (타부서 평가 반영 ${diff > 0 ? '+' : ''}${diff.toFixed(2)})` : '';
  return `- ${type.evaluation_type}: ${type.own_avg.toFixed(2)}점 → ${type.final_avg.toFixed(2)}점${diffText} (${type.rank}위)`;
}).join('\n')}

[세부 문항별 점수 (상위 5개)]
${data.questions
  .sort((a, b) => b.avg_score - a.avg_score)
  .slice(0, 5)
  .map(q => `- ${q.question_text}: ${q.avg_score.toFixed(2)}점 (${q.response_count}명 응답)`)
  .join('\n')}

[세부 문항별 점수 (하위 5개)]
${data.questions
  .sort((a, b) => a.avg_score - b.avg_score)
  .slice(0, 5)
  .map(q => `- ${q.question_text}: ${q.avg_score.toFixed(2)}점 (${q.response_count}명 응답)`)
  .join('\n')}

다음 항목에 대해 분석해주세요:
1. **강점 분야**: 높은 점수를 받은 영역과 그 이유
2. **개선 필요 분야**: 낮은 점수를 받은 영역과 원인 분석
3. **자체평가 vs 타부서평가 차이 분석**: 차이가 큰 영역과 그 의미
4. **구체적 개선 제안**: 실행 가능한 3가지 개선 방안

전문적이고 객관적인 톤으로 작성하되, 구체적인 데이터를 근거로 제시해주세요.
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
}

export async function generateManagementAnalysis(data: ManagementAnalysisData): Promise<string> {
  const prompt = `
다음은 관리처 전반에 대한 조직 평가 결과입니다. 이 데이터를 분석하여 종합 평가를 작성해주세요.

[평가유형별 평균]
${data.byType.map(type => `- ${type.evaluation_type}: ${type.avg_score.toFixed(2)}점`).join('\n')}

[세부 문항별 점수 (상위 5개)]
${data.questions
  .filter(q => q.avg_score > 0)
  .sort((a, b) => b.avg_score - a.avg_score)
  .slice(0, 5)
  .map(q => `- ${q.question_text}: ${q.avg_score.toFixed(2)}점`)
  .join('\n')}

[세부 문항별 점수 (하위 5개)]
${data.questions
  .filter(q => q.avg_score > 0)
  .sort((a, b) => a.avg_score - b.avg_score)
  .slice(0, 5)
  .map(q => `- ${q.question_text}: ${q.avg_score.toFixed(2)}점`)
  .join('\n')}

다음 항목에 대해 분석해주세요:
1. **관리처 강점**: 높은 평가를 받은 영역
2. **개선 영역**: 개선이 필요한 영역과 원인
3. **우선순위별 개선 제안**: 즉시 실행 가능한 제안 3가지

전문적이고 객관적인 톤으로 작성하되, 구체적인 데이터를 근거로 제시해주세요.
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
