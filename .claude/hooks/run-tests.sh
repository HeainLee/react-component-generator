#!/usr/bin/env bash
# 커밋 전 테스트 실행 훅
# git commit 명령어 감지 시 bun run test 실행

input=$(cat)

# command 필드 추출
command=$(echo "$input" | grep -oP '"command"\s*:\s*"\K[^"]+' 2>/dev/null || true)

block() {
  printf '{"decision":"block","reason":"%s"}\n' "$1"
  exit 0
}

# git commit 명령어인지 확인
if [[ "$command" =~ git\ commit ]]; then
  echo "테스트 실행 중..." >&2

  # 테스트 실행
  if ! bun run test 2>&1; then
    block "테스트 실패: 커밋 불가. bun run test를 실행하여 모든 테스트가 통과해야 합니다."
  fi
fi

# 이상 없음 → 허용
exit 0
