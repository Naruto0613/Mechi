export enum HSKLevel {
  L1 = 1,
  L2 = 2,
  L3 = 3,
  L4 = 4,
  L5 = 5,
  L6 = 6
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  selectedLevel: HSKLevel;
  totalXp: number;
  currentStreak: number;
  lastStudiedAt: any; // Firestore Timestamp
  createdAt: any; // Firestore Timestamp
  password?: string; // Stored locally
  isPaid?: boolean; // subscription status
  paidUntil?: string; // subscription expiration date
  paymentPending?: boolean; // subscription pending approval
  isTrial?: boolean;
  trialEligibilityCheckFailed?: boolean;
}

export interface HSKProgress {
  vocabularyCompleted: number;
  listeningCompleted: number;
  grammarCompleted: number;
  readingCompleted: number;
  mockExamHighScore: number;
  updatedAt: any;
}

export interface WordMastery {
  wordId: string;
  status: 'new' | 'learning' | 'mastered';
  correctCount: number;
  wrongCount: number;
  lastSeenAt: any;
}

export interface SignupData {
  displayName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VocabWord {
  id: string;
  character: string;
  pinyin: string;
  translation: string;
  level: HSKLevel;
  category?: string;
  audioUrl?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'listening';
  question: string;
  options: string[];
  correctIndex: number;
  audioUrl?: string;
}

export interface Lesson {
  id: string;
  level: HSKLevel;
  title: string;
  content: string; // Markdown
  quiz: QuizQuestion[];
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export interface DailyTip {
  level: HSKLevel;
  title: string;
  characters: {
    hanzi: string;
    pinyin: string;
    meanings: string[];
    etymology?: string;
    examples: { ch: string; mn: string }[];
  }[];
}
