import Leaderboard from '../Leaderboard';

export default function ResultPage({ result, onBack }) {
  const { quizTitle, score, totalQuestions, percentage, nickname, quizId } = result;

  const getGrade = () => {
    if (percentage >= 90) return { emoji: '🏆', label: '최우수' };
    if (percentage >= 70) return { emoji: '🌟', label: '우수' };
    if (percentage >= 50) return { emoji: '👍', label: '보통' };
    return { emoji: '📚', label: '복습 필요' };
  };

  const grade = getGrade();

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-xl font-bold text-white">퀴즈 결과</h1>
          <button
            onClick={onBack}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            목록으로
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 text-center">
          <div className="text-5xl mb-3">{grade.emoji}</div>
          <h2 className="text-2xl font-bold text-white">{quizTitle}</h2>
          <p className="mt-1 text-slate-400">{nickname}님의 결과</p>

          <div className="mt-6 flex items-center justify-center gap-8">
            <div>
              <p className="text-4xl font-bold text-emerald-400">
                {score}/{totalQuestions}
              </p>
              <p className="text-sm text-slate-400">정답 수</p>
            </div>
            <div className="h-16 w-px bg-slate-700" />
            <div>
              <p className="text-4xl font-bold text-indigo-400">{percentage}%</p>
              <p className="text-sm text-slate-400">{grade.label}</p>
            </div>
          </div>

          <div className="mx-auto mt-6 h-3 max-w-xs overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <Leaderboard quizId={quizId} currentNickname={nickname} />
      </main>
    </div>
  );
}
