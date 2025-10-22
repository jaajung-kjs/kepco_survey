# 전력관리처 설문조사 시스템 - 태스크 리스트

**프로젝트 시작일**: 2025-10-21
**예상 완료일**: 2025-10-28

---

## ✅ Phase 0: 문서화 및 계획 (완료)

- [x] SPEC.md 작성
- [x] TASKS.md 작성

---

## 📦 Phase 1: 기반 구축

### 1.1 Supabase 데이터베이스 설정
- [x] users 테이블 생성
- [x] department_scores 테이블 생성 (19개 문항 + 5개 타부서 평가)
- [x] management_scores 테이블 생성 (20개 5점척도 문항)
- [x] text_responses 테이블 생성
- [x] survey_questions 테이블 생성
- [x] 10개 부서 department_scores 초기 레코드 생성
- [x] management_scores 초기 레코드 생성

### 1.2 PostgreSQL 함수 작성
- [x] increment_dept_score() 함수 생성
- [x] increment_other_score() 함수 생성
- [x] increment_management_score() 함수 생성

### 1.3 RLS 정책 설정
- [ ] users 테이블 RLS 정책
- [ ] department_scores RLS 정책 (관리자만 읽기)
- [ ] management_scores RLS 정책 (관리자만 읽기)
- [ ] text_responses RLS 정책 (관리자만 읽기)

### 1.4 설문 문항 데이터 삽입
- [x] 엑셀 파일에서 설문 문항 추출
- [x] survey_questions 테이블에 53개 문항 삽입

---

## 🎨 Phase 2: Next.js 프로젝트 초기화

### 2.1 프로젝트 생성
- [x] Next.js 14 프로젝트 생성 (TypeScript)
- [x] 필수 패키지 설치
  - [x] @supabase/supabase-js
  - [x] openai
  - [x] recharts
  - [x] react-wordcloud (--legacy-peer-deps)
  - [x] bcrypt
  - [x] tailwindcss

### 2.2 프로젝트 구조 설정
- [x] 폴더 구조 생성 (app, components, lib, types)
- [x] Supabase 클라이언트 설정 (lib/supabase.ts)
- [x] 상수 정의 (lib/constants.ts)
- [x] TypeScript 타입 정의 (types/index.ts)

### 2.3 환경 변수 설정
- [x] .env.local 파일 생성
- [x] Supabase URL, ANON_KEY 설정
- [ ] SERVICE_ROLE_KEY 설정 (필요시)
- [ ] OpenAI API KEY 설정 (필요시)

---

## 🔐 Phase 3: 인증 시스템

### 3.1 로그인 페이지
- [x] 로그인 UI 구현 (app/login/page.tsx)
- [x] 로그인 로직 구현 (ID/PW 방식, bcrypt 해싱)
- [x] 에러 핸들링 (잘못된 인증 정보)
- [x] 로그아웃 API 구현

### 3.2 인증 미들웨어
- [x] 로그인 상태 확인 미들웨어 (middleware.ts)
- [x] 관리자 권한 확인 로직 (lib/auth.ts)
- [x] 중복 제출 방지 (has_completed 확인)
- [x] 사용자 계정 생성 스크립트 (scripts/create-users.ts)

---

## 📝 Phase 4: 설문 시스템

### 4.1 부서/직급 선택
- [x] 선택 UI 구현 (components/DepartmentPositionSelect.tsx)
- [x] 10개 부서 드롭다운 (순서 고정)
- [x] 직급 선택 라디오 버튼 (간부/직원)
- [x] 유효성 검증

### 4.2 본인 소속 조직 설문 (Q2~Q20)
- [x] 설문 폼 컴포넌트 (components/SurveyForm, OwnDeptSurvey)
- [x] 5점척도 질문 렌더링 (19개, ScaleQuestion 컴포넌트)
- [x] 진행률 표시 (실시간 업데이트)
- [x] 평가유형별 그룹화 (조직문화, 업무충실, 업무협조, 업무혁신)
- [x] 유효성 검증 (모든 문항 필수)
- [x] API 엔드포인트 (/api/survey/questions)
- [ ] 임시저장 기능 (로컬 스토리지) - 추후 구현

