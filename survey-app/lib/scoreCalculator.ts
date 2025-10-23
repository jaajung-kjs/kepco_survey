import { createServerSupabaseClient } from './supabase';
import { DEPARTMENTS, EVALUATION_TYPES, type Department, type EvaluationType } from './constants';

// 문항 번호와 평가유형 매핑
const QUESTION_EVALUATION_MAP = {
  // 본인 소속 조직 (Q2-Q20)
  조직문화: [2, 3, 4, 5, 6, 7, 8, 9],      // Q2-Q9 (8개)
  업무충실: [10, 11, 12, 13, 14, 15],      // Q10-Q15 (6개)
  업무협조: [16, 17, 18],                  // Q16-Q18 (3개)
  업무혁신: [19, 20],                      // Q19-Q20 (2개)
};

// 타부서 평가 문항 매핑 (other_q1-other_q5)
const OTHER_DEPT_EVALUATION_MAP = {
  업무충실: [1, 2],  // other_q1, other_q2
  업무협조: [3, 4],  // other_q3, other_q4
  업무혁신: [5],     // other_q5
};

// 관리처 평가 문항 매핑 (Q26-Q49, Q40/Q45 제외)
const MANAGEMENT_EVALUATION_MAP = {
  조직문화: [26, 27, 28, 29, 30, 31, 32, 33, 34],  // Q26-Q34 (9개)
  업무충실: [35, 36, 37],                          // Q35-Q37 (3개)
  업무협조: [38, 39, 41, 42, 43, 44],             // Q38-Q39, Q41-Q44 (6개, Q40 제외)
  업무혁신: [46, 47, 48, 49],                      // Q46-Q49 (4개, Q45 제외)
};

// 평가유형별 점수 인터페이스
export interface EvaluationScore {
  evaluationType: EvaluationType;
  ownScore: number;        // 본인평가 점수
  otherScore: number | null;  // 타부서평가 점수 (없을 수 있음)
  finalScore: number;      // 최종 점수 (가중합)
  difference: number | null;  // 차이값 (최종 - 본인)
  rank: number | null;     // 순위 (1-10위)
}

// 부서별 종합 점수
export interface DepartmentScore {
  department: Department;
  scores: EvaluationScore[];
  overallAverage: number;  // 전체 평균 (4개 평가유형)
  overallRank: number | null;  // 전체 순위
}

// 세부 문항 점수
export interface QuestionScore {
  questionNumber: number;
  questionText: string;
  average: number;
  rank: number | null;
  overallAverage: number;  // 전체 부서 평균
}

// 관리처 점수
export interface ManagementScore {
  evaluationType: EvaluationType;
  average: number;
  questions: QuestionScore[];
}

/**
 * 부서별 점수 계산
 * @param department 부서명
 * @returns 부서별 종합 점수
 */
