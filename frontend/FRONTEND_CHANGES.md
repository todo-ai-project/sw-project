# 투둥실 프론트엔드 기능 추가 내역

## 추가 기능

1. **코인 전역 상태**
   - `src/context/CoinContext.jsx` 추가
   - 백엔드 `GET /api/coins/me`와 동기화
   - 서버 연결이 안 될 때는 `localStorage` 임시 잔액 사용
   - 코인 지급/차감/출석 중복 방지 로직 포함

2. **출석 보상**
   - 상단 네비게이션에 `출석 +20` 버튼 추가
   - 계정별 하루 1회 지급
   - 소셜 방 내부 출석은 방별 하루 1회 `+5`

3. **상점 및 캐릭터 의상**
   - 프로필 페이지에 `상점` 탭 추가
   - 파티 모자, 왕관, 목도리, 골드 오라 구매/착용
   - 백엔드 `POST /api/characters/purchase` 사용
   - 서버 연동 실패 시 프론트 임시 구매로 작동

4. **소셜 방 목록 개선**
   - `활성 방` 문구를 `참여중인 방`으로 변경
   - 참여 시 1회 `+10` 코인
   - 참여한 방은 `입장` 버튼으로 방 상세 화면 이동
   - 백엔드 crew API와 연결하되 실패하면 로컬 데이터로 동작

5. **소셜 방 상세 화면**
   - `src/pages/Social/SocialRoomPage.jsx` 추가
   - 공동 투두 공유 및 멤버별 완료 인원 표시
   - 공동 투두 최초 완료 시 `+5` 코인
   - 방 멤버 목록, 방 진행률, 방 출석 기능 추가
   - 방 안에서 친구 해파리와 사진 촬영 가능

6. **기존 목표/할 일 API 규격 수정**
   - 목표 생성: `POST /api/goals` + `{ goalText }`
   - 할 일 토글: `PATCH /api/todos/:id/toggle`
   - 목표 토글: `PATCH /api/goals/:id/toggle`
   - 백엔드 응답 필드 `title`, `completed`, `goalId`에 맞춰 수정
   - 할 일 완료 후 코인 잔액 새로고침
   - 전체 세부 할 일 완료 시 목표 완료 버튼 및 `+100` 안내

## 수정 파일

- `src/App.jsx`
- `src/components/Navbar.jsx`
- `src/pages/Auth/components/Jelly.jsx`
- `src/pages/MakeTodo/MakeTodo.jsx`
- `src/pages/MakeTodo/AnalyzePage.jsx`
- `src/pages/TodoList/TodoList.jsx`
- `src/pages/Social/SocialPage.jsx`
- `src/pages/Profile/ProfilePage.jsx`

## 새 파일

- `src/context/CoinContext.jsx`
- `src/services/api.js`
- `src/pages/Social/SocialRoomPage.jsx`

## 백엔드 추가 작업이 필요한 부분

출석, 소셜 참여 보상, 공동 투두 보상은 현재 프론트의 `localStorage`로 중복 지급을 막습니다. 실제 서비스에서는 사용자가 브라우저 저장값을 수정할 수 있으므로 아래 서버 API를 추가하는 것이 안전합니다.

- `POST /api/coins/attendance`
- `POST /api/crews/:id/check-in`
- `POST /api/crews/:id/shared-todos/:todoId/toggle`
- 공동 투두 및 사진첩 Firestore 저장 API

현재 백엔드의 캐릭터 구매 API를 쓰려면 `characterController.js`의 `userStore` 선언 및 `characterID/characterId` 필드명 통일도 필요합니다.
