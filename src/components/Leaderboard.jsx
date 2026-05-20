import { useLeaderboard } from '../hooks/useLeaderboard';

export default function Leaderboard({ quizId, currentNickname }) {
  const { scores, loading } = useLeaderboard(quizId);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">🏆 실시간 리더보드</h3>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
        🏆 실시간 리더보드
        <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
          LIVE
        </span>
      </h3>

      {scores.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">아직 응시한 학습자가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {scores.map((entry) => {
            const isCurrentUser = entry.nickname === currentNickname;
            const medal =
              entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;

            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between rounded-lg px-4 py-3 transition-colors ${
                  isCurrentUser
                    ? 'bg-indigo-500/20 border border-indigo-500/40'
                    : 'bg-slate-700/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 text-center font-bold text-slate-400">
                    {medal || `#${entry.rank}`}
                  </span>
                  <span className={`font-medium ${isCurrentUser ? 'text-indigo-300' : 'text-white'}`}>
                    {entry.nickname}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-indigo-400">(나)</span>
                    )}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400">
                    {entry.score}/{entry.totalQuestions}
                  </span>
                  <span className="ml-2 text-sm text-slate-400">{entry.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