export async function calculateDepartmentScores(department: Department): Promise<DepartmentScore> {
  const supabase = await createServerSupabaseClient();

  // 1. 부서 데이터 조회
  const { data: deptData, error: deptError } = await supabase
    .from('department_scores')
    .select('*')
    .eq('department', department)
    .single();

  if (deptError || !deptData) {
    throw new Error(`부서 데이터 조회 실패: ${deptError?.message}`);
  }

  // 2. 평가유형별 점수 계산
  const evaluationScores: EvaluationScore[] = [];

  for (const [evalType, questions] of Object.entries(QUESTION_EVALUATION_MAP)) {
    const evaluationType = evalType as EvaluationType;

    // 본인평가 평균 계산 (문항별 평균의 평균)
    let ownSum = 0;
    let ownCount = 0;
    let ownRespondentCount = 0;

    for (const qNum of questions) {
      const sum = deptData[`q${qNum}_sum`] || 0;
      const count = deptData[`q${qNum}_count`] || 0;
      ownSum += sum;
      ownCount += count;
      // 응답자 수는 첫 번째 문항의 count로 확인 (모든 문항 동일 응답자)
      if (ownRespondentCount === 0 && count > 0) {
        ownRespondentCount = count;
      }
    }

    const ownScore = ownCount > 0 ? ownSum / ownCount : 0;
    const hasOwnScore = ownRespondentCount > 0;

    // 타부서평가 평균 계산
    let otherSum = 0;
    let otherCount = 0;
    let otherRespondentCount = 0;
    const otherQuestions = OTHER_DEPT_EVALUATION_MAP[evaluationType as keyof typeof OTHER_DEPT_EVALUATION_MAP];

    if (otherQuestions && otherQuestions.length > 0) {
      for (const otherQNum of otherQuestions) {
        const sum = deptData[`other_q${otherQNum}_sum`] || 0;
        const count = deptData[`other_q${otherQNum}_count`] || 0;
        otherSum += sum;
        otherCount += count;
        // 응답자 수는 첫 번째 문항의 count로 확인
        if (otherRespondentCount === 0 && count > 0) {
          otherRespondentCount = count;
        }
      }
    }

    const otherScore = otherCount > 0 ? otherSum / otherCount : 0;
    const hasOtherScore = otherRespondentCount > 0;

    // 최종 점수 계산 (가중평균)
    // 로직:
    // 1. 본인평가와 타부서평가가 모두 있으면 가중평균 (응답자 수 반영)
    //    공식: (본인평가 평균 × 본인 응답자 수 + 타부서평가 평균 × 타부서 응답자 수) / (본인 응답자 수 + 타부서 응답자 수)
    // 2. 본인평가만 있으면 본인평가
    // 3. 타부서평가만 있으면 타부서평가
    // 4. 둘 다 없으면 0점
    let finalScore: number;
    let difference: number | null = null;

    if (hasOwnScore && hasOtherScore) {
      // 가중평균: (본인평가 × 본인 응답자 수 + 타부서평가 × 타부서 응답자 수) / (본인 응답자 수 + 타부서 응답자 수)
      finalScore = (ownScore * ownRespondentCount + otherScore * otherRespondentCount) / (ownRespondentCount + otherRespondentCount);
      difference = finalScore - ownScore;
    } else if (hasOtherScore) {
      // 타부서평가만 있는 경우
      finalScore = otherScore;
      difference = null;
    } else {
      // 본인평가만 있거나 둘 다 없는 경우
      finalScore = ownScore;
      difference = null;
    }

    evaluationScores.push({
      evaluationType,
      ownScore: Math.round(ownScore * 10) / 10,  // 소수점 1자리
      otherScore: otherScore !== null ? Math.round(otherScore * 10) / 10 : null,
      finalScore: Math.round(finalScore * 10) / 10,
      difference: difference !== null ? Math.round(difference * 10) / 10 : null,
      rank: null,  // 순위는 전체 부서 비교 후 계산
    });
  }

  // 3. 전체 평균 계산
  const overallAverage = evaluationScores.reduce((sum, score) => sum + score.finalScore, 0) / evaluationScores.length;

  return {
    department,
    scores: evaluationScores,
    overallAverage: Math.round(overallAverage * 10) / 10,
    overallRank: null,  // 순위는 전체 부서 비교 후 계산
  };
}

/**
 * 전체 부서 점수 계산 및 순위 산출
 * @returns 전체 부서별 점수 배열
 */
export async function calculateAllDepartmentScores(): Promise<DepartmentScore[]> {
  const departmentScores: DepartmentScore[] = [];

  // 1. 각 부서별 점수 계산
  for (const department of DEPARTMENTS) {
    const score = await calculateDepartmentScores(department);
    departmentScores.push(score);
  }

  // 2. 평가유형별 순위 계산 (동점 처리)
  for (const evalType of Object.keys(EVALUATION_TYPES)) {
    const evaluationType = EVALUATION_TYPES[evalType as keyof typeof EVALUATION_TYPES];

    // 해당 평가유형의 점수들을 정렬
    const sortedScores = departmentScores
      .map((dept, index) => ({
        deptIndex: index,
        score: dept.scores.find(s => s.evaluationType === evaluationType)!.finalScore,
      }))
      .sort((a, b) => b.score - a.score);

    // 순위 부여 (동점 처리)
    let currentRank = 1;
    for (let i = 0; i < sortedScores.length; i++) {
      const item = sortedScores[i];

      // 이전 점수와 비교하여 동점이면 같은 순위, 아니면 현재 인덱스 + 1
      if (i > 0 && Math.abs(sortedScores[i - 1].score - item.score) > 0.01) {
        currentRank = i + 1;
      }

      const scoreIndex = departmentScores[item.deptIndex].scores.findIndex(
        s => s.evaluationType === evaluationType
      );
      departmentScores[item.deptIndex].scores[scoreIndex].rank = currentRank;
    }
  }

  // 3. 전체 평균 순위 계산 (동점 처리)
  const sortedByOverall = departmentScores
    .map((dept, index) => ({ deptIndex: index, average: dept.overallAverage }))
    .sort((a, b) => b.average - a.average);

  let currentRank = 1;
  for (let i = 0; i < sortedByOverall.length; i++) {
    const item = sortedByOverall[i];

    // 이전 점수와 비교하여 동점이면 같은 순위, 아니면 현재 인덱스 + 1
    if (i > 0 && Math.abs(sortedByOverall[i - 1].average - item.average) > 0.01) {
      currentRank = i + 1;
    }

    departmentScores[item.deptIndex].overallRank = currentRank;
  }

  return departmentScores;
}

