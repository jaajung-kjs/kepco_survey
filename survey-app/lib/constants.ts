// 10개 부서 목록 (고정 순서)
export const DEPARTMENTS = [
  '지역협력부',
  '계통운영부',
  '송전운영부',
  '변전운영부',
  '전자제어부',
  '토건운영부',
  '강릉전력',
  '동해전력',
  '원주전력',
  '태백전력',
] as const;

export type Department = typeof DEPARTMENTS[number];

// 직급 구분
export const POSITIONS = {
  EMPLOYEE: '직원',
  EXECUTIVE: '간부',
} as const;

export type Position = typeof POSITIONS[keyof typeof POSITIONS];

// 평가 유형
export const EVALUATION_TYPES = {
  CULTURE: '조직문화',
  PERFORMANCE: '업무충실',
  COOPERATION: '업무협조',
  INNOVATION: '업무혁신',
} as const;

export type EvaluationType = typeof EVALUATION_TYPES[keyof typeof EVALUATION_TYPES];

// 응답 유형
export const RESPONSE_TYPES = {
  SCALE_5: '5점척도',
  TEXT: '서술형',
  CHOICE: '선다형',
} as const;

export type ResponseType = typeof RESPONSE_TYPES[keyof typeof RESPONSE_TYPES];

// 설문 구간
export const SURVEY_SECTIONS = {
  BASIC_INFO: '기본정보',
  OWN_DEPT: '본인 소속 조직',
  OTHER_DEPT: '타 부서/지사',
  MANAGEMENT: '관리처 전반',
  GENERAL_OPINION: '종합 의견',
} as const;

export type SurveySection = typeof SURVEY_SECTIONS[keyof typeof SURVEY_SECTIONS];
