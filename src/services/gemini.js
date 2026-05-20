/**
 * [비활성] Gemini API 구현 — OpenAI로 전환됨
 * 활성 구현: ./openai.js
 */

/*
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  GEMINI_MODEL_FALLBACK_CHAIN,
  buildQuizPrompt,
  parseQuizResponse,
  toUserFriendlyError,
  withRetry,
  sleep,
} from './geminiUtils.js';

function createClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.');
  }
  return new GoogleGenerativeAI(apiKey);
}

async function generateWithModel(client, modelName, prompt) {
  const model = client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseQuizResponse(text);
}

export async function generateQuizQuestions({ topic, difficulty, count }) {
  const prompt = buildQuizPrompt({ topic, difficulty, count });
  const client = createClient();
  const attemptedModels = [];
  let lastError;

  for (const modelName of GEMINI_MODEL_FALLBACK_CHAIN) {
    attemptedModels.push(modelName);

    try {
      return await withRetry(
        () => generateWithModel(client, modelName, prompt),
        {
          sleepFn: sleep,
          onRetry: ({ attempt, delayMs }) => {
            console.warn(
              `[Gemini] ${modelName} 재시도 ${attempt}/${3} (${delayMs}ms 후)...`
            );
          },
        }
      );
    } catch (error) {
      lastError = error;
      console.warn(`[Gemini] ${modelName} 실패:`, error.message);

      const hasNextModel =
        modelName !== GEMINI_MODEL_FALLBACK_CHAIN[GEMINI_MODEL_FALLBACK_CHAIN.length - 1];
      if (hasNextModel) {
        console.warn(`[Gemini] 다음 모델로 폴백 시도...`);
        continue;
      }
    }
  }

  throw toUserFriendlyError(lastError, attemptedModels);
}
*/