### 4.3 타부서 평가 (간부만, 5문항 × 9부서)
- [x] 테이블 UI 컴포넌트 (components/OtherDeptEvaluation)
- [x] 5개 문항 렌더링
- [x] 각 문항당 9개 부서 평가 테이블
- [x] 필수 입력 검증 (모든 셀 채워짐 확인)
- [x] 진행률 표시 및 검증
- [x] 평가유형별 그룹화

### 4.4 관리처 전반 설문 (Q26~Q49)
- [x] TextQuestion 컴포넌트 구현 (components/TextQuestion.tsx)
- [x] ManagementSurvey 컴포넌트 구현 (components/ManagementSurvey.tsx)
- [x] 5점척도 문항 (22개, Q26-Q49 중 Q40/Q45 제외)
- [x] 서술형 문항 (2개, Q40, Q45)
- [x] 조건부 렌더링 (Q39 ≤ 2점일 때만 Q40 표시)
- [x] 평가유형별 그룹화 (조직문화, 업무충실, 업무협조, 업무혁신)
- [x] 진행률 표시 (5점척도 문항만 카운트)
- [x] 유효성 검증 (5점척도만 필수, 서술형 선택)
- [x] SurveyForm 통합

### 4.5 종합 의견 (Q50~Q53)
- [x] OpinionSurvey 컴포넌트 구현 (components/OpinionSurvey.tsx)
- [x] 서술형 4개 문항 렌더링 (Q50-Q53)
- [x] TextQuestion 컴포넌트 재사용
- [x] 모든 문항 선택사항 (required=false)
- [x] 안내 문구 표시 (선택사항 명시)
- [x] SurveyForm 통합 (loadOpinionQuestions, handleOpinionSubmit)
- [x] API 엔드포인트 이미 지원 (type=opinion)

### 4.6 제출 로직
- [x] API 라우트 생성 (app/api/survey/submit)
- [x] 부서별 점수 업데이트 (Supabase RPC 호출)
- [x] 타부서 점수 업데이트
- [x] 관리처 점수 업데이트
- [x] 서술형 응답 저장
- [x] users.has_completed = true 업데이트
- [x] 에러 핸들링
- [x] 완료 페이지 생성 (app/survey/completed/page.tsx)
- [x] End-to-end 테스트 (Playwright)

---

## 📊 Phase 5: 점수 계산 엔진 ✅ (100%)

### 5.1 부서별 점수 계산
- [x] calculateDepartmentScores() 함수 (lib/scoreCalculator.ts)
- [x] 평가유형별 평균 계산 (조직문화, 업무충실, 업무협조, 업무혁신)
- [x] Weighted Sum 계산 (본인 + 타부서)
- [x] 차이값 계산 (최종 - 본인)

### 5.2 순위 산출
- [x] 평가유형별 순위 계산
- [x] 전체 평균 순위 계산
- [x] 10개 부서 비교 로직

### 5.3 관리처 점수 계산
- [x] calculateManagementScores() 함수
- [x] 평가유형별 평균 (5점척도만)
- [x] 서술형 응답 그룹화

### 5.4 세부 문항 점수
- [x] 각 문항별 평균 계산
- [x] 전체 부서 평균과 비교
- [x] 문항별 순위

### 5.5 API 엔드포인트
- [x] /api/scores/department (전체 및 특정 부서)
- [x] /api/scores/management (관리처 점수 + 서술형)

---

## 🎯 Phase 6: 관리자 대시보드 - 전체 현황

### 6.1 응답 현황 대시보드
- [ ] 페이지 생성 (app/admin/dashboard/page.tsx)
- [ ] 전체 응답률 표시
- [ ] 부서별 응답률 표시
- [ ] 직급별 응답률 표시
- [ ] 실시간 업데이트

