import { useState, useEffect, useCallback, useRef } from 'react';
import { getQuizById, submitQuizResult } from '../../services/firebase';

const QUESTION_TIME_SEC = 30;

export default function QuizSession({ quiz, nickname, onComplete, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SEC);
  const [submitting, setSubmitting] = useState(false);
  const answersRef = useRef(answers);
  const questionsRef = useRef(questions);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    async function load() {
      const data = await getQuizById(quiz.id);
      setQuestions(data?.questions || []);
      setLoading(false);
    }
    load();
  }, [quiz.id]);

  const handleSubmit = useCallback(async () => {
    const qs = questionsRef.current;
    const ans = answersRef.current;
    if (qs.length === 0) return;

    setSubmitting(true);
    let score = 0;
    const answerDetails = qs.map((q, i) => {
      const selected = ans[i] ?? -1;
      const isCorrect = selected === q.answer;
      if (isCorrect) score++;
      return {
        questionId: q.id,
        selected,
        correct: q.answer,
        isCorrect,
      };
    });

    try {
      await submitQuizResult(quiz.id, nickname, score, qs.length, answerDetails);
      onComplete({
        quizId: quiz.id,
        quizTitle: quiz.title,
        nickname,
        score,
        totalQuestions: qs.length,
        percentage: Math.round((score / qs.length) * 100),
        answers: answerDetails,
      });
    } catch (err) {
      console.error('결과 제출 실패:', err);
      setSubmitting(false);
    }
  }, [quiz.id, quiz.title, nickname, onComplete]);

  const goToNext = useCallback(() => {
    const qs = questionsRef.current;
    setCurrentIndex((prev) => {
      if (prev < qs.length - 1) return prev + 1;
      handleSubmit();
      return prev;
    });
  }, [handleSubmit]);

  useEffect(() => {
    if (loading || submitting) return;

    setTimeLeft(QUESTION_TIME_SEC);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          goToNext();
          return QUESTION_TIME_SEC;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, loading, submitting, goToNext]);

  const handleSelect = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleNextClick = () => {
    const qs = questionsRef.current;
    if (currentIndex < qs.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const current = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <button onClick={onBack} className="text-sm text-slate-400 hover:text-white">
            ← 돌아가기
          </button>
          <span className="text-sm text-slate-400">
            {currentIndex + 1} / {questions.length}
          </span>
          <span
            className={`font-mono text-sm font-bold ${
              timeLeft <= 10 ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {timeLeft}s
          </span>
        </div>
        <div className="mx-auto mt-3 h-1.5 max-w-2xl overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-6">
        <h2 className="mb-2 text-sm font-medium text-emerald-400">{quiz.title}</h2>
        <p className="mb-8 text-xl font-semibold leading-relaxed text-white">
          {current?.question}
        </p>

        <div className="space-y-3">
          {current?.options.map((option, index) => {
            const isSelected = answers[currentIndex] === index;
            const labels = ['A', 'B', 'C', 'D'];
            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                className={`flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {labels[index]}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNextClick}
          disabled={submitting || answers[currentIndex] === undefined}
          className="mt-8 w-full rounded-xl bg-emerald-600 py-4 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
        >
          {submitting
            ? '제출 중...'
            : currentIndex < questions.length - 1
              ? '다음 문제 →'
              : '제출하기 ✓'}
        </button>
      </main>
    </div>
  );
}
