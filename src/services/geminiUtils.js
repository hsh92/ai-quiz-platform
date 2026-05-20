/**
 * [비활성] Gemini 유틸 — OpenAI 전환 후 aiUtils.js 사용
 * 활성 구현: ./aiUtils.js
 */

/*
export const GEMINI_MODEL = 'gemini-2.0-flash';
export const GEMINI_MODEL_FALLBACK_CHAIN = [GEMINI_MODEL];

export const MAX_RETRIES_PER_MODEL = 3;
export const RETRY_BASE_DELAY_MS = 1000;

export function isRetryableGeminiError(error) {
  const message = error?.message ?? String(error);
  return /503|429|500|502|504|high demand|overloaded|UNAVAILABLE|RESOURCE_EXHAUSTED|try again later/i.test(
    message
  );
}

export function buildQuizPrompt({ topic, difficulty, count }) {
  return `당신은 교육용 퀴즈 출제 전문가입니다.
다음 조건에 맞는 4지선다형 퀴즈 문제를 ${count}개 생성해주세요.

- 주제: ${topic}
- 난이도: ${difficulty} (easy: 기초, medium: 중급, hard: 고급)
- 모든 문제와 선택지는 한국어로 작성
- 정답은 options 배열의 인덱스(0~3)로 표현

반드시 아래 JSON 형식으로만 응답하세요:
{
  "questions": [
    {
      "question": "문제 내용",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": 0
    }
  ]
}`;
}

export function normalizeQuestion(raw) {
  const answer = typeof raw.answer === 'number' ? raw.answer : parseInt(raw.answer, 10);

  if (
    !raw.question ||
    !Array.isArray(raw.options) ||
    raw.options.length !== 4 ||
    Number.isNaN(answer) ||
    answer < 0 ||
    answer > 3
  ) {
    throw new Error('문제 형식이 올바르지 않습니다.');
  }

  return {
    question: raw.question,
    options: raw.options,
    answer,
  };
}

export function parseQuizResponse(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('AI 응답을 JSON으로 파싱할 수 없습니다.');
  }

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error('AI 응답 형식이 올바르지 않습니다.');
  }

  if (parsed.questions.length === 0) {
    throw new Error('생성된 문제가 없습니다.');
  }

  return parsed.questions.map(normalizeQuestion);
}

export function toUserFriendlyError(error, attemptedModels = []) {
  if (isRetryableGeminiError(error)) {
    const models = attemptedModels.length > 0 ? attemptedModels.join(', ') : 'Gemini';
    return new Error(
      `AI 서버가 일시적으로 혼잡합니다 (${models}). 잠시 후 다시 시도해주세요.`
    );
  }

  if (/API key|API_KEY|401|403/i.test(error?.message ?? '')) {
    return new Error('Gemini API 키가 올바르지 않습니다. .env 파일을 확인해주세요.');
  }

  return error instanceof Error ? error : new Error(String(error));
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry(fn, options = {}) {
  const {
    maxAttempts = MAX_RETRIES_PER_MODEL,
    baseDelayMs = RETRY_BASE_DELAY_MS,
    isRetryable = isRetryableGeminiError,
    onRetry,
    sleepFn = sleep,
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      const canRetry = attempt < maxAttempts && isRetryable(error);
      if (!canRetry) break;

      const delayMs = baseDelayMs * 2 ** (attempt - 1);
      onRetry?.({ attempt, delayMs, error });
      await sleepFn(delayMs);
    }
  }

  throw lastError;
}
*/
