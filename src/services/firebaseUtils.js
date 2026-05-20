/** Firestore Timestamp → 밀리초 (목록 정렬용) */
export function getCreatedAtMillis(quiz) {
  const ts = quiz?.createdAt;
  if (!ts) return 0;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (typeof ts.seconds === 'number') return ts.seconds * 1000;
  return 0;
}

export function sortQuizzesByCreatedAtDesc(quizzes) {
  return [...quizzes].sort((a, b) => getCreatedAtMillis(b) - getCreatedAtMillis(a));
}

export function filterQuizzesByCreator(quizzes, nickname) {
  const normalized = nickname.trim();
  return quizzes.filter((q) => (q.createdBy || '').trim() === normalized);
}

export function isFirestoreIndexError(error) {
  const message = error?.message ?? String(error);
  return /requires an index|FAILED_PRECONDITION/i.test(message);
}
