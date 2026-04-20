export const MIN_PROMPT_LENGTH = 5;
export const MAX_PROMPT_LENGTH = 2000;

export function validatePrompt(prompt: string): { valid: boolean; error?: string } {
  const trimmed = prompt.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: '프롬프트를 입력하세요' };
  }

  if (trimmed.length < MIN_PROMPT_LENGTH) {
    return { valid: false, error: `${MIN_PROMPT_LENGTH}글자 이상 입력하세요` };
  }

  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return { valid: false, error: `최대 ${MAX_PROMPT_LENGTH}글자까지 입력 가능합니다` };
  }

  return { valid: true };
}
