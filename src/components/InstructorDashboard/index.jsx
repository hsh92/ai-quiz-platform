import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getQuizzesByInstructor, getAllQuizzes, toggleQuizActive } from '../../services/firebase';
import { isFirestoreIndexError } from '../../services/firebaseUtils';
import QuizGenerator from './QuizGenerator';
import QuizCard from './QuizCard';
import Leaderboard from '../Leaderboard';

export default function InstructorDashboard() {
  const { user, logout } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [nicknameHint, setNicknameHint] = useState('');

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    setNicknameHint('');
    try {
      const data = await getQuizzesByInstructor(user.nickname);
      setQuizzes(data);

      if (data.length === 0) {
        const all = await getAllQuizzes();
        const creators = [...new Set(all.map((q) => q.createdBy).filter(Boolean))];
        if (creators.length > 0) {
          setNicknameHint(
            `현재 닉네임 "${user.nickname}"으로 저장된 퀴즈가 없습니다. ` +
              `DB에 등록된 교수자 닉네임: ${creators.join(', ')} — 저장 시 사용한 닉네임과 동일하게 로그인해주세요.`
          );
        }
      }
    } catch (err) {
      console.error('퀴즈 목록 로드 실패:', err);
      if (isFirestoreIndexError(err)) {
        setLoadError('Firestore 인덱스가 필요합니다. Firebase 콘솔에서 인덱스를 생성하거나 관리자에게 문의하세요.');
      } else {
        setLoadError(err.message || '퀴즈 목록을 불러오지 못했습니다.');
      }
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, [user.nickname]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const handleToggle = async (quizId, isActive) => {
    try {
      await toggleQuizActive(quizId, isActive);
      await loadQuizzes();
    } catch (err) {
      console.error('퀴즈 상태 변경 실패:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">👨‍🏫 교수자 대시보드</h1>
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

      <main className="mx-auto max-w-6xl space-y-8 p-6">
        <QuizGenerator createdBy={user.nickname} onQuizCreated={loadQuizzes} />

        {quizzes.some((q) => !q.isActive) && (
          <p className="rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            비활성 퀴즈는 학습자에게 보이지 않습니다. 「활성화」를 눌러 학습자가 응시할 수 있게 하세요.
          </p>
        )}

        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">내 퀴즈 목록</h2>
          {loadError && (
            <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{loadError}</p>
          )}
          {nicknameHint && (
            <p className="mb-4 rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-300">{nicknameHint}</p>
          )}
          {!loading && quizzes.length > 0 && (
            <p className="mb-4 text-sm text-slate-500">
              닉네임 &quot;{user.nickname}&quot;으로 저장된 퀴즈 {quizzes.length}개
            </p>
          )}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : quizzes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-700 py-12 text-center text-slate-400">
              아직 생성된 퀴즈가 없습니다. AI로 퀴즈를 만들어보세요!
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {quizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onToggle={handleToggle}
                  onViewLeaderboard={setSelectedQuizId}
                />
              ))}
            </div>
          )}
        </section>

        {selectedQuizId && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">퀴즈 리더보드</h2>
              <button
                onClick={() => setSelectedQuizId(null)}
                className="text-sm text-slate-400 hover:text-white"
              >
                닫기 ✕
              </button>
            </div>
            <Leaderboard quizId={selectedQuizId} />
          </section>
        )}
      </main>
    </div>
  );
}