/**
 * 관리처 점수 계산
 * @returns 관리처 평가유형별 점수
 */
export async function calculateManagementScores(): Promise<ManagementScore[]> {
  const supabase = await createServerSupabaseClient();

  // 1. 관리처 데이터 조회
  const { data: mgmtData, error: mgmtError} = await supabase
    .from('management_scores')
    .select('*')
    .single();

  if (mgmtError || !mgmtData) {
    throw new Error(`관리처 데이터 조회 실패: ${mgmtError?.message}`);
  }

  // 문항 텍스트 조회
  const { data: questions } = await supabase
    .from('survey_questions')
    .select('question_number, question_text')
    .gte('question_number', 26)
    .lte('question_number', 49)
    .order('question_number');

  const questionTexts = new Map(
    questions?.map(q => [q.question_number, q.question_text]) || []
  );

  // 2. 평가유형별 점수 계산
  const managementScores: ManagementScore[] = [];

  for (const [evalType, questions] of Object.entries(MANAGEMENT_EVALUATION_MAP)) {
    const evaluationType = evalType as EvaluationType;
    const questionScores: QuestionScore[] = [];

    let totalSum = 0;
    let totalCount = 0;

    for (const qNum of questions) {
      const sum = mgmtData[`q${qNum}_sum`] || 0;
      const count = mgmtData[`q${qNum}_count`] || 0;

      totalSum += sum;
      totalCount += count;

      // 문항별 점수 저장
      const average = count > 0 ? sum / count : 0;
      questionScores.push({
        questionNumber: qNum,
        questionText: questionTexts.get(qNum) || `Q${qNum}`,
        average: Math.round(average * 10) / 10,
        rank: null,  // 필요시 추가 구현
        overallAverage: 0,  // 관리처는 전체 평균 불필요
      });
    }

    const average = totalCount > 0 ? totalSum / totalCount : 0;

    managementScores.push({
      evaluationType,
      average: Math.round(average * 10) / 10,
      questions: questionScores,
    });
  }

  return managementScores;
}

/**
 * 특정 부서의 세부 문항 점수 조회
 * @param department 부서명
 * @returns 문항별 점수 배열
 */
export async function getDepartmentQuestionScores(department: Department): Promise<QuestionScore[]> {
  const supabase = await createServerSupabaseClient();

  const { data: deptData, error } = await supabase
    .from('department_scores')
    .select('*')
    .eq('department', department)
    .single();

  if (error || !deptData) {
    throw new Error(`부서 데이터 조회 실패: ${error?.message}`);
  }

  // 문항 텍스트 조회
  const { data: questions } = await supabase
    .from('survey_questions')
    .select('question_number, question_text')
    .gte('question_number', 2)
    .lte('question_number', 20)
    .order('question_number');

  const questionTexts = new Map(
    questions?.map(q => [q.question_number, q.question_text]) || []
  );

  const questionScores: QuestionScore[] = [];

  // 전체 부서 평균 계산을 위한 모든 부서 데이터 조회
  const { data: allDeptData } = await supabase
    .from('department_scores')
    .select('*');

  // Q2-Q20 각 문항별 점수 및 순위 계산
  for (let qNum = 2; qNum <= 20; qNum++) {
    const sum = deptData[`q${qNum}_sum`] || 0;
    const count = deptData[`q${qNum}_count`] || 0;
    const average = count > 0 ? sum / count : 0;

    // 전체 부서 평균 및 순위 계산
    let overallSum = 0;
    let overallCount = 0;
    const deptAverages: { dept: string; avg: number }[] = [];

    if (allDeptData) {
      for (const dept of allDeptData) {
        const deptSum = dept[`q${qNum}_sum`] || 0;
        const deptCount = dept[`q${qNum}_count`] || 0;
        const deptAvg = deptCount > 0 ? deptSum / deptCount : 0;

        overallSum += deptSum;
        overallCount += deptCount;

        deptAverages.push({
          dept: dept.department,
          avg: deptAvg
        });
      }
    }

    const overallAverage = overallCount > 0 ? overallSum / overallCount : 0;

    // 순위 계산 (높은 점수가 1위, 동점 처리)
    const sortedDepts = deptAverages
      .filter(d => d.avg > 0)
      .sort((a, b) => b.avg - a.avg);

    let rank = null;
    let currentRank = 1;
    for (let i = 0; i < sortedDepts.length; i++) {
      // 이전 점수와 비교하여 동점이면 같은 순위, 아니면 현재 인덱스 + 1
      if (i > 0 && Math.abs(sortedDepts[i - 1].avg - sortedDepts[i].avg) > 0.01) {
        currentRank = i + 1;
      }

      if (sortedDepts[i].dept === department) {
        rank = currentRank;
        break;
      }
    }

    questionScores.push({
      questionNumber: qNum,
      questionText: questionTexts.get(qNum) || `Q${qNum}`,
      average: Math.round(average * 10) / 10,
      rank: (rank !== null && rank > 0) ? rank : null,
      overallAverage: Math.round(overallAverage * 10) / 10,
    });
  }

  return questionScores;
}

