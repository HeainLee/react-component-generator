import { describe, it, expect } from 'vitest';
import { validatePrompt, MIN_PROMPT_LENGTH, MAX_PROMPT_LENGTH } from './validatePrompt';

describe('validatePrompt', () => {
  describe('공백 처리', () => {
    it('빈 문자열은 유효하지 않다', () => {
      const result = validatePrompt('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('프롬프트를 입력하세요');
    });

    it('공백만 있는 프롬프트는 유효하지 않다', () => {
      const result = validatePrompt('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('프롬프트를 입력하세요');
    });

    it('탭과 개행만 있는 프롬프트는 유효하지 않다', () => {
      const result = validatePrompt('\t\n  ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('프롬프트를 입력하세요');
    });
  });

  describe('길이 검증 (trim 기준)', () => {
    it('trim 후 4글자는 유효하지 않다', () => {
      const result = validatePrompt('버튼입니');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(`${MIN_PROMPT_LENGTH}글자 이상 입력하세요`);
    });

    it('앞뒤 공백이 있어 trim 후 4글자면 유효하지 않다', () => {
      const result = validatePrompt('  버튼입니  ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(`${MIN_PROMPT_LENGTH}글자 이상 입력하세요`);
    });

    it('trim 후 5글자는 유효하다', () => {
      const result = validatePrompt('버튼입니다');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('앞뒤 공백이 있어도 trim 후 5글자면 유효하다', () => {
      const result = validatePrompt('   버튼입니다   ');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('trim 후 6글자는 유효하다', () => {
      const result = validatePrompt('버튼을 만들어');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('최대 길이 검증', () => {
    it('최대 길이인 2000글자는 유효하다', () => {
      const result = validatePrompt('a'.repeat(2000));
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('최대 길이를 초과한 2001글자는 유효하지 않다', () => {
      const result = validatePrompt('a'.repeat(2001));
      expect(result.valid).toBe(false);
      expect(result.error).toBe(`최대 ${MAX_PROMPT_LENGTH}글자까지 입력 가능합니다`);
    });
  });

  describe('엣지 케이스', () => {
    it('중간 개행은 trim되지 않아 6글자로 계산되어 유효하다', () => {
      const result = validatePrompt('버튼입\n니다');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
