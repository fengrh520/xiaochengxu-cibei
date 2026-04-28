import type { AppState, DailyActivity, WordBook, WordEntry, WordProgress, StudyMode } from './types';
import { SEED_WORDBOOKS } from '../data/seed-wordbooks';

const STORAGE_KEY = 'word-app-mini-state';
const DEFAULT_DAILY_GOAL = 20;
const REVIEW_MASTERY_THRESHOLD = 80;
const SESSION_SIZE = 12;

function createDefaultProgress(): WordProgress {
  return { seenCount: 0, correctCount: 0, wrongCount: 0, favorite: false, mastery: 0 };
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(days: number): string {
  const next = new Date();
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

export function createInitialState(): AppState {
  return { version: 1, books: SEED_WORDBOOKS, progressByWordId: {}, dailyActivity: {}, activeBookId: SEED_WORDBOOKS[0]?.id || '', dailyGoal: DEFAULT_DAILY_GOAL };
}

export function loadState(): AppState {
  try {
    const value = wx.getStorageSync(STORAGE_KEY) as AppState | '';
    if (value && value.version === 1) {
      return { ...createInitialState(), ...value, books: value.books?.length ? value.books : SEED_WORDBOOKS };
    }
  } catch {}
  return createInitialState();
}

export function saveState(value: AppState) { wx.setStorageSync(STORAGE_KEY, value); }
export function getActiveBook(state: AppState): WordBook { return state.books.find((book) => book.id === state.activeBookId) || state.books[0]; }
export function getWordProgress(state: AppState, wordId: string): WordProgress { return state.progressByWordId[wordId] || createDefaultProgress(); }
export function isDueForReview(progress: WordProgress) { if (!progress.seenCount) return false; if (!progress.nextReviewAt) return progress.mastery < REVIEW_MASTERY_THRESHOLD; return new Date(progress.nextReviewAt).getTime() <= Date.now(); }
export function getBookMetrics(state: AppState, book: WordBook) {
  const progressList = book.words.map((word) => getWordProgress(state, word.id));
  return { total: book.words.length, studied: progressList.filter((p) => p.seenCount > 0).length, mastered: progressList.filter((p) => p.mastery >= REVIEW_MASTERY_THRESHOLD).length, due: book.words.filter((word) => isDueForReview(getWordProgress(state, word.id))).length, favorites: progressList.filter((p) => p.favorite).length, mistakes: progressList.filter((p) => p.wrongCount > 0).length };
}
export function buildSession(state: AppState, mode: StudyMode): WordEntry[] {
  const book = getActiveBook(state);
  const words = book.words;
  const reviewWords = words.filter((word) => isDueForReview(getWordProgress(state, word.id)));
  const favoriteWords = words.filter((word) => getWordProgress(state, word.id).favorite);
  const mistakeWords = words.filter((word) => getWordProgress(state, word.id).wrongCount > 0).sort((a, b) => getWordProgress(state, b.id).wrongCount - getWordProgress(state, a.id).wrongCount);
  const freshWords = words.filter((word) => getWordProgress(state, word.id).seenCount === 0);
  const source = mode === 'review' ? reviewWords : mode === 'favorites' ? favoriteWords : mode === 'mistakes' ? mistakeWords : [...reviewWords, ...freshWords, ...words.filter((word) => getWordProgress(state, word.id).mastery < REVIEW_MASTERY_THRESHOLD)];
  return source.filter((word, index) => source.findIndex((entry) => entry.id === word.id) === index).slice(0, SESSION_SIZE);
}
export function updateWordOutcome(state: AppState, wordId: string, remembered: boolean): AppState {
  const current = getWordProgress(state, wordId);
  const nextMastery = Math.max(0, Math.min(100, current.mastery + (remembered ? 18 : -12)));
  const nextState = { ...state, progressByWordId: { ...state.progressByWordId, [wordId]: { ...current, seenCount: current.seenCount + 1, correctCount: current.correctCount + (remembered ? 1 : 0), wrongCount: current.wrongCount + (remembered ? 0 : 1), mastery: nextMastery, lastStudiedAt: new Date().toISOString(), nextReviewAt: addDays(remembered ? (nextMastery >= 80 ? 3 : 1) : 0) } } };
  return recordActivity(nextState, remembered);
}
export function toggleFavorite(state: AppState, wordId: string): AppState { const current = getWordProgress(state, wordId); return { ...state, progressByWordId: { ...state.progressByWordId, [wordId]: { ...current, favorite: !current.favorite } } }; }
function recordActivity(state: AppState, remembered: boolean): AppState {
  const key = formatDateKey(new Date());
  const current: DailyActivity = state.dailyActivity[key] || { date: key, studiedWords: 0, reviewedWords: 0, durationSeconds: 0 };
  return { ...state, dailyActivity: { ...state.dailyActivity, [key]: { ...current, studiedWords: current.studiedWords + 1, reviewedWords: current.reviewedWords + (remembered ? 1 : 0), durationSeconds: current.durationSeconds + 25 } } };
}
export function getTodayActivity(state: AppState): DailyActivity { const key = formatDateKey(new Date()); return state.dailyActivity[key] || { date: key, studiedWords: 0, reviewedWords: 0, durationSeconds: 0 }; }
export function getRecentActivity(state: AppState, days = 7): DailyActivity[] { return Array.from({ length: days }).map((_, index) => { const date = new Date(); date.setDate(date.getDate() - (days - index - 1)); const key = formatDateKey(date); return state.dailyActivity[key] || { date: key, studiedWords: 0, reviewedWords: 0, durationSeconds: 0 }; }); }
export function getStreak(state: AppState): number { let streak = 0; for (let i = 0; i < 365; i += 1) { const date = new Date(); date.setDate(date.getDate() - i); const key = formatDateKey(date); const activity = state.dailyActivity[key]; if (activity && activity.studiedWords > 0) { streak += 1; continue; } break; } return streak; }
export function getWeakWords(state: AppState, limit = 5) { const book = getActiveBook(state); return book.words.map((word) => ({ word, progress: getWordProgress(state, word.id) })).filter(({ progress }) => progress.wrongCount > 0 || progress.mastery < 60).sort((a, b) => (b.progress.wrongCount - a.progress.wrongCount) || (a.progress.mastery - b.progress.mastery)).slice(0, limit).map(({ word, progress }) => ({ id: word.id, word: word.word, translation: word.translation, phonetic: word.phonetic, wrongCount: progress.wrongCount, mastery: progress.mastery, favorite: progress.favorite, nextReviewAt: progress.nextReviewAt, bookName: book.name })); }
export function getDashboard(state: AppState) { const book = getActiveBook(state); const metrics = getBookMetrics(state, book); const today = getTodayActivity(state); const accuracyBase = Object.values(state.progressByWordId).reduce((acc, item) => { acc.correct += item.correctCount; acc.total += item.seenCount; return acc; }, { correct: 0, total: 0 }); return { activeBook: book, metrics, today, streak: getStreak(state), accuracy: accuracyBase.total ? Math.round((accuracyBase.correct / accuracyBase.total) * 100) : 0, weakWords: getWeakWords(state), recentActivity: getRecentActivity(state) }; }
export { STORAGE_KEY, DEFAULT_DAILY_GOAL };
