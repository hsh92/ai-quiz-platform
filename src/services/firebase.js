import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { sortQuizzesByCreatedAtDesc } from './firebaseUtils.js';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function getAllQuizzes() {
  const snapshot = await getDocs(collection(db, 'quizzes'));
  const quizzes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return sortQuizzesByCreatedAtDesc(quizzes);
}

export async function createQuiz({ title, topic, difficulty, createdBy, questions }) {
  const quizRef = await addDoc(collection(db, 'quizzes'), {
    title,
    topic,
    difficulty,
    createdBy: createdBy.trim(),
    isActive: true,
    questionCount: questions.length,
    createdAt: serverTimestamp(),
  });

  const batch = writeBatch(db);
  questions.forEach((q, index) => {
    const questionRef = doc(collection(db, 'quizzes', quizRef.id, 'questions'));
    batch.set(questionRef, {
      order: index,
      question: q.question,
      options: q.options,
      answer: q.answer,
    });
  });
  await batch.commit();

  return quizRef.id;
}

export async function getQuizzesByInstructor(createdBy) {
  const normalized = createdBy.trim();
  const q = query(collection(db, 'quizzes'), where('createdBy', '==', normalized));
  const snapshot = await getDocs(q);
  let quizzes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  // 닉네임 불일치(공백·대소문자 등) 대비 클라이언트 재필터
  if (quizzes.length === 0) {
    const all = await getAllQuizzes();
    quizzes = all.filter((quiz) => (quiz.createdBy || '').trim() === normalized);
  }

  return sortQuizzesByCreatedAtDesc(quizzes);
}

export async function getActiveQuizzes() {
  const q = query(collection(db, 'quizzes'), where('isActive', '==', true));
  const snapshot = await getDocs(q);
  let quizzes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (quizzes.length === 0) {
    const all = await getAllQuizzes();
    quizzes = all.filter((quiz) => quiz.isActive === true);
  }

  return sortQuizzesByCreatedAtDesc(quizzes);
}

/** 학습자 빈 목록 안내용: 비활성 퀴즈 개수 */
export async function getInactiveQuizCount() {
  const all = await getAllQuizzes();
  return all.filter((quiz) => !quiz.isActive).length;
}

export async function getQuizById(quizId) {
  const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
  if (!quizDoc.exists()) return null;

  const questionsSnapshot = await getDocs(
    query(collection(db, 'quizzes', quizId, 'questions'), orderBy('order', 'asc'))
  );
  const questions = questionsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  return { id: quizDoc.id, ...quizDoc.data(), questions };
}

export async function toggleQuizActive(quizId, isActive) {
  await updateDoc(doc(db, 'quizzes', quizId), { isActive });
}

export async function submitQuizResult(quizId, nickname, score, totalQuestions, answers) {
  const resultRef = doc(db, 'results', quizId, 'scores', nickname);
  await setDoc(resultRef, {
    nickname,
    score,
    totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100),
    answers,
    submittedAt: serverTimestamp(),
  });
}

export async function getStudentResult(quizId, nickname) {
  const resultDoc = await getDoc(doc(db, 'results', quizId, 'scores', nickname));
  if (!resultDoc.exists()) return null;
  return resultDoc.data();
}

export function subscribeLeaderboard(quizId, callback) {
  const q = query(
    collection(db, 'results', quizId, 'scores'),
    orderBy('score', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const scores = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const aTime = a.submittedAt?.toMillis?.() ?? 0;
        const bTime = b.submittedAt?.toMillis?.() ?? 0;
        return aTime - bTime;
      })
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
    callback(scores);
  });
}
