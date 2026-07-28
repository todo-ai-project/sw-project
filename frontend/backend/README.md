# 목표 관리 서비스 백엔드 (Node.js + Firebase + Gemini API)

2026 컴퓨터공학과 소프트웨어 경진대회 - AI 기반 목표 관리 웹서비스의 백엔드 코드입니다.

## 폴더 구조

```
backend/
├── server.js # 서버 진입점
├── package.json
├── .env.example
├── .gitignore
└── src/
├── app.js # Express 앱 설정 및 라우터 등록
├── config/
│ ├── firebase.js # Firebase Admin SDK 초기화 (Firestore, Auth)
│ └── gemini.js # Gemini API 클라이언트 초기화 (gemini-flash-latest)
├── constants/
│ └── coins.js # 코인 지급 수치 (출석/방입장/사진/투두/목표완성 등) 한곳에서 관리
├── controllers/
│ ├── authController.js # users/{uid} 프로필 동기화
│ ├── characterController.js # 캐릭터 조회/꾸미기/구매 (문서 ID = uid)
│ ├── coinController.js # 코인 조회 + 출석 체크
│ ├── crewController.js # 크루 CRUD + 목표 선택 가입 + 오늘 할일 + 사진 보상
│ ├── goalController.js # goals CRUD + AI 분석 트리거, toggleGoal에 코인 지급(1회성)
│ └── todoController.js # todos CRUD + 완료 체크, toggleTodo에 코인 지급(목표당 하루 1회)
├── routes/
│ ├── authRoutes.js
│ ├── characterRoutes.js
│ ├── coinRoutes.js
│ ├── crewRoutes.js
│ ├── goalRoutes.js
│ └── todoRoutes.js
├── services/
│ ├── coinService.js # addCoins / getCoins / spendCoins
│ ├── dailyRewardService.js # "하루 1회" 보상 공통 처리 (claimOnce)
│ ├── crewService.js # 크루 전원 오늘 할일 완료 시 보너스 코인 체크
│ ├── firestoreService.js # Firestore 공통 CRUD 헬퍼
│ ├── geminiService.js # 목표 → 만다라트(대목표+세부목표8) JSON 생성, 기한 유무에 따라 분량 조절
│ └── goalService.js # Gemini 분석 + goals/todos 저장 로직
├── middlewares/
│ ├── authMiddleware.js # Firebase ID 토큰 검증
│ └── errorHandler.js # 공통 에러 처리
└── utils/
├── date.js # KST 기준 오늘 날짜 키/라벨 생성
└── mandalartParser.js # 만다라트 JSON 형식 검증 (geminiService에서 사용)
```

## Firestore 실제 구조

| 컬렉션 | 필드 | 설명 |
|---|---|---|
| `users/{uid}` | crewId, crewGoalId, email, nickname | 문서 ID = Firebase Auth uid |
| `goals/{id}` | completed, title, uid, coinAwarded | 목표. `coinAwarded`는 완성 코인 중복 지급 방지용 플래그 |
| `todos/{id}` | completed, goalId, order, title, uid | 할 일 (만다라트 세부목표 포함, order로 정렬) |
| `crews/{id}` | description, name, ownerId | 소셜 방 (멤버 목록은 crews가 아닌 users.crewId로 관리) |
| `characters/{uid}` | accessory, color, hat | 캐릭터. **문서 ID = uid로 고정** (별도 연결 필드 없음) |
| `dailyRewards/{uid_날짜}` | uid, dateKey, claims | 출석/방입장/사진/투두 등 "하루 1회" 보상 지급 여부 기록 |

> ⚠️ SubGoal 컬렉션은 없습니다. Gemini가 생성한 세부목표 8개는 각각 `order: 0~7`을 가진 Todo 문서로 저장됩니다.
> ⚠️ 크루 멤버 목록은 `crews` 문서가 아니라 `users.crewId` 필드로 역조회합니다.
> ⚠️ `characters` 컬렉션은 예전엔 `users.characterID` 필드로 연결했지만, 지금은 **문서 ID를 uid로 고정**해서 연결 필드 자체를 없앴습니다. `users.characterId`(구버전 필드)가 남아있어도 어떤 코드도 읽지 않습니다.
> ⚠️ 소셜 방의 "진행률"과 "공동 투두"는 백엔드에 구현하지 않았습니다 (의도적으로 뺀 기능). 대신 크루 가입 시 고른 목표 기준으로 "오늘 할일"을 조회합니다.

