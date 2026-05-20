import OpenAI from 'openai';
import {
  OPENAI_MODEL,
  buildQuizPrompt,
  parseQuizResponse,
  toUserFriendlyError,
  withRetry,
  sleep,
} from './aiUtils.js';

function createClient() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.');
  }
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

async function generateWithOpenAI(prompt) {
  const client = createClient();
  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content: '당신은 교육용 퀴즈 출제 전문가입니다. 요청된 JSON 형식만 반환하세요.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error('OpenAI 응답이 비어 있습니다.');
  }

  return parseQuizResponse(text);
}

export async function generateQuizQuestions({ topic, difficulty, count }) {
  const prompt = buildQuizPrompt({ topic, difficulty, count });

  try {
    return await withRetry(() => generateWithOpenAI(prompt), {
      sleepFn: sleep,
      onRetry: ({ attempt, delayMs }) => {
        console.warn(`[OpenAI] 재시도 ${attempt}/${3} (${delayMs}ms 후)...`);
      },
    });
  } catch (error) {
    throw toUserFriendlyError(error, [OPENAI_MODEL]);
  }
}
