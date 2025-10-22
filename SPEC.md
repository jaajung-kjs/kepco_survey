# 전력관리처 설문조사 시스템 명세서

## 📋 프로젝트 개요

### 목적
전력관리처 소속 10개 부서 및 관리처 전반에 대한 조직문화, 업무충실, 업무협조, 업무혁신 평가를 위한 웹 기반 설문조사 시스템

### 기술 스택
- **Frontend**: Next.js 14 (React 18, TypeScript)
- **Backend**: Supabase (PostgreSQL, Auth, RPC)
- **AI**: OpenAI GPT-4 (종합평가 생성)
- **Visualization**: Recharts (레이더 차트), react-wordcloud (키워드맵)
- **Styling**: Tailwind CSS

---

## 🏢 조직 구조

### 부서 목록 (10개)
1. 지역협력부
2. 계통운영부
3. 송전운영부
4. 변전운영부
5. 전자제어부
6. 토건운영부
7. 강릉전력
8. 동해전력
9. 원주전력
10. 태백전력

### 직급 구분
- **직원**: 본인 소속 조직 + 관리처 전반 평가
- **간부**: 직원 평가 + 타 부서/지사 평가 (9개 부서)

---

## 📊 설문 구조

### 설문 문항 구성 (총 53개 문항)

#### 1. 기본 정보 (1개)
- Q1: 소속 선택 (10개 부서 중 선택)

#### 2. 본인 소속 조직 평가 (19개, Q2~Q20)
- **조직문화** (8개): Q2~Q9
  - 신뢰와 존중, 의사결정 투명성, 리더 경청, 자율성과 책임감, 협력과 정보공유, 업무분담, 공정한 평가, 긍정적 분위기

- **업무충실** (6개): Q10~Q15
  - 목표와 역할 공유, 목표 달성, 효율성과 실행력, 전문지식과 기술, 문제해결 능력, 성과 수준

- **업무협조** (3개): Q16~Q18
  - 협업 능력, 타 조직 이해, 타 조직 성과 파악

- **업무혁신** (2개): Q19~Q20
  - 개선 제안 개방성, 혁신 활동

#### 3. 타 부서/지사 평가 (간부만, 5개 문항 × 9개 부서)
각 문항마다 9개 부서를 테이블 형태로 동시 평가

- **업무충실** (2개)
  - 조직 및 구성원의 업무수행 역량이 우수하다
  - 올 한 해 우수한 업무 성과를 달성하고 있다

- **업무협조** (2개)
  - 조직 간 갈등해결에 유연하고 적극적이다
  - 조직 간 협업에 적극적이다

- **업무혁신** (1개)
  - 구성원 직무능력 개발, 업무개선 등 혁신업무 실적이 우수하다

#### 4. 관리처 전반 평가 (24개, Q27~Q50)
- **조직문화** (9개): Q27~Q35
- **업무충실** (3개): Q36~Q38
- **업무협조** (8개): Q39~Q46 (서술형 2개 포함)
- **업무혁신** (4개): Q47~Q50

#### 5. 종합 의견 (4개, Q51~Q54, 모두 서술형)
- 향후 관리처가 집중해야 할 핵심 분야
- 관리처 내 역량 차이 감소 방안
- 개선이 가장 필요한 부분
- 관리처 발전을 위한 아이디어

---

## 🗄️ 데이터베이스 스키마

### 1. users (사용자 계정)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  has_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
```

### 2. department_scores (부서별 점수 집계)
```sql
CREATE TABLE department_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department TEXT NOT NULL UNIQUE,

  -- 본인 소속 조직 평가 (Q2~Q20: 19개)
  q2_sum INTEGER DEFAULT 0,
  q2_count INTEGER DEFAULT 0,
  q3_sum INTEGER DEFAULT 0,
  q3_count INTEGER DEFAULT 0,
  ... (q4~q20)

  -- 타부서 평가 받은 점수 (5개 문항)
  other_q1_sum INTEGER DEFAULT 0,
  other_q1_count INTEGER DEFAULT 0,
  other_q2_sum INTEGER DEFAULT 0,
  other_q2_count INTEGER DEFAULT 0,
  other_q3_sum INTEGER DEFAULT 0,
  other_q3_count INTEGER DEFAULT 0,
  other_q4_sum INTEGER DEFAULT 0,
  other_q4_count INTEGER DEFAULT 0,
  other_q5_sum INTEGER DEFAULT 0,
  other_q5_count INTEGER DEFAULT 0,

  updated_at TIMESTAMP DEFAULT now()
);
```

### 3. management_scores (관리처 전반 점수 집계)
```sql
CREATE TABLE management_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 5점척도 문항만 (Q27~Q50 중 서술형 제외: 20개)
  q27_sum INTEGER DEFAULT 0,
  q27_count INTEGER DEFAULT 0,
  ... (q28~q50, 서술형 제외)

  updated_at TIMESTAMP DEFAULT now()
);
```

### 4. text_responses (서술형 응답)
```sql
CREATE TABLE text_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  respondent_department TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### 5. survey_questions (설문 문항 마스터)
```sql
CREATE TABLE survey_questions (
  question_number INTEGER PRIMARY KEY,
  evaluation_target TEXT NOT NULL,
  evaluation_type TEXT,
  question_text TEXT NOT NULL,
  response_type TEXT NOT NULL,
  for_executives_only BOOLEAN DEFAULT false
);
```

