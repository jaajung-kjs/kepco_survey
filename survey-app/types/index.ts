import { Department, Position, EvaluationType, ResponseType, SurveySection } from '@/lib/constants';

// 사용자
export interface User {
  id: string;
  username: string;
  is_admin: boolean;
  has_completed: boolean;
  completed_at?: string;
  created_at: string;
}

// 설문 문항
export interface SurveyQuestion {
  question_number: number;
  evaluation_target: SurveySection;
  evaluation_type: EvaluationType | null;
  question_text: string;
  response_type: ResponseType;
  for_executives_only: boolean;
}

// 부서별 점수
export interface DepartmentScore {
  id: string;
  department: Department;

  // 본인 소속 조직 평가 (Q2~Q20)
  q2_sum: number;
  q2_count: number;
  q3_sum: number;
  q3_count: number;
  q4_sum: number;
  q4_count: number;
  q5_sum: number;
  q5_count: number;
  q6_sum: number;
  q6_count: number;
  q7_sum: number;
  q7_count: number;
  q8_sum: number;
  q8_count: number;
  q9_sum: number;
  q9_count: number;
  q10_sum: number;
  q10_count: number;
  q11_sum: number;
  q11_count: number;
  q12_sum: number;
  q12_count: number;
  q13_sum: number;
  q13_count: number;
  q14_sum: number;
  q14_count: number;
  q15_sum: number;
  q15_count: number;
  q16_sum: number;
  q16_count: number;
  q17_sum: number;
  q17_count: number;
  q18_sum: number;
  q18_count: number;
  q19_sum: number;
  q19_count: number;
  q20_sum: number;
  q20_count: number;

  // 타부서 평가 받은 점수 (5개 문항)
  other_q1_sum: number;
  other_q1_count: number;
  other_q2_sum: number;
  other_q2_count: number;
  other_q3_sum: number;
  other_q3_count: number;
  other_q4_sum: number;
  other_q4_count: number;
  other_q5_sum: number;
  other_q5_count: number;

  updated_at: string;
}

// 관리처 점수
export interface ManagementScore {
  id: string;

  // Q27~Q50 중 5점척도만 (서술형 제외: 20개)
  q27_sum: number;
  q27_count: number;
  q28_sum: number;
  q28_count: number;
  q29_sum: number;
  q29_count: number;
  q30_sum: number;
  q30_count: number;
  q31_sum: number;
  q31_count: number;
  q32_sum: number;
  q32_count: number;
  q33_sum: number;
  q33_count: number;
  q34_sum: number;
  q34_count: number;
  q35_sum: number;
  q35_count: number;
  q36_sum: number;
  q36_count: number;
  q37_sum: number;
  q37_count: number;
  q38_sum: number;
  q38_count: number;
  q39_sum: number;
  q39_count: number;
  q41_sum: number;
  q41_count: number;
  q42_sum: number;
  q42_count: number;
  q43_sum: number;
  q43_count: number;
  q44_sum: number;
  q44_count: number;
  q47_sum: number;
  q47_count: number;
  q48_sum: number;
  q48_count: number;
  q49_sum: number;
  q49_count: number;
  q50_sum: number;
  q50_count: number;

  updated_at: string;
}

// 서술형 응답
export interface TextResponse {
  id: string;
  question_number: number;
  question_text: string;
  response_text: string;
  respondent_department: Department | null;
  created_at: string;
}

// 설문 제출 데이터
export interface SurveySubmission {
  department: Department;
  position: Position;

  // 본인 소속 조직 평가 (Q2~Q20)
  ownDeptAnswers: Record<number, number>; // { 2: 5, 3: 4, ... }

  // 타부서 평가 (간부만, Q21~Q25)
  // { 21: { '계통운영부': 4, '송전운영부': 5, ... }, 22: { ... }, ... }
  otherDeptAnswers?: Record<number, Record<Department, number>>;

  // 관리처 전반 평가 (Q27~Q50, 5점척도)
  managementScaleAnswers: Record<number, number>;

  // 관리처 전반 평가 (Q40, Q46, 서술형)
  managementTextAnswers: Record<number, string>;

  // 종합 의견 (Q51~Q54, 서술형)
  generalOpinionAnswers: Record<number, string>;
}

// 점수 계산 결과
export interface ScoreCalculation {
  ownAverage: number;
  otherAverage: number | null;
  finalScore: number;
  difference: number | null;
  rank: number;
}

// 부서별 분석 결과
export interface DepartmentAnalysis {
  department: Department;
  scores: {
    culture: ScoreCalculation;
    performance: ScoreCalculation;
    cooperation: ScoreCalculation;
    innovation: ScoreCalculation;
  };
  detailedScores: Record<number, { average: number; rank: number; totalAverage: number }>;
  aiAnalysis?: string;
}

// 관리처 분석 결과
export interface ManagementAnalysis {
  scores: {
    culture: number;
    performance: number;
    cooperation: number;
    innovation: number;
  };
  detailedScores: Record<number, number>;
  textResponses: Record<number, string[]>;
  aiAnalysis?: string;
}
