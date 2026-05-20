import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getActiveQuizzes, getInactiveQuizCount, getStudentResult } from '../../services/firebase';
import { isFirestoreIndexError } from '../../services/firebaseUtils';
import QuizSession from './QuizSession';
import ResultPage from './ResultPage';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [emptyHint, setEmptyHint] = useState('');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [result, setResult] = useState(null);
  const [completedQuizzes, setCompletedQuizzes] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError('');
      setEmptyHint('');
      try {
        const data = await getActiveQuizzes();
        setQuizzes(data);

        if (data.length === 0) {
          const inactiveCount = await getInactiveQuizCount();
          if (inactiveCount > 0) {
            setEmptyHint(
              `등록된 퀴즈 ${inactiveCount}개가 있으나, 교수자가 아직 활성화하지 않았습니다. ` +
                '교수자 계정에서 퀴즈 카드의 「활성화」 버튼을 눌러 주세요.'
            );
          }
        }

        const completed = {};
        for (const quiz of data) {
          const existing = await getStudentResult(quiz.id, user.nickname);
          if (existing) completed[quiz.id] = existing;
        }
        setCompletedQuizzes(completed);
      } catch (err) {
        console.error('퀴즈 목록 로드 실패:', err);
        if (isFirestoreIndexError(err)) {
          setLoadError('Firestore 인덱스가 필요합니다. 관리자에게 문의하세요.');
        } else {
          setLoadError(err.message || '퀴즈 목록을 불러오지 못했습니다.');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.nickname]);

  const handleQuizComplete = (quizResult) => {
    setResult(quizResult);
    setActiveQuiz(null);
    setCompletedQuizzes((prev) => ({
      ...prev,
      [quizResult.quizId]: quizResult,
    }));
  };

  if (activeQuiz) {
    return (
      <QuizSession
        quiz={activeQuiz}
        nickname={user.nickname}
        onComplete={handleQuizComplete}
        onBack={() => setActiveQuiz(null)}
      />
    );
  }

  if (result) {
    return (
      <ResultPage
        result={result}
        onBack={() => setResult(null)}
        onViewLeaderboard={() => {}}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">🎒 학습자 대시보드</h1>
            <p className="text-sm text-slate-400">{user.nickname}님</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">참여 가능한 퀴즈</h2>
        <p className="mb-4 text-sm text-slate-500">
          교수자가 「활성화」한 퀴즈만 표시됩니다.
        </p>

        {loadError && (
          <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{loadError}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 py-12 text-center">
            <p className="text-slate-400">현재 참여 가능한 퀴즈가 없습니다.</p>
            {emptyHint && (
              <p className="mx-auto mt-4 max-w-md rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                {emptyHint}
              </p>
            )}
            {!emptyHint && !loadError && (
              <p className="mt-3 text-sm text-slate-500">
                교수자가 퀴즈를 생성·활성화할 때까지 기다려 주세요.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => {
              const completed = completedQuizzes[quiz.id];
              return (
                <div
                  key={quiz.id}
                  className="rounded-xl border border-slate-700 bg-slate-800/50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">{quiz.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {quiz.topic} · {quiz.difficulty} · {quiz.questionCount}문제
                      </p>
                      {completed && (
                        <p className="mt-2 text-sm text-emerald-400">
                          완료: {completed.score}/{completed.totalQuestions} ({completed.percentage}%)
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (completed) {
                          setResult({ quizId: quiz.id, quizTitle: quiz.title, ...completed });
                        } else {
                          setActiveQuiz(quiz);
                        }
                      }}
                      className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        completed
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500'
                      }`}
                    >
                      {completed ? '결과 보기' : '시작하기'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
