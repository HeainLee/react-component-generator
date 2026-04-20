# React 컴포넌트 생성기

프롬프트를 입력하면 AI가 React 컴포넌트를 즉시 생성하고, 실시간 미리보기와 코드를 제공합니다.

## 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Bun (AI API 프록시 서버)
- **AI Provider**: Anthropic Claude / Google Gemini (선택 가능)
- **미리보기**: react-live (런타임 렌더링)

## 실행 방법

```bash
# 의존성 설치
bun install

# (선택) .env에 API 키 설정
cp .env.example .env
# .env 파일에 ANTHROPIC_API_KEY 또는 GOOGLE_API_KEY 입력

# API 서버 + 프론트엔드 동시 실행
bun run dev
```

브라우저에서 `http://localhost:5173` 접속 후 사용할 수 있습니다.

- `.env`에 API 키를 설정하면 UI에서 별도 입력 없이 바로 사용 가능
- `.env` 없이도 UI에서 직접 API 키를 입력하여 사용 가능

## 주요 기능

- **멀티 프로바이더**: Anthropic Claude / Google Gemini 선택
- **실시간 미리보기**: 생성된 컴포넌트를 즉시 렌더링
- **새로고침**: 애니메이션 컴포넌트를 리마운트하여 다시 보기
- **재생성**: 같은 프롬프트로 AI에 다시 요청
- **예시 프롬프트**: 시각적 임팩트가 큰 예시 제공

## 개발 워크플로우

### PR 자동 생성

`/pr-create` 스킬을 사용하여 현재 브랜치를 분석하고 PR을 자동으로 생성합니다.

```bash
# Claude Code에서
/pr-create
# 또는
PR 만들어줘
```

**스킬의 동작:**
1. 현재 브랜치와 main의 diff 분석
2. PR 템플릿을 기반으로 본문 작성
  - Summary: 변경 목적
  - Changes: 커밋 목록 (타입별 분류)
  - Test Plan: 테스트 체크리스트
  - Notes: 주의사항
3. PR 미리보기 출력 후 사용자 승인 대기
4. 승인 시 `gh pr create` 실행

**주의:**
- Fork 저장소에서는 upstream을 자동 감지하여 처리합니다
- 변경사항이 없으면 PR 생성이 실패합니다
