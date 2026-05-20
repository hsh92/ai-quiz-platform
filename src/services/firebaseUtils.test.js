import { describe, it, expect } from 'vitest';
import {
  getCreatedAtMillis,
  sortQuizzesByCreatedAtDesc,
  filterQuizzesByCreator,
  isFirestoreIndexError,
} from './firebaseUtils.js';

describe('getCreatedAtMillis', () => {
  it('toMillis가 있으면 사용한다', () => {
    expect(getCreatedAtMillis({ createdAt: { toMillis: () => 5000 } })).toBe(5000);
  });

  it('seconds 필드가 있으면 변환한다', () => {
    expect(getCreatedAtMillis({ createdAt: { seconds: 10 } })).toBe(10000);
  });

  it('createdAt이 없으면 0', () => {
    expect(getCreatedAtMillis({})).toBe(0);
  });
});

describe('sortQuizzesByCreatedAtDesc', () => {
  it('최신 퀴즈가 앞에 온다', () => {
    const sorted = sortQuizzesByCreatedAtDesc([
      { id: 'a', createdAt: { seconds: 1 } },
      { id: 'b', createdAt: { seconds: 3 } },
      { id: 'c', createdAt: { seconds: 2 } },
    ]);
    expect(sorted.map((q) => q.id)).toEqual(['b', 'c', 'a']);
  });
});

describe('filterQuizzesByCreator', () => {
  it('닉네임이 일치하는 퀴즈만 필터링한다', () => {
    const result = filterQuizzesByCreator(
      [
        { createdBy: 'tester', title: 'A' },
        { createdBy: '테스트', title: 'B' },
        { createdBy: ' tester ', title: 'C' },
      ],
      'tester'
    );
    expect(result).toHaveLength(2);
  });
});

describe('isFirestoreIndexError', () => {
  it('인덱스 필요 오류를 감지한다', () => {
    expect(
      isFirestoreIndexError(new Error('The query requires an index. You can create it here:'))
    ).toBe(true);
  });

  it('일반 오류는 false', () => {
    expect(isFirestoreIndexError(new Error('permission denied'))).toBe(false);
  });
});
