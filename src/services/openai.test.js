import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();

vi.mock('openai', () => ({
  default: vi.fn(function OpenAI() {
    return {
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    };
  }),
}));

describe('generateQuizQuestions (OpenAI)', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_OPENAI_API_KEY', 'test-openai-key');

    const aiUtils = await import('./aiUtils.js');
    vi.spyOn(aiUtils, 'sleep').mockResolvedValue(undefined);
  });

  it('OpenAI 응답을 파싱하여 문제를 반환한다', async () => {
    const validResponse = {
      questions: [
        {
          question: 'JS란?',
          options: ['언어', 'DB', 'OS', 'HW'],
          answer: 0,
        },
      ],
    };

    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(validResponse) } }],
    });

    const { generateQuizQuestions } = await import('./openai.js');
    const result = await generateQuizQuestions({
      topic: 'JavaScript',
      difficulty: 'easy',
      count: 1,
    });

    expect(result).toHaveLength(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gpt-4o-mini' })
    );
  });

  it('503 실패 후 재시도하여 성공한다', async () => {
    const validResponse = {
      questions: [
        {
          question: 'Q',
          options: ['A', 'B', 'C', 'D'],
          answer: 1,
        },
      ],
    };

    mockCreate
      .mockRejectedValueOnce(new Error('503 Service Unavailable'))
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(validResponse) } }],
      });

    const { generateQuizQuestions } = await import('./openai.js');
    const result = await generateQuizQuestions({
      topic: 'React',
      difficulty: 'medium',
      count: 1,
    });

    expect(result).toHaveLength(1);
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it('모든 재시도 실패 시 사용자 친화적 오류를 던진다', async () => {
    mockCreate.mockRejectedValue(new Error('503 Service Unavailable'));

    const { generateQuizQuestions } = await import('./openai.js');

    await expect(
      generateQuizQuestions({ topic: 'Test', difficulty: 'easy', count: 3 })
    ).rejects.toThrow('일시적으로 혼잡');
  });

  it('API 키가 없으면 오류를 던진다', async () => {
    vi.stubEnv('VITE_OPENAI_API_KEY', '');
    vi.resetModules();

    const { generateQuizQuestions } = await import('./openai.js');

    await expect(
      generateQuizQuestions({ topic: 'Test', difficulty: 'easy', count: 3 })
    ).rejects.toThrow('API 키');
  });
});
