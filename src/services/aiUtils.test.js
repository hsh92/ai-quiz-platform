import { describe, it, expect, vi } from 'vitest';
import {
  isRetryableAiError,
  buildQuizPrompt,
  parseQuizResponse,
  normalizeQuestion,
  toUserFriendlyError,
  withRetry,
  OPENAI_MODEL,
} from './aiUtils.js';

describe('isRetryableAiError', () => {
  it('503 오류를 재시도 가능으로 판별한다', () => {
    expect(isRetryableAiError(new Error('503 Service Unavailable'))).toBe(true);
  });

  it('429 rate limit 오류를 재시도 가능으로 판별한다', () => {
    expect(isRetryableAiError(new Error('429 rate limit exceeded'))).toBe(true);
  });

  it('일반 파싱 오류는 재시도 불가로 판별한다', () => {
    expect(isRetryableAiError(new Error('AI 응답 형식이 올바르지 않습니다.'))).toBe(false);
  });
});

describe('buildQuizPrompt', () => {
  it('주제, 난이도, 문제 수를 프롬프트에 포함한다', () => {
    const prompt = buildQuizPrompt({ topic: 'React', difficulty: 'medium', count: 5 });
    expect(prompt).toContain('React');
    expect(prompt).toContain('medium');
    expect(prompt).toContain('5개');
    expect(prompt).toContain('"questions"');
  });
});

describe('parseQuizResponse', () => {
  it('유효한 JSON을 문제 배열로 파싱한다', () => {
    const json = JSON.stringify({
      questions: [
        {
          question: 'React는 무엇인가?',
          options: ['라이브러리', 'DB', 'OS', '언어'],
          answer: 0,
        },
      ],
    });
    const result = parseQuizResponse(json);
    expect(result).toHaveLength(1);
    expect(result[0].answer).toBe(0);
  });

  it('문자열 answer를 숫자로 변환한다', () => {
    const json = JSON.stringify({
      questions: [
        {
          question: 'Q',
          options: ['A', 'B', 'C', 'D'],
          answer: '2',
        },
      ],
    });
    expect(parseQuizResponse(json)[0].answer).toBe(2);
  });

  it('잘못된 JSON이면 오류를 던진다', () => {
    expect(() => parseQuizResponse('not json')).toThrow('JSON');
  });
});

describe('toUserFriendlyError', () => {
  it('503 오류를 한국어 안내 메시지로 변환한다', () => {
    const err = toUserFriendlyError(new Error('503 high demand'), [OPENAI_MODEL]);
    expect(err.message).toContain('일시적으로 혼잡');
    expect(err.message).toContain(OPENAI_MODEL);
  });

  it('API 키 오류를 안내한다', () => {
    const err = toUserFriendlyError(new Error('Incorrect API key provided'));
    expect(err.message).toContain('OpenAI API 키');
  });
});

describe('withRetry', () => {
  it('재시도 가능 오류 시 재시도 후 성공한다', async () => {
    const sleepFn = vi.fn().mockResolvedValue(undefined);
    let calls = 0;
    const fn = vi.fn(async () => {
      calls++;
      if (calls < 2) throw new Error('503');
      return 'ok';
    });

    const result = await withRetry(fn, { sleepFn, baseDelayMs: 10 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('OPENAI_MODEL', () => {
  it('gpt-4o-mini를 사용한다', () => {
    expect(OPENAI_MODEL).toBe('gpt-4o-mini');
  });
});