## 코인 지급 규칙 (`src/constants/coins.js`)

| 항목 | 지급량 | 제한 |
|---|---|---|
| 출석 | 2개 | 하루 1회 |
| 소셜 방 입장 | 5개 | 하루 1회 |
| 크루 전원 오늘 할일 완료 | 3개 | 하루 1회 (크루당) |
| 친구와 사진 촬영 | 3개 | 친구 1명당 하루 1회 |
| 할 일 완료 | 1개 | 목표 1개당 하루 1회 (여러 개 완료해도 1번만) |
| 대목표 100% 달성 | 15개 | 목표 1개당 평생 1회 |

## 주요 API

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/auth/sync` | 회원가입 직후 프로필 동기화 (users/{uid} 생성) |
| GET | `/api/auth/me` | 내 프로필 조회 |
| POST | `/api/goals` | 목표 입력 → Gemini 분석 → goal + todo 8개 자동 생성 (기한 명시 시 그 기간 기준, 없으면 1개월 기준) |
| GET | `/api/goals` | 내 목표 목록 |
| GET/PUT/DELETE | `/api/goals/:id` | 목표 상세/수정/삭제 |
| PATCH | `/api/goals/:id/toggle` | 목표 완료 체크 (100% 달성 시 코인 15개, 응답에 `coinsEarned`) |
| GET | `/api/todos/goal/:goalId` | 특정 목표의 할 일 목록 (order순) |
| GET | `/api/todos` | 내 전체 할 일 |
| POST/PUT/DELETE | `/api/todos` | 할 일 추가/수정/삭제 |
| PATCH | `/api/todos/:id/toggle` | 할 일 완료 체크 (목표당 하루 1코인, 응답에 `coinsEarned`) |
| GET/POST | `/api/crews` | 크루 목록/생성 |
| GET | `/api/crews/:id/members` | 크루 멤버 목록 (users.crewId 역조회) |
| POST | `/api/crews/:id/join` | 크루 가입, body `{ goalId }` **필수** (함께할 목표 선택), 코인 5개 |
| POST | `/api/crews/:id/leave` | 크루 탈퇴 |
| GET | `/api/crews/:id/today-todos` | 크루원 각자 선택한 목표의 할 일(오늘 할 일) 조회 |
| POST | `/api/crews/:id/photo` | 친구와 사진 촬영 보상, body `{ friendUid }`, 코인 3개 |
| GET | `/api/coins/me` | 내 코인 잔액 조회 |
| POST | `/api/coins/attendance` | 출석 체크 (하루 1회, 코인 2개) |
| GET | `/api/characters/me` | 내 캐릭터 조회 (없으면 자동 생성, 문서 ID = uid) |
| PUT | `/api/characters/me` | 캐릭터 꾸미기 저장 |
| POST | `/api/characters/purchase` | 아이템 구매 (코인 차감 후 캐릭터에 적용) |

## 시작하기

```bash
cd backend
npm install
cp .env.example .env   # 값 채워넣기 (Gemini API 키, Firebase 서비스 계정 경로)
# Firebase 콘솔에서 발급받은 서비스 계정 키 JSON을 backend/serviceAccountKey.json 으로 저장
npm run dev
```

파이어베이스 서비스 계정 키가 아직 없어도 서버는 정상적으로 켜지고, Firestore를 실제로 사용하는 API를 호출할 때만 에러가 발생합니다.

## 참고

- 로그인/회원가입 자체는 프론트엔드에서 Firebase Authentication 클라이언트 SDK로 처리하고,
  발급받은 ID 토큰을 백엔드에 `Authorization: Bearer <idToken>` 헤더로 전달하는 구조입니다.
- `uid`는 모든 goal/todo 문서에 중복 저장(비정규화)되어 있어, 유저별 목표/할일을 한 번의 쿼리로 조회할 수 있습니다.
- Gemini 모델은 `gemini-flash-latest`를 사용합니다 (특정 버전 모델은 서비스 지원 종료로 404가 날 수 있어, 항상 최신 버전을 가리키는 이름으로 고정).
- "하루 1회" 계열 보상(출석/방입장/사진/투두)은 전부 `dailyRewardService.claimOnce(uid, claimKey, coinAmount)` 하나로 처리됩니다. 새로운 하루 제한 보상을 추가할 땐 이 함수만 재사용하면 됩니다.