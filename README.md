# 교육용 AI 퀴즈 플랫폼

OpenAI API로 퀴즈를 생성하고, Firebase Firestore로 데이터를 저장·조회하며, Firebase Hosting으로 배포하는 교육용 퀴즈 플랫폼입니다.

**배포 URL**: https://quiz-32329.web.app  
**Firebase 프로젝트**: `quiz-32329`

---

## 목차

- [기능](#기능)
- [기술 스택](#기술-스택)
- [빠른 시작](#빠른-시작)
- [Firebase 설치](#firebase-설치)
- [Firebase 프로젝트 설정](#firebase-프로젝트-설정)
- [환경 변수](#환경-변수)
- [Firestore 데이터 구조](#firestore-데이터-구조)
- [Firebase 배포](#firebase-배포)
- [테스트](#테스트)
- [사용 방법](#사용-방법)
- [주의사항](#주의사항)
- [문제 해결](#문제-해결)
- [프로젝트 구조](#프로젝트-구조)

---

## 기능

| 역할 | 기능 |
|------|------|
| **교수자** | OpenAI로 4지선다 퀴즈 생성 · 검토/수정 · Firestore 저장 · 활성화/비활성화 · 리더보드 |
| **학습자** | 활성 퀴즈 응시 · 즉시 채점 · 실시간 리더보드 |
| **공통** | 닉네임 + 역할 기반 로그인 (localStorage 세션) |

---

## 기술 스택

- **프론트엔드**: React 19, Vite 8, Tailwind CSS 4
- **AI**: OpenAI API (`gpt-4o-mini`)
- **백엔드/DB**: Firebase Firestore
- **배포**: Firebase Hosting
- **CLI**: `firebase-tools` (devDependency)

---

## 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일에 OpenAI·Firebase 키 입력

# 3. 개발 서버
npm run dev
```

로컬 접속: http://localhost:5173

---

## Firebase 설치

### CLI 패키지 (이 프로젝트 방식)

Firebase CLI는 **`firebase-tools`** 패키지로 설치합니다. `npm` 스크립트를 통해 실행합니다.

```bash
npm install
```

`package.json`의 `devDependencies`에 `firebase-tools`가 포함되어 있으며, `node_modules/.bin/firebase`로 실행됩니다.

### 올바른 명령어 vs 잘못된 명령어

| 용도 | 올바른 명령 | 잘못된 명령 (오류 발생) |
|------|------------|------------------------|
| 로그인 | `npm run firebase:login` | `npx firebase login` |
| 배포 | `npm run deploy` | `npx firebase deploy` |
| CLI 직접 실행 | `npm run firebase -- <명령>` | `npx firebase <명령>` |

> `firebase` npm 패키지는 **브라우저용 JavaScript SDK**이며 CLI가 아닙니다.  
> `npx firebase` 실행 시 `could not determine executable to run` 오류가 납니다.

### 전역 설치 (선택)

```bash
npm install -g firebase-tools
firebase login
```

전역 설치 시에는 `firebase login`, `firebase deploy`를 직접 사용할 수 있습니다.

### 로그인 확인

```bash
npm run firebase -- login:list
```

`Logged in as your@email.com` 이 표시되면 인증 완료입니다.

---

## Firebase 프로젝트 설정

### 1. Firebase Console에서 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com) 접속
2. **프로젝트 추가** → 프로젝트 ID 기록 (예: `quiz-32329`)
3. **Firestore Database** 생성 (Native mode, 지역 선택)
4. **Hosting** 사용 설정 (선택, CLI로도 가능)

### 2. 웹 앱 등록 및 설정값 복사

프로젝트 설정 → **일반** → **내 앱** → 웹 앱 추가 후 아래 값을 `.env`에 입력합니다.

| 환경 변수 | 설명 |
|-----------|------|
| `VITE_FIREBASE_API_KEY` | API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `프로젝트ID.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | 프로젝트 ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `프로젝트ID.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |

### 3. `.firebaserc` 설정

프로젝트 루트에 `.firebaserc` 파일이 있어야 합니다.

```json
{
  "projects": {
    "default": "quiz-32329"
  }
}
```

`default` 값을 본인 Firebase 프로젝트 ID로 변경하세요.  
`.firebaserc.example`을 참고할 수 있습니다.

### 4. `firebase.json` 구성

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

| 항목 | 역할 |
|------|------|
| `firestore.rules` | Firestore 보안 규칙 |
| `firestore.indexes.json` | 복합 인덱스 정의 |
| `hosting.public` | Vite 빌드 결과물 (`dist`) |

### 5. Firestore 규칙·인덱스 최초 배포

```bash
npm run firebase:login
npm run firebase -- deploy --only firestore:rules,firestore:indexes
```

인덱스 생성은 콘솔에서 수 분 걸릴 수 있습니다.

---

## 환경 변수

`.env.example`을 복사해 `.env`를 만듭니다.

```bash
cp .env.example .env
```

```env
# OpenAI (퀴즈 AI 생성)
VITE_OPENAI_API_KEY=sk-...

# Firebase (Firestore + Hosting 빌드에 포함)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=quiz-32329.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=quiz-32329
VITE_FIREBASE_STORAGE_BUCKET=quiz-32329.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 주의: Vite 환경 변수는 빌드 시점에 포함됨

- `VITE_` 접두사 변수는 **`npm run build` 시점**에 번들에 삽입됩니다.
- `.env`를 수정한 뒤에는 **반드시 다시 빌드·배포**해야 Hosting에 반영됩니다.
- `.env`는 Git에 커밋하지 마세요 (`.gitignore`에 등록됨).

---

## Firestore 데이터 구조

```
quizzes/{quizId}
  ├── title, topic, difficulty
  ├── createdBy      ← 교수자 닉네임 (목록 필터 키)
  ├── isActive       ← 학습자 노출 여부
  ├── questionCount
  ├── createdAt
  └── questions/{questionId}
        ├── order, question, options[], answer

results/{quizId}/scores/{nickname}
  ├── nickname, score, totalQuestions, percentage
  ├── answers[]
  └── submittedAt
```

### 복합 인덱스 (`firestore.indexes.json`)

| 쿼리 | 필드 |
|------|------|
| 교수자 퀴즈 목록 | `createdBy` + `createdAt` |
| 활성 퀴즈 목록 | `isActive` + `createdAt` |

앱은 인덱스 없이도 동작하도록 **클라이언트 정렬·폴백 조회**를 구현해 두었습니다.  
인덱스를 배포하면 쿼리 성능이 좋아집니다.

---

## Firebase 배포

### Hosting만 배포 (일반)

```bash
npm run deploy
```

내부적으로 `npm run build` → `firebase deploy --only hosting` 순서로 실행됩니다.

### Hosting + Firestore 규칙·인덱스 전체 배포

```bash
npm run deploy:all
```

### 단계별 수동 배포

```bash
npm install
npm run firebase:login
npm run build
npm run firebase -- deploy --only hosting
```

### 배포 확인

| 확인 항목 | 방법 |
|-----------|------|
| Hosting URL | 배포 완료 메시지의 `Hosting URL` (예: https://quiz-32329.web.app) |
| 빌드 반영 | 브라우저 **강력 새로고침** (Ctrl+Shift+R) |
| Firestore 연결 | 개발자 도구 → Network → `firestore.googleapis.com` 요청 확인 |
| 콘솔 | [Firebase Console](https://console.firebase.google.com/project/quiz-32329) |

---

## 테스트

### 1. 단위 테스트 (Vitest)

```bash
npm test          # 1회 실행
npm run test:watch  # 변경 감시
```

| 테스트 파일 | 내용 |
|-------------|------|
| `src/services/aiUtils.test.js` | 프롬프트, JSON 파싱, 재시도, 닉네임 필터 |
| `src/services/openai.test.js` | OpenAI 호출·폴백 (mock) |
| `src/services/firebaseUtils.test.js` | 정렬, Firestore 인덱스 오류 판별 |

### 2. Firestore 데이터 확인 (로컬 스크립트)

`.env`가 설정된 상태에서:

```bash
node -e "
import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
const env = Object.fromEntries(readFileSync('.env','utf8').split('\n').filter(l=>l&&!l.startsWith('#')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i),l.slice(i+1)];}));
const app = initializeApp({ apiKey:env.VITE_FIREBASE_API_KEY, authDomain:env.VITE_FIREBASE_AUTH_DOMAIN, projectId:env.VITE_FIREBASE_PROJECT_ID, storageBucket:env.VITE_FIREBASE_STORAGE_BUCKET, messagingSenderId:env.VITE_FIREBASE_MESSAGING_SENDER_ID, appId:env.VITE_FIREBASE_APP_ID });
const snap = await getDocs(collection(getFirestore(app), 'quizzes'));
console.log('총', snap.size, '건');
snap.forEach(d => console.log(d.id, d.data().title, '| createdBy:', d.data().createdBy));
"
```

### 3. 웹 수동 테스트 체크리스트

**교수자**

- [ ] 닉네임 입력 후 **교수자**로 로그인
- [ ] AI 퀴즈 생성 → 저장
- [ ] **내 퀴즈 목록**에 방금 저장한 퀴즈 표시
- [ ] 퀴즈 **활성화** 클릭

**학습자**

- [ ] **동일/다른** 닉네임으로 **학습자** 로그인
- [ ] 활성화된 퀴즈가 목록에 표시
- [ ] 응시 → 제출 → 점수·리더보드 확인

**Firebase**

- [ ] 콘솔 → Firestore → `quizzes` 컬렉션에 문서 생성 확인
- [ ] 배포 사이트 Network 탭에서 `projects/quiz-32329` 요청 확인

---

## 사용 방법

1. **닉네임**과 **역할**(교수자/학습자) 선택 후 시작
2. **교수자**: 주제 입력 → AI 생성 → 검토 → 저장 → 활성화
3. **학습자**: 활성 퀴즈 선택 → 응시 → 결과 확인

> **중요**: 학습자는 `isActive: true`인 퀴즈만 볼 수 있습니다. 교수자 대시보드에서 퀴즈 **「활성화」** 필수.

---

## 주의사항

### 1. 닉네임 일치 (가장 중요)

퀴즈 목록은 **`createdBy` = 로그인 닉네임**인 문서만 표시합니다.

- 저장 시 닉네임: `tester` → 이후 로그인도 **`tester`**
- 콘솔에 데이터가 있어도 **다른 닉네임**으로 로그인하면 목록이 비어 보입니다.
- 목록이 비어 있으면 화면에 **DB에 등록된 교수자 닉네임** 안내가 표시됩니다.

### 2. Firebase CLI 명령

- 반드시 `npm run firebase -- ...` 또는 `npm run firebase:login` 사용
- `npx firebase`는 사용하지 않음

### 3. 배포 전 빌드

Hosting은 `dist/` 폴더를 배포합니다. 소스 수정 후:

```bash
npm run build
npm run firebase -- deploy --only hosting
```

또는 `npm run deploy` 한 번에 실행.

### 4. 환경 변수·API 키

- `.env`를 Git에 올리지 않기
- OpenAI·Firebase 키는 [Google Cloud Console](https://console.cloud.google.com) / Firebase Console에서 발급
- Hosting 배포본에 API 키가 포함되므로, **프로덕션용 키 제한**(HTTP referrer, API 제한) 설정 권장

### 5. Firestore 보안 규칙 (현재)

`firestore.rules`는 **읽기/쓰기 모두 허용**(`allow read, write: if true`)입니다.  
교육·데모용으로는 편리하지만, **실서비스**에서는 Firebase Authentication 연동 후 규칙을 강화해야 합니다.

### 6. 학습자 중복 응시

동일 닉네임·동일 퀴즈는 **한 번만** 제출 가능합니다 (`results/.../scores/{nickname}` create 규칙).

### 7. OpenAI 키

퀴즈 생성에 `VITE_OPENAI_API_KEY`가 필요합니다. 미설정 시 AI 생성 단계에서 오류가 납니다.

---

## 문제 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| `could not determine executable to run` | `npx firebase` 사용 | `npm run firebase:login` 사용 |
| `Failed to authenticate` | Firebase 미로그인 | `npm run firebase:login` |
| 저장됐는데 목록이 비음 | 닉네임 불일치 | 저장 시 사용한 닉네임으로 로그인 |
| 학습자에게 퀴즈 없음 | 퀴즈 비활성(`isActive: false`) | 교수자가 퀴즈 **활성화** 클릭 |
| `The query requires an index` | 복합 인덱스 미생성 | `npm run firebase -- deploy --only firestore:indexes` 또는 콘솔 링크로 생성 |
| 배포 후에도 예전 UI | 캐시 | Ctrl+Shift+R, 또는 시크릿 창 |
| AI 생성 실패 | OpenAI 키·할당량 | `.env`의 `VITE_OPENAI_API_KEY` 확인 |
| Firestore 연결 안 됨 | `.env` 누락·오타 | 빌드 전 `.env` 확인 후 `npm run build` 재실행 |

### Firestore 인덱스 오류 링크

콘솔에 표시되는 URL을 브라우저에서 열면 인덱스를 한 번에 생성할 수 있습니다.

---

## 프로젝트 구조

```
quiz/
├── .env.example          # 환경 변수 템플릿
├── .firebaserc           # Firebase 프로젝트 ID
├── firebase.json         # Hosting·Firestore 설정
├── firestore.rules       # 보안 규칙
├── firestore.indexes.json
├── src/
│   ├── components/
│   │   ├── LoginPage.jsx
│   │   ├── Leaderboard.jsx
│   │   ├── InstructorDashboard/
│   │   └── StudentDashboard/
│   ├── services/
│   │   ├── firebase.js      # Firestore CRUD
│   │   ├── firebaseUtils.js # 정렬·오류 판별
│   │   ├── openai.js        # AI 퀴즈 생성
│   │   └── aiUtils.js
│   ├── hooks/useLeaderboard.js
│   └── context/AuthContext.jsx
└── package.json
```

### npm 스크립트 요약

| 스크립트 | 설명 |
|----------|------|
| `npm run dev` | 로컬 개발 서버 |
| `npm run build` | 프로덕션 빌드 (`dist/`) |
| `npm test` | 단위 테스트 |
| `npm run firebase:login` | Firebase CLI 로그인 |
| `npm run firebase -- <cmd>` | Firebase CLI 명령 |
| `npm run deploy` | 빌드 + Hosting 배포 |
| `npm run deploy:all` | 빌드 + Hosting·Firestore 전체 배포 |

---

## 라이선스

교육용 프로젝트입니다.