### 6.2 부서 필터링
- [ ] 부서 선택 드롭다운
- [ ] 부서별 상세 페이지 링크

---

## 📈 Phase 7: 관리자 대시보드 - 부서별 분석

### 7.1 부서별 분석 페이지
- [ ] 페이지 생성 (app/admin/department/[id]/page.tsx)
- [ ] URL 파라미터에서 부서명 추출
- [ ] 점수 데이터 로드

### 7.2 레이더 차트
- [ ] RadarChart 컴포넌트 (components/RadarChart)
- [ ] 4개 평가유형 시각화
- [ ] Recharts 라이브러리 설정

### 7.3 점수 상세 테이블
- [ ] 평가유형별 점수 테이블
- [ ] 본인 평가 vs 최종 점수 비교
- [ ] 타부서 평가 반영 차이 표시
- [ ] 순위 표시

### 7.4 세부 문항 분석
- [ ] 문항별 점수 테이블
- [ ] 전체 평균과 비교
- [ ] 문항별 순위

---

## 🤖 Phase 8: AI 종합평가 (부서별)

### 8.1 OpenAI API 연동
- [ ] OpenAI 클라이언트 설정 (lib/openai.ts)
- [ ] API 키 검증

### 8.2 Prompt 생성
- [ ] 부서별 분석 Prompt 템플릿
- [ ] 평가유형별 점수 포함
- [ ] 세부 문항 점수 포함
- [ ] 타부서 평가 차이 포함

### 8.3 AI 분석 생성
- [ ] generateDepartmentAIAnalysis() 함수
- [ ] GPT-4 API 호출
- [ ] 응답 파싱 및 포맷팅
- [ ] 에러 핸들링

### 8.4 AI 분석 UI
- [ ] AIAnalysis 컴포넌트
- [ ] 마크다운 렌더링
- [ ] 로딩 상태 표시

---

## 🏢 Phase 9: 관리자 대시보드 - 관리처 분석

### 9.1 관리처 분석 페이지
- [ ] 페이지 생성 (app/admin/management/page.tsx)
- [ ] 관리처 점수 데이터 로드

### 9.2 레이더 차트
- [ ] 4개 평가유형 시각화 (5점척도만)

### 9.3 서술형 응답 워드클라우드
- [ ] WordCloud 컴포넌트 (components/WordCloud)
- [ ] 한글 형태소 분석
- [ ] 불용어 제거
- [ ] 6개 서술형 문항별 워드클라우드 생성
- [ ] react-wordcloud 라이브러리 설정

### 9.4 AI 분석 (관리처)
- [ ] generateManagementAIAnalysis() 함수
- [ ] Prompt 생성 (5점척도 문항만)
- [ ] AI 분석 UI

---

## 📊 Phase 10: 관리자 대시보드 - 전체 순위

### 10.1 전체 순위 페이지
- [ ] 페이지 생성 (app/admin/ranking/page.tsx)
- [ ] 부서별 종합 순위 데이터 로드

### 10.2 종합 순위 차트
- [ ] 바 차트로 10개 부서 순위 표시
- [ ] 평균 점수 표시

### 10.3 평가유형별 순위 차트
- [ ] 조직문화 순위 차트
- [ ] 업무충실 순위 차트
- [ ] 업무협조 순위 차트
- [ ] 업무혁신 순위 차트

---

## 🎨 Phase 11: UI/UX 개선

### 11.1 반응형 디자인
- [ ] 모바일 레이아웃
- [ ] 태블릿 레이아웃
- [ ] 데스크톱 레이아웃

### 11.2 스타일링
- [ ] Tailwind CSS 커스텀 설정
- [ ] 컬러 팔레트 정의
- [ ] 버튼, 입력 필드 스타일

### 11.3 로딩 상태
- [ ] Suspense 경계 설정
- [ ] 스켈레톤 UI
- [ ] 로딩 스피너

