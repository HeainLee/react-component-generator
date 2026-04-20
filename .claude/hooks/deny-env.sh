#!/usr/bin/env bash
# 민감정보 파일 접근 차단 훅
# PreToolUse 이벤트에서 stdin으로 JSON을 받아 차단 여부를 결정한다.

input=$(cat)

file_path=$(echo "$input" | grep -oP '"file_path"\s*:\s*"\K[^"]+' 2>/dev/null || true)
command=$(echo "$input"   | grep -oP '"command"\s*:\s*"\K[^"]+' 2>/dev/null || true)
pattern=$(echo "$input"   | grep -oP '"pattern"\s*:\s*"\K[^"]+' 2>/dev/null || true)

# 차단할 파일 패턴 목록
SENSITIVE_FILE_PATTERNS=(
  '(^|[/\\])\.env(\.[^/\\]*)?$'   # .env, .env.local, .env.production …
  '(^|[/\\])\.secret[s]?(\b|$)'   # .secret, .secrets
  '(^|[/\\])secret[s]?\.(json|yaml|yml|toml|txt)$'
  '(^|[/\\])credentials(\.[^/\\]*)?$'
  '(^|[/\\])\.netrc$'
  '(^|[/\\])\.aws[/\\](credentials|config)$'
  '(^|[/\\])\.ssh[/\\]'
  '\.(pem|key|p12|pfx|jks)$'      # 인증서 / 개인키
  'id_(rsa|ecdsa|ed25519)(\.pub)?$'
  '(^|[/\\])keystore\.'
  '(^|[/\\])vault[\._-]'
  'api[_-]?key[s]?\.(json|yaml|yml|env|txt)$'
)

# 차단할 명령어 내 패턴 목록
SENSITIVE_CMD_PATTERNS=(
  "\.env(\.[a-zA-Z0-9_-]+)?"      # cat .env, source .env.local …
  "cat\s+.*secret"
  "printenv|env\s*$|export\s+-p"  # 환경변수 덤프
  "\$\{?ANTHROPIC_API_KEY\}?"
  "\$\{?GOOGLE_API_KEY\}?"
  "\$\{?AWS_SECRET"
  "\$\{?OPENAI_API_KEY\}?"
  "\$\{?DATABASE_(URL|PASSWORD)\}?"
)

block() {
  printf '{"decision":"block","reason":"%s"}\n' "$1"
  exit 0
}

# file_path 검사
if [[ -n "$file_path" ]]; then
  for pat in "${SENSITIVE_FILE_PATTERNS[@]}"; do
    if echo "$file_path" | grep -qP "$pat" 2>/dev/null; then
      block "민감정보 파일 접근 차단: $file_path (패턴: $pat)"
    fi
  done
fi

# command 검사
if [[ -n "$command" ]]; then
  for pat in "${SENSITIVE_CMD_PATTERNS[@]}"; do
    if echo "$command" | grep -qP "$pat" 2>/dev/null; then
      block "민감정보 명령어 차단: 패턴 '$pat' 감지"
    fi
  done
  # 파일 패턴도 명령어 안에서 검사
  for pat in "${SENSITIVE_FILE_PATTERNS[@]}"; do
    if echo "$command" | grep -qP "$pat" 2>/dev/null; then
      block "명령어 내 민감정보 파일 참조 차단 (패턴: $pat)"
    fi
  done
fi

# pattern (Grep/Glob) 검사 — .env 경로 포함 시 차단
if [[ -n "$pattern" ]]; then
  for pat in "${SENSITIVE_FILE_PATTERNS[@]}"; do
    if echo "$pattern" | grep -qP "$pat" 2>/dev/null; then
      block "검색 패턴 내 민감정보 파일 참조 차단 (패턴: $pat)"
    fi
  done
fi

# 이상 없음 → 허용 (출력 없음 = 허용)
exit 0
