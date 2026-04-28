const { SEED_WORDBOOKS } = require('../data/seed-wordbooks');

const STORAGE_KEY = 'word-app-mini-state';
const DEFAULT_DAILY_GOAL = 20;
const REVIEW_MASTERY_THRESHOLD = 80;
const SESSION_SIZE = 12;

function createDefaultProgress() {
  return {
    seenCount: 0,
    correctCount: 0,
    wrongCount: 0,
    favorite: false,
    mastery: 0
  };
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function addDays(days) {
  const next = new Date();
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

function createInitialState() {
  return {
    version: 1,
    books: SEED_WORDBOOKS,
    progressByWordId: {},
    dailyActivity: {},
    activeBookId: SEED_WORDBOOKS[0] ? SEED_WORDBOOKS[0].id : '',
    dailyGoal: DEFAULT_DAILY_GOAL
  };
}

function mergeBooks(storedBooks) {
  if (!Array.isArray(storedBooks) || !storedBooks.length) {
    return SEED_WORDBOOKS;
  }
  const seedIds = SEED_WORDBOOKS.reduce(function (acc, book) {
    acc[book.id] = true;
    return acc;
  }, {});
  const customBooks = storedBooks.filter(function (book) {
    return book && book.id && !seedIds[book.id];
  });
  return SEED_WORDBOOKS.concat(customBooks);
}

function loadState() {
  try {
    const value = wx.getStorageSync(STORAGE_KEY);
    if (value && value.version === 1) {
      return Object.assign(createInitialState(), value, {
        books: mergeBooks(value.books),
        progressByWordId: value.progressByWordId || {},
        dailyActivity: value.dailyActivity || {},
        dailyGoal: value.dailyGoal || DEFAULT_DAILY_GOAL
      });
    }
  } catch (error) {
    // Storage can fail in a fresh simulator session; fall back to the seed state.
  }
  return createInitialState();
}

function saveState(value) {
  wx.setStorageSync(STORAGE_KEY, value);
}

function getActiveBook(state) {
  return state.books.find(function (book) {
    return book.id === state.activeBookId;
  }) || state.books[0];
}

function getWordProgress(state, wordId) {
  return state.progressByWordId[wordId] || createDefaultProgress();
}

function isDueForReview(progress) {
  if (!progress.seenCount) return false;
  if (!progress.nextReviewAt) return progress.mastery < REVIEW_MASTERY_THRESHOLD;
  return new Date(progress.nextReviewAt).getTime() <= Date.now();
}

function getBookMetrics(state, book) {
  const progressList = book.words.map(function (word) {
    return getWordProgress(state, word.id);
  });
  return {
    total: book.words.length,
    studied: progressList.filter(function (progress) { return progress.seenCount > 0; }).length,
    mastered: progressList.filter(function (progress) { return progress.mastery >= REVIEW_MASTERY_THRESHOLD; }).length,
    due: book.words.filter(function (word) { return isDueForReview(getWordProgress(state, word.id)); }).length,
    favorites: progressList.filter(function (progress) { return progress.favorite; }).length,
    mistakes: progressList.filter(function (progress) { return progress.wrongCount > 0; }).length
  };
}

function uniqueWords(words) {
  return words.filter(function (word, index) {
    return words.findIndex(function (entry) {
      return entry.id === word.id;
    }) === index;
  });
}

function buildSession(state, mode) {
  const book = getActiveBook(state);
  const words = book ? book.words : [];
  const reviewWords = words.filter(function (word) {
    return isDueForReview(getWordProgress(state, word.id));
  });
  const favoriteWords = words.filter(function (word) {
    return getWordProgress(state, word.id).favorite;
  });
  const mistakeWords = words.filter(function (word) {
    return getWordProgress(state, word.id).wrongCount > 0;
  }).sort(function (a, b) {
    return getWordProgress(state, b.id).wrongCount - getWordProgress(state, a.id).wrongCount;
  });
  const freshWords = words.filter(function (word) {
    return getWordProgress(state, word.id).seenCount === 0;
  });
  const weakWords = words.filter(function (word) {
    return getWordProgress(state, word.id).mastery < REVIEW_MASTERY_THRESHOLD;
  });
  const source = mode === 'review'
    ? reviewWords
    : mode === 'favorites'
      ? favoriteWords
      : mode === 'mistakes'
        ? mistakeWords
        : reviewWords.concat(freshWords, weakWords);
  return uniqueWords(source).slice(0, SESSION_SIZE);
}

function recordActivity(state, remembered) {
  const key = formatDateKey(new Date());
  const current = state.dailyActivity[key] || {
    date: key,
    studiedWords: 0,
    reviewedWords: 0,
    durationSeconds: 0
  };
  return Object.assign({}, state, {
    dailyActivity: Object.assign({}, state.dailyActivity, {
      [key]: Object.assign({}, current, {
        studiedWords: current.studiedWords + 1,
        reviewedWords: current.reviewedWords + (remembered ? 1 : 0),
        durationSeconds: current.durationSeconds + 25
      })
    })
  });
}

function updateWordOutcome(state, wordId, remembered) {
  const current = getWordProgress(state, wordId);
  const nextMastery = Math.max(0, Math.min(100, current.mastery + (remembered ? 18 : -12)));
  const nextProgress = Object.assign({}, current, {
    seenCount: current.seenCount + 1,
    correctCount: current.correctCount + (remembered ? 1 : 0),
    wrongCount: current.wrongCount + (remembered ? 0 : 1),
    mastery: nextMastery,
    lastStudiedAt: new Date().toISOString(),
    nextReviewAt: addDays(remembered ? (nextMastery >= REVIEW_MASTERY_THRESHOLD ? 3 : 1) : 0)
  });
  const nextState = Object.assign({}, state, {
    progressByWordId: Object.assign({}, state.progressByWordId, {
      [wordId]: nextProgress
    })
  });
  return recordActivity(nextState, remembered);
}

function toggleFavorite(state, wordId) {
  const current = getWordProgress(state, wordId);
  return Object.assign({}, state, {
    progressByWordId: Object.assign({}, state.progressByWordId, {
      [wordId]: Object.assign({}, current, {
        favorite: !current.favorite
      })
    })
  });
}

function getTodayActivity(state) {
  const key = formatDateKey(new Date());
  return state.dailyActivity[key] || {
    date: key,
    studiedWords: 0,
    reviewedWords: 0,
    durationSeconds: 0
  };
}

function getRecentActivity(state, days) {
  const dayCount = days || 7;
  return Array.from({ length: dayCount }).map(function (_item, index) {
    const date = new Date();
    date.setDate(date.getDate() - (dayCount - index - 1));
    const key = formatDateKey(date);
    return state.dailyActivity[key] || {
      date: key,
      studiedWords: 0,
      reviewedWords: 0,
      durationSeconds: 0
    };
  });
}

function getStreak(state) {
  let streak = 0;
  for (let index = 0; index < 365; index += 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = formatDateKey(date);
    const activity = state.dailyActivity[key];
    if (activity && activity.studiedWords > 0) {
      streak += 1;
      continue;
    }
    break;
  }
  return streak;
}

function getWeakWords(state, limit) {
  const book = getActiveBook(state);
  if (!book) return [];
  const maxItems = limit || 5;
  return book.words.map(function (word) {
    return {
      word: word,
      progress: getWordProgress(state, word.id)
    };
  }).filter(function (entry) {
    return entry.progress.wrongCount > 0 || entry.progress.mastery < 60;
  }).sort(function (a, b) {
    return (b.progress.wrongCount - a.progress.wrongCount) || (a.progress.mastery - b.progress.mastery);
  }).slice(0, maxItems).map(function (entry) {
    return {
      id: entry.word.id,
      word: entry.word.word,
      translation: entry.word.translation,
      phonetic: entry.word.phonetic,
      wrongCount: entry.progress.wrongCount,
      mastery: entry.progress.mastery,
      favorite: entry.progress.favorite,
      nextReviewAt: entry.progress.nextReviewAt,
      bookName: book.name
    };
  });
}

function getDashboard(state) {
  const book = getActiveBook(state);
  const metrics = getBookMetrics(state, book);
  const today = getTodayActivity(state);
  const accuracyBase = Object.values(state.progressByWordId).reduce(function (acc, item) {
    acc.correct += item.correctCount;
    acc.total += item.seenCount;
    return acc;
  }, { correct: 0, total: 0 });
  return {
    activeBook: book,
    metrics: metrics,
    today: today,
    streak: getStreak(state),
    accuracy: accuracyBase.total ? Math.round((accuracyBase.correct / accuracyBase.total) * 100) : 0,
    weakWords: getWeakWords(state),
    recentActivity: getRecentActivity(state)
  };
}

module.exports = {
  STORAGE_KEY: STORAGE_KEY,
  DEFAULT_DAILY_GOAL: DEFAULT_DAILY_GOAL,
  createInitialState: createInitialState,
  loadState: loadState,
  saveState: saveState,
  getActiveBook: getActiveBook,
  getWordProgress: getWordProgress,
  isDueForReview: isDueForReview,
  getBookMetrics: getBookMetrics,
  buildSession: buildSession,
  updateWordOutcome: updateWordOutcome,
  toggleFavorite: toggleFavorite,
  getTodayActivity: getTodayActivity,
  getRecentActivity: getRecentActivity,
  getStreak: getStreak,
  getWeakWords: getWeakWords,
  getDashboard: getDashboard
};