### 11.4 에러 처리
- [ ] 에러 바운더리
- [ ] 에러 메시지 UI
- [ ] 재시도 버튼

---

## 🧪 Phase 12: 테스트

### 12.1 테스트 계정 생성
- [ ] 일반 사용자 10개 (부서별 1개씩)
- [ ] 간부 계정 5개
- [ ] 관리자 계정 1개

### 12.2 기능 테스트
- [ ] 로그인 플로우
- [ ] 직원 설문 제출
- [ ] 간부 설문 제출 (타부서 평가 포함)
- [ ] 중복 제출 방지 확인
- [ ] 점수 계산 검증
- [ ] 순위 계산 검증

### 12.3 관리자 기능 테스트
- [ ] 응답 현황 조회
- [ ] 부서별 분석 조회
- [ ] 레이더 차트 렌더링
- [ ] AI 분석 생성
- [ ] 워드클라우드 생성
- [ ] 전체 순위 조회

### 12.4 성능 테스트
- [ ] 대량 데이터 시뮬레이션 (100명 응답)
- [ ] 차트 렌더링 성능
- [ ] API 응답 시간

---

## 🚀 Phase 13: 배포

### 13.1 Vercel 배포 준비
- [ ] next.config.js 설정
- [ ] 환경 변수 Vercel에 등록
- [ ] 빌드 테스트

### 13.2 배포
- [ ] Vercel 프로젝트 생성
- [ ] GitHub 연동
- [ ] 자동 배포 설정
- [ ] 프로덕션 URL 확인

### 13.3 배포 후 검증
- [ ] 프로덕션 환경 기능 테스트
- [ ] Supabase 연결 확인
- [ ] OpenAI API 호출 확인

---

## 📝 Phase 14: 문서화 및 인수인계

### 14.1 사용자 매뉴얼
- [ ] 일반 사용자 가이드 작성
- [ ] 관리자 가이드 작성

### 14.2 기술 문서
- [ ] API 문서
- [ ] 데이터베이스 스키마 문서
- [ ] 배포 가이드

### 14.3 코드 정리
- [ ] 주석 정리
- [ ] 불필요한 코드 제거
- [ ] 코드 포맷팅

---

## 📊 진행 현황

**전체 진행률**: 86/193 (45%)

**Phase별 진행률**:
- Phase 0: 100% ✅
- Phase 1: 80% (RLS 정책 제외 완료)
- Phase 2: 100% ✅
- Phase 3: 100% ✅
- Phase 4: 100% ✅ (설문 시스템 완료)
- Phase 5: 100% ✅ (점수 계산 엔진 완료)
- Phase 6: 0%
- Phase 7: 0%
- Phase 8: 0%
- Phase 9: 0%
- Phase 10: 0%
- Phase 11: 0%
- Phase 12: 0%
- Phase 13: 0%
- Phase 14: 0%

---

## 🔄 업데이트 로그

**2025-10-21 17:00**: 프로젝트 시작, 문서 작성 완료
**2025-10-21 17:10**: Phase 1 Supabase 데이터베이스 구축 완료 (13/100 체크리스트 완료)
- users, department_scores, management_scores, text_responses, survey_questions 테이블 생성
- 10개 부서 초기 레코드 생성
- PostgreSQL 함수 3개 생성 (increment_dept_score, increment_other_score, increment_management_score)
- 53개 설문 문항 삽입 완료

**2025-10-21 17:30**: Phase 2 Next.js 프로젝트 초기화 완료 (23/100 체크리스트 완료)
- Next.js 14 프로젝트 생성 (survey-app/)
- 필수 패키지 설치 (--legacy-peer-deps로 React 19 호환성 해결)
- 프로젝트 구조 설정 (components/, lib/, types/ 디렉토리)
- Supabase 클라이언트, 상수, TypeScript 타입 정의 완료
- 환경 변수 설정 (.env.local 생성, Supabase URL/ANON_KEY 설정)

