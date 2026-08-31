export interface BibleVerse {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BookInfo {
  id: string;
  name: string;
  testament: 'old' | 'new';
  chapters: number;
  displayOrder: number;
}

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  totalDays: number;
  readingOrder: { bookId: string; chapter: number }[];
  currentDay: number;
  startDate: string | null;
}

export interface Note {
  id: string;
  verseKey: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  verseKey: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  note: string;
  createdAt: string;
  color: 'amber' | 'rose' | 'sky' | 'emerald' | 'violet';
}

export interface PrayerEntry {
  id: string;
  content: string;
  category: 'thanksgiving' | 'supplication' | 'confession' | 'intercession';
  createdAt: string;
  answered: boolean;
}

export interface TopicalTag {
  id: string;
  name: string;
  color: string;
  verseKeys: string[];
}

export interface DailyVerse {
  verseKey: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  date: string;
}

export interface AppState {
  currentBook: string;
  currentChapter: number;
  currentVerse: number;
  darkMode: boolean;
  sidebarOpen: boolean;
}

export type SidebarTab = 'read' | 'explain' | 'search' | 'glossary' | 'bookmarks' | 'notes' | 'prayer' | 'about';
