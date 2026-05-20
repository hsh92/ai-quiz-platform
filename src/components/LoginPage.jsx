import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 20) {
      setError('닉네임은 2~20자 사이여야 합니다.');
      return;
    }
    setError('');
    login(trimmed, role);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl">🎓</div>
          <h1 className="text-2xl font-bold text-white">AI 퀴즈 플랫폼</h1>
          <p className="mt-2 text-sm text-slate-400">교육용 AI 기반 퀴즈 학습 시스템</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              maxLength={20}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">역할 선택</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('instructor')}
                className={`rounded-lg border-2 p-4 text-center transition-all ${
                  role === 'instructor'
                    ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                    : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-1">👨‍🏫</div>
                <div className="font-medium">교수자</div>
                <div className="text-xs mt-1 opacity-70">퀴즈 생성</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`rounded-lg border-2 p-4 text-center transition-all ${
                  role === 'student'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-1">🎒</div>
                <div className="font-medium">학습자</div>
                <div className="text-xs mt-1 opacity-70">퀴즈 응시</div>
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            시작하기
          </button>
        </form>
      </div>
    </div>
  );
}