/**
 * 특정 부서의 타부서 평가 세부 문항 점수 조회
 * @param department 부서명
 * @returns 타부서 평가 문항별 점수 배열
 */
export async function getOtherDeptQuestionScores(department: Department): Promise<QuestionScore[]> {
  const supabase = await createServerSupabaseClient();

  const { data: deptData, error } = await supabase
    .from('department_scores')
    .select('*')
    .eq('department', department)
    .single();

  if (error || !deptData) {
    throw new Error(`부서 데이터 조회 실패: ${error?.message}`);
  }

  // 타부서 평가 문항 텍스트 (하드코딩)
  const otherQuestionTexts = new Map([
    [1, '조직 및 구성원의 업무수행 역량이 우수하다'],
    [2, '올 한 해 우수한 업무 성과를 달성하고 있다'],
    [3, '조직 간 갈등해결에 유연하고 적극적이다'],
    [4, '조직 간 협업에 적극적이다'],
    [5, '구성원 직무능력 개발, 업무개선 등 혁신업무 실적이 우수하다'],
  ]);

  const questionScores: QuestionScore[] = [];

  // 전체 부서 평균 계산
  const { data: allDeptData } = await supabase
    .from('department_scores')
    .select('*');

  // other_q1 ~ other_q5
  for (let qNum = 1; qNum <= 5; qNum++) {
    const sum = deptData[`other_q${qNum}_sum`] || 0;
    const count = deptData[`other_q${qNum}_count`] || 0;
    const average = count > 0 ? sum / count : 0;

    // 전체 부서 평균 및 순위 계산
    let overallSum = 0;
    let overallCount = 0;
    const deptAverages: { dept: string; avg: number }[] = [];

    if (allDeptData) {
      for (const dept of allDeptData) {
        const deptSum = dept[`other_q${qNum}_sum`] || 0;
        const deptCount = dept[`other_q${qNum}_count`] || 0;
        const deptAvg = deptCount > 0 ? deptSum / deptCount : 0;

        overallSum += deptSum;
        overallCount += deptCount;

        deptAverages.push({
          dept: dept.department,
          avg: deptAvg
        });
      }
    }

    const overallAverage = overallCount > 0 ? overallSum / overallCount : 0;

    // 순위 계산 (높은 점수가 1위, 동점 처리)
    const sortedDepts = deptAverages
      .filter(d => d.avg > 0)
      .sort((a, b) => b.avg - a.avg);

    let rank = null;
    let currentRank = 1;
    for (let i = 0; i < sortedDepts.length; i++) {
      // 이전 점수와 비교하여 동점이면 같은 순위, 아니면 현재 인덱스 + 1
      if (i > 0 && Math.abs(sortedDepts[i - 1].avg - sortedDepts[i].avg) > 0.01) {
        currentRank = i + 1;
      }

      if (sortedDepts[i].dept === department) {
        rank = currentRank;
        break;
      }
    }

    questionScores.push({
      questionNumber: qNum,
      questionText: otherQuestionTexts.get(qNum) || `타부서 평가 Q${qNum}`,
      average: Math.round(average * 10) / 10,
      rank: (rank !== null && rank > 0) ? rank : null,
      overallAverage: Math.round(overallAverage * 10) / 10,
    });
  }

  return questionScores;
}

/**
 * 서술형 응답 그룹화
 * @param questionNumbers 문항 번호 배열
 * @returns 서술형 응답 배열
 */
export async function getTextResponses(questionNumbers: number[]): Promise<Array<{ question_number: number; question_text: string; response_text: string }>> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('text_responses')
    .select('question_number, response_text')
    .in('question_number', questionNumbers);

  if (error) {
    console.error('서술형 응답 조회 실패:', error);
    return [];
  }

  // question_text는 컴포넌트에서 사용하지 않지만 인터페이스에 맞추기 위해 빈 문자열 추가
  return data?.map(r => ({
    question_number: r.question_number,
    question_text: '',
    response_text: r.response_text,
  })) || [];
}