---

## 💡 핵심 로직

### 점수 계산

#### 평균 점수
```
평균 = sum / count
```

#### 평가유형별 점수
- **조직문화**: Q2~Q9 평균
- **업무충실**: Q10~Q15 평균
- **업무협조**: Q16~Q18 평균
- **업무혁신**: Q19~Q20 평균

#### 최종 점수 (Weighted Sum)
```
최종점수 = (본인평가 × 본인응답수 + 타부서평가 × 타부서응답수) / 총응답수
차이 = 최종점수 - 본인평가
```

**표시 예시:**
- 조직문화: 4.2점 (타부서 평가 없음)
- 업무충실: 4.5점 → 최종 3.8점 (타부서 평가 반영 -0.7)
- 업무협조: 3.9점 → 최종 4.2점 (타부서 평가 반영 +0.3)

---

## 🎨 사용자 인터페이스

### 1. 로그인 페이지 (`/login`)
- ID/PW 입력
- 인증 성공 시 `/survey`로 이동

### 2. 설문 진행 페이지 (`/survey`)

#### Step 1: 부서/직급 선택
- 부서 드롭다운 (10개, 순서 고정)
- 직급 라디오 버튼 (간부/직원)

#### Step 2: 설문 작성
**직원 (48개 문항)**
- 본인 소속 조직: 19개
- 관리처 전반: 24개
- 종합 의견: 4개

**간부 (53개 문항)**
- 본인 소속 조직: 19개
- **타 부서 평가: 5개 문항 (테이블 UI)**
  ```
  [업무충실] 조직 및 구성원의 업무수행 역량이 우수하다

  부서명        | 1점 | 2점 | 3점 | 4점 | 5점
  -------------|-----|-----|-----|-----|-----
  계통운영부    | ○   | ○   | ●   | ○   | ○
  송전운영부    | ○   | ○   | ○   | ○   | ●
  ...
  ```
- 관리처 전반: 24개
- 종합 의견: 4개

#### Step 3: 제출 완료
- 완료 메시지 표시
- 재제출 불가

### 3. 관리자 대시보드 (`/admin`) ✅ **구현 완료**

#### 3.1 전체 현황 (`/admin/dashboard`) ✅
**구현 내역**:
- 페이지: `app/admin/dashboard/page.tsx`
- API: `/api/admin/stats` (전체/부서별 응답 통계)
- 전체 응답 현황 카드 (전체 대상, 응답 완료, 응답률)
- 부서별 응답 현황 테이블 (10개 부서, 응답률 색상 표시)
- 메뉴 링크 (관리처 전반 분석, 전체 순위, 로그아웃)

**기술 스택**:
- Next.js 15 Server Components
- Supabase users 테이블 조회
- username 파싱으로 부서별 응답 집계

#### 3.2 부서별 분석 (`/admin/department/[id]`) ✅
**구현 내역**:
- 페이지: `app/admin/department/[id]/page.tsx`
- 컴포넌트: `DepartmentRadarChart.tsx`, `AIAnalysis.tsx`
- API: `/api/scores/department?department={dept}`
- **레이더 차트**: 4개 평가유형 점수 시각화 (Recharts)
  - 본인평가 vs 타부서평가 비교
  - 조직문화, 업무충실, 업무협조, 업무혁신
- **점수 상세 테이블**:
  | 평가유형 | 본인평가 | 타부서평가 | 최종점수 | 차이 | 순위 |
  |---------|----------|-----------|---------|------|------|
  | 조직문화 |  4.1점 | - | 4.1점 | - | 2위 |
  | 업무충실 |  4.5점 | 3.8점 | 3.8점 | -0.7 | 1위 |
- **AI 종합평가**: GPT-4 기반 분석
  - 강점 분야
  - 개선 필요 분야
  - 자체평가 vs 타부서평가 차이 분석
  - 구체적 개선 제안

**기술적 특징**:
- Next.js 15 async params 처리 (`await params`)
- API 응답 변환 계층 (scores → byType)
- react-markdown으로 AI 분석 렌더링

#### 3.3 관리처 분석 (`/admin/management`) ✅
**구현 내역**:
- 페이지: `app/admin/management/page.tsx`
- 컴포넌트: `ManagementRadarChart.tsx`, `TextResponseWordCloud.tsx`, `AIAnalysis.tsx`
- API: `/api/scores/management`
- **레이더 차트**: 5점척도 문항 평균 (Recharts)
  - 조직문화, 업무충실, 업무협조, 업무혁신
- **평가유형별 평균 점수 테이블**
- **세부 문항별 점수 테이블**
- **서술형 워드클라우드**: 키워드 시각화 (react-wordcloud)
  - 6개 서술형 문항별 워드클라우드
  - Q40, Q45, Q50, Q51, Q52, Q53
