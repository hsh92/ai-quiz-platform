import { useState } from 'react';
import { generateQuizQuestions } from '../../services/openai';
import { createQuiz } from '../../services/firebase';

export default function QuizGenerator({ createdBy, onQuizCreated }) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('주제를 입력해주세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const generated = await generateQuizQuestions({ topic, difficulty, count });
      setQuestions(generated);
    } catch (err) {
      setError(err.message || 'AI 퀴즈 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('퀴즈 제목을 입력해주세요.');
      return;
    }
    if (questions.length === 0) {
      setError('먼저 AI로 문제를 생성해주세요.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const quizId = await createQuiz({ title, topic, difficulty, createdBy, questions });
      setTitle('');
      setTopic('');
      setQuestions([]);
      setError('');
      await onQuizCreated();
      console.info('퀴즈 저장 완료:', quizId);
    } catch (err) {
      setError(err.message || '퀴즈 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qIndex, oIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((opt, j) => (j === oIndex ? value : opt)) }
          : q
      )
    );
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">✨ AI 퀴즈 생성</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-slate-400">퀴즈 제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 자바스크립트 기초 퀴즈"
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">주제</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: React Hooks, 한국사"
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">난이도</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="easy">쉬움</option>
            <option value="medium">보통</option>
            <option value="hard">어려움</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">문제 수</label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          >
            {[3, 5, 7, 10].map((n) => (
              <option key={n} value={n}>
                {n}문제
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-violet-600 py-3 font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            AI 생성 중...
          </span>
        ) : (
          '🤖 AI로 문제 생성'
        )}
      </button>

      {error && (
        <p className="mt-3 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
      )}

      {questions.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="font-medium text-slate-300">생성된 문제 미리보기 (수정 가능)</h3>
          {questions.map((q, qi) => (
            <div key={qi} className="rounded-lg border border-slate-600 bg-slate-900/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-bold text-indigo-400">Q{qi + 1}</span>
                <input
                  value={q.question}
                  onChange={(e) => updateQuestion(qi, 'question', e.target.value)}
                  className="flex-1 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`answer-${qi}`}
                      checked={q.answer === oi}
                      onChange={() => updateQuestion(qi, 'answer', oi)}
                      className="text-indigo-500"
                    />
                    <input
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      className="flex-1 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '💾 퀴즈 저장'}
          </button>
        </div>
      )}
    </div>
  );
}
