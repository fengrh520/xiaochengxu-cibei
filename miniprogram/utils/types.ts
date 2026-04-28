export type WordProgress = {
  seenCount: number;
  correctCount: number;
  wrongCount: number;
  favorite: boolean;
  mastery: number;
  lastStudiedAt?: string;
  nextReviewAt?: string;
};

export type WordEntry = {
  id: string;
  bookId: string;
  word: string;
  translation: string;
  phonetic?: string;
  partOfSpeech?: string;
  example?: string;
  mnemonic?: string;
  root?: string;
  homophonic?: string;
};

export type WordBook = {
  id: string;
  name: string;
  exam: string;
  kind: 'builtin' | 'custom';
  description: string;
  accentColor: string;
  words: WordEntry[];
};

export type DailyActivity = {
  date: string;
  studiedWords: number;
  reviewedWords: number;
  durationSeconds: number;
};

export type AppState = {
  version: 1;
  books: WordBook[];
  progressByWordId: Record<string, WordProgress>;
  dailyActivity: Record<string, DailyActivity>;
  activeBookId: string;
  dailyGoal: number;
};

export type StudyMode = 'study' | 'review' | 'favorites' | 'mistakes';