- **AI 분석**: 5점척도 문항 종합평가

**기술적 특징**:
- API 응답 변환 (scores → byType, questions, textResponses)
- 한글 텍스트 처리 및 워드클라우드 생성
- 평가유형별 문항 그룹화

#### 3.4 전체 순위 (`/admin/ranking`) ✅
**구현 내역**:
- 페이지: `app/admin/ranking/page.tsx`
- 컴포넌트: `RankingBarChart.tsx`
- API: `/api/scores/department` (전체 부서)
- **부서별 종합 순위 차트** (Recharts 바 차트)
  - 10개 부서 순위 표시
  - 평균 점수 표시
- **종합 순위 상세 테이블**
  - 순위 뱃지 (1위 금, 2위 은, 3위 동)
  - 평균 점수
  - 상세 분석 링크
- **평가유형별 순위 차트** (4개)
  - 조직문화 순위 차트
  - 업무충실 순위 차트
  - 업무협조 순위 차트
  - 업무혁신 순위 차트
  - 그리드 레이아웃 (2×2)

**기술적 특징**:
- 전체 부서 점수 데이터 로드 및 변환
- 평가유형별 순위 데이터 생성
- 종합 순위 계산 (4개 평가유형 평균)

---

## 🔐 보안 및 권한

### 인증
- Supabase Auth 사용
- 비밀번호 bcrypt 해싱

### 권한 관리
- **일반 사용자**: `/survey` 접근, 1회 제출 제한
- **관리자**: `/admin/*` 전체 접근

### Row Level Security (RLS)
```sql
-- 관리자만 집계 데이터 조회 가능
CREATE POLICY admin_read_scores ON department_scores
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );
```

---

## 🤖 AI 분석 기능

### OpenAI GPT-4 Prompt 구조

#### 부서별 분석
```
[평가유형별 최종 점수]
- 조직문화: 4.1점 (2위) - 타부서 평가 없음
- 업무충실: 4.5점 → 3.8점 (타부서 -0.7, 1위)
- 업무협조: 3.9점 → 4.2점 (타부서 +0.3, 5위)
- 업무혁신: 4.0점 → 3.7점 (타부서 -0.3, 4위)

[세부 문항별 점수]
Q2. 신뢰와 존중: 4.2점 (전체 평균 3.8, 3위)


Q1. 타부서 평가1(상세문항) : 4.2점 (전체 평균 3.8, 1위)
...

분석 요청:
1. 강점 분야
2. 개선 필요 분야
3. 자체평가 vs 타부서평가 차이 분석
4. 구체적 개선 제안
```

#### 관리처 분석
```
[평가유형별 평균]
- 조직문화: 4.0점
- 업무충실: 3.9점
- 업무협조: 3.7점
- 업무혁신: 4.2점

[세부 문항별 점수]
Q27. 의사결정 투명성: 3.8점
...

분석 요청:
1. 관리처 강점
2. 개선 영역
3. 우선순위별 개선 제안
```

---

## 📈 성능 최적화

### 데이터베이스
- 인덱스 생성: department, evaluation_type
- PostgreSQL 함수로 점수 업데이트 최적화
- 집계 테이블로 실시간 계산 부하 감소

### 프론트엔드
- Next.js App Router (Server Components)
- 차트 데이터 서버 사이드 계산
- React Suspense로 단계별 로딩

---

## 🚀 배포

### 환경
- **Frontend**: Vercel
- **Database**: Supabase (호스팅)
- **AI**: OpenAI API

### 환경 변수
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

---

## 📝 데이터 흐름

### 설문 제출
```
사용자 입력
  ↓
부서/직급 선택
  ↓
설문 작성 (본인 + 타부서 + 관리처)
  ↓
점수 집계 업데이트 (Supabase RPC)
  - department_scores: q*_sum += score, q*_count += 1
  - management_scores: q*_sum += score, q*_count += 1
  - text_responses: INSERT
  ↓
users.has_completed = true
```

### 분석 조회
```
관리자 접속
  ↓
부서 선택
  ↓
점수 계산 (sum / count)
  ↓
순위 산출 (전체 부서 비교)
  ↓
AI 분석 요청 (OpenAI API)
  ↓
결과 시각화 (레이더 차트, 테이블, 워드클라우드)
```

---

## 🎯 핵심 차별점

1. **익명성 보장**: 개별 응답 추적 없이 집계만 저장
2. **효율적 타부서 평가 UI**: 1개 질문 → 9개 부서 동시 평가 (테이블)
3. **Weighted Sum**: 본인 + 타부서 평가 통합한 최종 점수
4. **AI 기반 인사이트**: GPT-4로 객관적 분석 및 개선 제안
5. **실시간 시각화**: 레이더 차트, 워드클라우드로 직관적 이해

---

## 📚 참고 자료

- 설문 문항 원본: `설문조사_통합본.xlsx`
- Next.js 공식 문서: https://nextjs.org/docs
- Supabase 공식 문서: https://supabase.com/docs
- Recharts 공식 문서: https://recharts.org
