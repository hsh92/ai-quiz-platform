import { useState, useEffect } from 'react';
import { subscribeLeaderboard } from '../services/firebase';

export function useLeaderboard(quizId) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) {
      setScores([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeLeaderboard(quizId, (data) => {
      setScores(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [quizId]);

  return { scores, loading };
}
