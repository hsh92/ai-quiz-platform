export default function QuizCard({ quiz, onToggle, onViewLeaderboard }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 transition-colors hover:border-slate-600">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{quiz.title}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {quiz.topic} · {quiz.difficulty} · {quiz.questionCount}문제
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            quiz.isActive
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-slate-600/50 text-slate-400'
          }`}
        >
          {quiz.isActive ? '활성' : '비활성'}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onToggle(quiz.id, !quiz.isActive)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            quiz.isActive
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              : 'bg-emerald-600 text-white hover:bg-emerald-500'
          }`}
        >
          {quiz.isActive ? '비활성화' : '활성화'}
        </button>
        <button
          onClick={() => onViewLeaderboard(quiz.id)}
          className="rounded-lg bg-indigo-600/20 px-4 py-2 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-600/30"
        >
          리더보드
        </button>
      </div>
    </div>
  );
}
