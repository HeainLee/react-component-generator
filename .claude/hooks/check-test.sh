#!/usr/bin/env bash
# TDD 리마인더: src/ 파일 수정 시 대응 테스트 파일 존재 확인
# PostToolUse 이벤트에서 Edit|Write 도구로 파일 수정 시 실행

input=$(cat)

# grep과 sed로 file_path 추출 (jq 미설치 환경 대응)
file=$(echo "$input" | grep -oP '"file_path"\s*:\s*"\K[^"]+' 2>/dev/null || true)

# 빈 입력 방어
[ -z "$file" ] && exit 0

# 경로 필터링: src/ 폴더 확인 (Windows 경로 구분자 둘 다 처리)
if [[ "$file" != */src/* && "$file" != *\\src\\* ]]; then
  exit 0
fi

# 확장자 확인: .ts 또는 .tsx
if [[ "$file" != *.ts && "$file" != *.tsx ]]; then
  exit 0
fi

# 테스트 파일 자체는 제외
if [[ "$file" == *.test.ts || "$file" == *.test.tsx ]]; then
  exit 0
fi

# 테스트 파일 경로 계산 (확장자 제거 후 .test.ts/.test.tsx 추가)
base="${file%.*}"

test_ts="${base}.test.ts"
test_tsx="${base}.test.tsx"

# 테스트 파일 존재 확인 (둘 중 하나라도 존재하면 OK)
if [ -f "$test_ts" ] || [ -f "$test_tsx" ]; then
  exit 0
fi

# 테스트 파일 없음 → TDD 리마인더 출력
{
  echo "⚠ TDD 리마인더: 테스트 파일이 없습니다 → $file"
  echo "  ~/.claude/rules/tdd.md 의 RED-GREEN-REFACTOR 사이클을 확인하세요."
  echo "  테스트 전에 프로덕션 코드를 먼저 작성했다면 '삭제 강제 규칙'을 기억하세요."
} >&2

exit 0