**2025-10-21 18:00**: Phase 3 인증 시스템 완료 (31/100 체크리스트 완료)
- ID/PW 로그인 페이지 구현 (app/login/page.tsx)
- 로그인/로그아웃 API 엔드포인트 (/api/auth/login, /api/auth/logout)
- bcrypt 비밀번호 해싱 및 검증
- 미들웨어 기반 인증 확인 (middleware.ts)
- 사용자 인증 유틸리티 함수 (lib/auth.ts)
- 설문 완료 여부 확인 및 리다이렉트 로직
- 사용자 계정 생성 스크립트 (scripts/create-users.ts)
- Playwright 테스트 완료 (모든 시나리오 통과)

**2025-10-21 19:00**: Phase 4 설문 시스템 부분 완료 (42/184 체크리스트 완료, 23%)
- 부서/직급 선택 UI (components/DepartmentPositionSelect.tsx)
- 본인 소속 조직 설문 컴포넌트 (components/OwnDeptSurvey.tsx)
- 5점 척도 질문 컴포넌트 (components/ScaleQuestion.tsx)
- 설문 문항 API 엔드포인트 (/api/survey/questions)
- 설문 문항 조회 유틸리티 (lib/surveyQuestions.ts)
- 평가유형별 그룹화 및 진행률 표시
- 유효성 검증 (미답변 문항 확인)
- Playwright 테스트 완료 (부서/직급 선택, 본인 소속 조직 설문)

**2025-10-21 19:40**: Phase 4.3 타부서 평가 테이블 완료 (52/184 체크리스트 완료, 28%)
- 타부서 평가 테이블 UI 구현 (components/OtherDeptEvaluation.tsx)
- 5개 문항 × 9개 부서 테이블 렌더링 (본인 부서 자동 제외)
- 진행률 표시 및 실시간 업데이트 (0~100%)
- 유효성 검증 (45개 셀 모두 필수 입력)
- 평가유형별 그룹화 (업무충실, 업무협조, 업무혁신)
- Playwright 테스트 완료 (테이블 렌더링, 진행률, 검증, 네비게이션)

**2025-10-21 20:30**: Phase 4.4 관리처 전반 설문 완료 (61/184 체크리스트 완료, 33%)
- TextQuestion 컴포넌트 구현 (components/TextQuestion.tsx)
- ManagementSurvey 컴포넌트 구현 (components/ManagementSurvey.tsx)
- 5점척도 문항 22개 렌더링 (Q26-Q49, Q40/Q45 제외)
- 서술형 문항 2개 렌더링 (Q40, Q45)
- 조건부 렌더링 로직 구현 (Q39 답변 ≤ 2점일 때만 Q40 표시)
- 평가유형별 그룹화 (조직문화 9개, 업무충실 3개, 업무협조 6개, 업무혁신 4개)
- 진행률 표시 (5점척도 문항만 카운트, 22개 중 답변 개수)
- 이중 상태 관리 (scaleAnswers, textAnswers 분리)
- 유효성 검증 (5점척도만 필수, 서술형 선택)
- SurveyForm에 통합 (loadManagementQuestions, handleManagementSubmit)
- Playwright 테스트 완료 (렌더링, 조건부 Q40, 진행률 100%, 텍스트 입력, 제출)

**2025-10-21 21:00**: Phase 4.5 종합 의견 완료 (68/184 체크리스트 완료, 37%)
- OpinionSurvey 컴포넌트 구현 (components/OpinionSurvey.tsx)
- 서술형 4개 문항 렌더링 (Q50-Q53)
- TextQuestion 컴포넌트 재사용
- 모든 문항 선택사항 처리 (required=false)
- 안내 문구 표시 ("아래 질문에 대한 의견을 자유롭게 작성해주세요. (선택사항)")
- SurveyForm 통합 (loadOpinionQuestions, handleOpinionSubmit)
- API 엔드포인트 이미 지원 확인 (type=opinion)
- Playwright 테스트 완료 (렌더링, 텍스트 입력, 제출, Console 로그 확인)

