# 투둥실 (Todoongsil) - Frontend

AI 기반 목표 관리 웹 서비스 프론트엔드

## 기술 스택

- React 19 + Vite
- React Router v7
- Firebase Authentication (Client SDK)
- Axios (API 통신)
- Lucide React (아이콘)

## 실행 방법

```bash
npm install
npm run dev
```

기본 포트: `http://localhost:5173`

## 환경 변수 (.env)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 파일 구조

```
frontend/
├── index.html                          # HTML 엔트리 (Google Fonts 로드)
├── package.json
├── vite.config.js
├── eslint.config.js
├── public/                             # 정적 파일
└── src/
    ├── main.jsx                        # React 엔트리포인트
    ├── App.jsx                         # 라우터 설정 + 전역 키프레임
    ├── index.css                       # 전역 CSS
    ├── firebase.js                     # Firebase Client SDK 초기화
    │
    ├── components/                     # 공통 컴포넌트
    │   └── Navbar.jsx                  # 상단 네비게이션 바 (목표/소셜/프로필 탭)
    │
    └── pages/
        ├── Auth/                       # 인증 관련
        │   ├── LoginPage.jsx           # 로그인 페이지
        │   ├── SignupPage.jsx          # 회원가입 페이지
        │   └── components/             # 공유 UI 컴포넌트
        │       ├── tokens.js           # 디자인 토큰 (색상, 그라데이션)
        │       ├── Jelly.jsx           # 해파리 캐릭터
        │       ├── Bubbles.jsx         # 물방울 애니메이션
        │       ├── AuthWrap.jsx        # 인증 페이지 래퍼
        │       ├── Card.jsx            # 글래스모피즘 카드
        │       ├── Field.jsx           # 입력 필드
        │       ├── PrimaryBtn.jsx      # 그라데이션 CTA 버튼
        │       └── GhostBtn.jsx        # 보더 스타일 버튼
        │
        ├── TodoList/                   # 목표 관리
        │   └── TodoList.jsx            # 캐릭터 + 서브골 아코디언 + 할일 체크
        │
        ├── MakeTodo/                   # 목표 설정
        │   ├── MakeTodo.jsx            # AI 목표 입력 페이지
        │   └── AnalyzePage.jsx         # AI 분석 진행/결과 페이지
        │
        ├── Social/                     # 소셜
        │   └── SocialPage.jsx          # 소셜 방 목록 + 생성
        │
        └── Profile/                    # 프로필
            └── ProfilePage.jsx         # 캐릭터 꾸미기 + 통계/배지 + 사진첩
```

## 라우트

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/login` | LoginPage | 로그인 |
| `/signup` | SignupPage | 회원가입 |
| `/goals` | TodoList | 목표 관리 (메인) |
| `/make` | MakeTodo | AI 목표 설정 |
| `/social` | SocialPage | 소셜 방 |
| `/profile` | ProfilePage | 프로필 |

## 인증 흐름

1. 회원가입: Firebase `createUserWithEmailAndPassword` -> `POST /api/auth/signup`
2. 로그인: Firebase `signInWithEmailAndPassword` -> `POST /api/auth/login`
3. 이후 API 요청: `Authorization: Bearer <idToken>` 헤더 포함
