# 목표 관리 서비스 백엔드 (Node.js + Firebase + Gemini API)

2026 컴퓨터공학과 소프트웨어 경진대회 - AI 기반 목표 관리 웹서비스의 백엔드 코드입니다.
**실제 Firestore 콘솔에 만들어진 DB 구조를 그대로 반영**했습니다.

## 폴더 구조

```
backend/
├── server.js                     # 서버 진입점
├── package.json
├── .env.example
├── .gitignore
└── src/
    ├── app.js                    # Express 앱 설정 및 라우터 등록
    ├── config/
    │   ├── firebase.js           # Firebase Admin SDK 초기화 (Firestore, Auth)
    │   └── gemini.js             # Gemini API 클라이언트 초기화
    ├── controllers/
    │   ├── authController.js         # users/{uid} 프로필 동기화
    │   ├── characterController.js    # characters 꾸미기, purchaseItem 추가
    │   ├── coinController.js   
    │   ├── crewController.js      
    │   ├── goalController.js         # goals CRUD + AI 분석 트리거, toggleGoal에 코인 지급
    │   └── todoController.js    # todos CRUD + 완료 체크 (만다라트 세부목표 포함), toggleTodo에 코인 지급
    ├── routes/
    │   ├── authRoutes.js
    │   ├── characterRoutes.js
    │   ├── coinRoutes.js
    │   ├── crewRoutes.js
    │   ├── goalRoutes.js 
    │   └── todoRoutes.js
    ├── services/
    │   ├── coinService.js        # addCoin / getCoin / spendCoin
    │   ├── firestoreService.js   # Firestore 공통 CRUD 헬퍼
    │   ├── geminiService.js      # 목표 → 만다라트(대목표+세부목표8) JSON 생성
    │   └── goalService.js        # Gemini 분석 + goals/todos 저장 로직
    ├── middlewares/
    │   ├── authMiddleware.js     # Firebase ID 토큰 검증
    │   └── errorHandler.js       # 공통 에러 처리
    └── utils/
        └── mandalartParser.js    # 만다라트 JSON 형식 검증
```

## Firestore 실제 구조

| 컬렉션 | 필드 | 설명 |
|---|---|---|
| `users/{uid}` | characterID, crewId, email, nickname | 문서 ID = Firebase Auth uid |
| `goals/{id}` | completed, title, uid | 목표 |
| `todos/{id}` | completed, goalId, order, title, uid | 할 일 (만다라트 세부목표 포함, order로 정렬) |
| `crews/{id}` | description, name, ownerId | 소셜 방 (멤버 목록은 crews가 아닌 users.crewId로 관리) |
| `characters/{id}` | accessory, color, hat | 캐릭터 (users.characterID가 이 문서를 가리킴) |

> ⚠️ SubGoal 컬렉션은 없습니다. Gemini가 생성한 세부목표 8개는 각각 `order: 0~7`을 가진 Todo 문서로 저장됩니다.
> ⚠️ 크루 멤버 목록은 `crews` 문서가 아니라 `users.crewId` 필드로 역조회합니다 (`GET /api/crews/:id/members`).

## 주요 API

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/auth/sync` | 회원가입 직후 프로필 동기화 (users/{uid} 생성) |
| GET | `/api/auth/me` | 내 프로필 조회 |
| POST | `/api/goals` | 목표 입력 → Gemini 분석 → goal + todo 8개 자동 생성 |
| GET | `/api/goals` | 내 목표 목록 |
| GET/PUT/DELETE | `/api/goals/:id` | 목표 상세/수정/삭제 |
| PATCH | `/api/goals/:id/toggle` | 목표 완료 체크 |
| GET | `/api/todos/goal/:goalId` | 특정 목표의 할 일 목록 (order순) |
| GET | `/api/todos` | 내 전체 할 일 |
| POST/PUT/DELETE | `/api/todos` | 할 일 추가/수정/삭제 |
| PATCH | `/api/todos/:id/toggle` | 할 일 완료 체크 |
| GET/POST | `/api/crews` | 크루 목록/생성 (생성 시 자동 가입) |
| GET | `/api/crews/:id/members` | 크루 멤버 목록 (users.crewId 역조회) |
| POST | `/api/crews/:id/join` `/leave` | 크루 가입/탈퇴 |
| GET | `/api/characters/me` | 내 캐릭터 조회 (없으면 자동 생성 + users.characterID 연결) |
| PUT | `/api/characters/:id` | 캐릭터 꾸미기 저장 |

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