**2025-10-22 09:30**: Phase 4.6 설문 제출 API 완료 (77/184 체크리스트 완료, 42%)
- 설문 제출 API 라우트 구현 (app/api/survey/submit/route.ts)
- 부서별 점수 업데이트 (Supabase RPC: increment_dept_score)
- 타부서 점수 업데이트 (Supabase RPC: increment_other_score)
- 관리처 점수 업데이트 (Supabase RPC: increment_management_score)
- 서술형 응답 저장 (text_responses 테이블)
- users.has_completed = true 업데이트
- 완료 페이지 생성 (app/survey/completed/page.tsx)
- 로그아웃 기능 통합
- 데이터베이스 스키마 수정:
  * management_scores 테이블에 q26_sum/count, q41_sum/count, q42_sum/count 추가
  * 서술형 문항(q40, q45, q50) 컬럼 제거
  * increment_management_score 함수 WHERE 절 추가
- 버그 수정:
  * getCurrentUser import 수정
  * RPC 파라미터명 수정 (dept, question, score)
  * 질문 번호에 'q' prefix 추가
- End-to-end 테스트 완료 (Playwright)
  * 전체 설문 플로우 (부서선택 → 본인조직 → 관리처 → 종합의견 → 제출 → 완료페이지)
  * 데이터베이스 저장 확인
  * 리다이렉트 동작 확인
- **Phase 4 완료 ✅**

**2025-10-22 10:00**: Phase 5 점수 계산 엔진 완료 (86/193 체크리스트 완료, 45%)
- 점수 계산 모듈 구현 (lib/scoreCalculator.ts)
- 부서별 점수 계산 함수 (calculateDepartmentScores):
  * 평가유형별 평균 계산 (조직문화, 업무충실, 업무협조, 업무혁신)
  * 본인평가 + 타부서평가 가중합 계산 (Weighted Sum)
  * 차이값 계산 (최종점수 - 본인평가)
- 전체 부서 점수 및 순위 계산 (calculateAllDepartmentScores):
  * 10개 부서 전체 점수 계산
  * 평가유형별 순위 산출 (1-10위)
  * 전체 평균 순위 산출
- 관리처 점수 계산 함수 (calculateManagementScores):
  * 평가유형별 5점척도 평균 계산
  * 문항별 세부 점수 저장
- 세부 문항 점수 함수 (getDepartmentQuestionScores):
  * Q2-Q20 각 문항별 평균 계산
  * 전체 부서 평균과 비교
- 서술형 응답 그룹화 함수 (getTextResponses):
  * 문항번호별 서술형 응답 그룹화
- API 엔드포인트 구현:
  * /api/scores/department - 전체/특정 부서 점수 조회
  * /api/scores/management - 관리처 점수 + 서술형 응답 조회
- 타입스크립트 컴파일 오류 수정
- **Phase 5 완료 ✅**

**2025-10-22 11:00**: Phase 5 E2E 테스트 완료
- 간부 계정 테스트 (전자제어부 간부1, 계통운영부 간부2)
- 가중 평균 계산 검증:
  * 본인평가 (own_dept) + 타부서평가 (other_dept) 가중평균
  * 전자제어부: 5.00 본인 + 5.00 타부서 = 5.00 최종 (차이 0.00)
  * 계통운영부: 4.00 본인 + 3.00 타부서 = 3.75 최종 (차이 -0.25)
- 평가유형별 가중평균 검증 (조직문화, 업무충실, 업무협조, 업무혁신)
- 관리처 점수 평균 검증 (조직문화 4.00, 업무충실 4.00, 업무협조 4.00, 업무혁신 4.00)
- 로그아웃 기능 추가 (components/SurveyCompleted.tsx)
- Playwright 테스트 완료 (간부 설문 플로우, 데이터베이스 점수 확인)
- **Phase 5 테스트 완료 ✅**
