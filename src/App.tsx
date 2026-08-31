import { useState, useEffect, useCallback, useMemo } from 'react';
import { getBook, getChapter, getAllVerses, BOOKS } from './data/bible-data';
import { EXPLANATIONS, GLOSSARY, resolveRef } from './data/explanations';
import { cn } from './utils/cn';
import type { SidebarTab, Bookmark, Note, PrayerEntry } from './types';

// ─── Icons ────────────────────────────────────────────────────────────────────
type IconProps = { className?: string };
const Icons = {
  book: function I({ className }: IconProps) {
    return <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.361 0 4.021.888 5.25 2.298l4.75-4.75A8.966 8.966 0 0 0 12 6.042z" /></svg>;
  },
  explain: function I({ className }: IconProps) {
    return <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09zM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456z" /></svg>;
  },
  search: function I({ className }: IconProps) {
    return <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" /></svg>;
  },
  list: function I({ className }: IconProps) {
    return <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" /></svg>;
  },
  pin: function I({ className }: IconProps) {
    return <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185 0 1.123-.823 2.093-1.917 2.19-1.078.1-1.969-.889-1.969-2.19 0-1.08.817-1.972 1.912-2.083l.337-.872A8.26 8.26 0 0 1 20 2h-1.323c-1.07-.037-1.818.585-1.937 1.456-.084.521.176 1.08.724 1.255l.03.026h.042l.03-.026c.548-.175.806-.733.724-1.255-.096-.59-.497-1.068-1.095-1.203A7.952 7.952 0 0 0 11.75 1C9.313 1 7.5 2.814 7.5 4.694v.75l5.25 4.25c.215.174.45.26.7.26.745 0 1.446-.47 1.762-1.18.116-.242.176-.5.176-.77 0-.486-.18-.926-.516-1.26-.142-.142-.318-.287-.518-.417l-.853 1.278c-.28.417-.766.65-.947.65-.112 0-.216-.025-.314-.072a.418.418 0 0 0-.158.024 7.952 7.952 0 0 1-2.772 2.028 8.012 8.012 0 0 1 1.05-1.553z" /></svg>;
  },
  note: function I({ className }: IconProps) {
    return <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" /></svg>;
  },
  prayer: function I({ className }: IconProps) {
    return <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.795A4.25 4.25 0 0 1 18.75 8.35 4.305 4.305 0 0 1 15.5 7.705 4.25 4.25 0 0 1 12 9.295 4.25 4.25 0 0 1 8.5 7.705 4.305 4.305 0 0 1 5.25 8.35 4.25 4.25 0 0 1 3 12.795V20.5a2.75 2.75 0 0 0 2.75 2.75h1.372l.45-.123a.75.75 0 1 1 .528.881l-.45.123h2.822a2.75 2.75 0 0 0 2.75-2.75V12.795z" /></svg>;
  },
  tag: function I({ className }: IconProps) {
    return <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3.432a.75.75 0 0 1 1.04 0l2.5 2.5a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 0 1-.77.062L9.06 12l-2.5-2.5a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 0 1 .77-.062z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 21 12a8.967 8.967 0 0 0-3.278-7.241l.022-.132A7.039 7.039 0 0 1 12 6.042z" /></svg>;
  },
  settings: function I({ className }: IconProps) {
    return <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.3.656.61.827l1.085.813c.31.234.7.353 1.11.353.41 0 .8-.119 1.11-.353l1.085-.813c.31-.17.546-.453.61-.827l.213-1.281c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.3.656.61.827l1.085.813c.31.234.7.353 1.11.353.41 0 .8-.119 1.11-.353l1.085-.813c.31-.17.546-.453.61-.827l.213-1.281c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.3.656.61.827l1.085.813c.309.234.7.353 1.11.353s.8-.119 1.11-.353l1.085-.813c.31-.17.546-.453.61-.827l.213-1.281c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.3.656.61.827l1.085.813c.309.234.7.353 1.11.353s.8-.119 1.11-.353l1.085-.813c.31-.17.546-.453.61-.827l.213-1.281z" /><circle cx="12" cy="12" r="3.25" /></svg>;
  },
  x: function I({ className }: IconProps) {
    return <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
  },
  check: function I({ className }: IconProps) {
    return <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>;
  },
  sun: function I({ className }: IconProps) {
    return <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5m0 16.5v1.5m-3.75-9.75h7.5m-7.5 3.75h7.5M21 15.75h.008v.008H21V15.75zm0 2.25h.008v.008H21v-.008zm-3.75 2.25h7.5m-7.5 3.75h7.5M21 9h.008v.008H21V9zm0 2.25h.008v.008H21v-.008zm-3.75 2.25h7.5m-7.5 3.75h7.5M21 6.75h.008v.008H21V6.75zm0 2.25h.008v.008H21v-.008z" /></svg>;
  },
  moon: function I({ className }: IconProps) {
    return <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.582.748-3.752A9.72 9.72 0 0 0 21.752 15.002z" /></svg>;
  },
  menu: function I({ className }: IconProps) {
    return <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
  },
  arrowLeft: function I({ className }: IconProps) {
    return <svg className={className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
  },
  arrowRight: function I({ className }: IconProps) {
    return <svg className={className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;
  },
  heart: function I({ className }: IconProps) {
    return <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.05-4.5-4.5-4.5h-5.25c-2.485 0-4.5 2.015-4.5 4.5v11.25c0 2.562 2.031 4.588 4.5 4.588h4.5c2.485 0 4.5-2.026 4.5-4.588V8.25z" /></svg>;
  },
};

const TABS: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
  { id: 'read', label: 'Read', icon: <Icons.book /> },
  { id: 'explain', label: 'Explain', icon: <Icons.explain /> },
  { id: 'search', label: 'Search Bible', icon: <Icons.search /> },
  { id: 'glossary', label: 'Word Study', icon: <Icons.tag /> },
  { id: 'bookmarks', label: 'Bookmarks', icon: <Icons.pin /> },
  { id: 'notes', label: 'My Notes', icon: <Icons.note /> },
  { id: 'prayer', label: 'Prayer', icon: <Icons.prayer /> },
  { id: 'about', label: 'About', icon: <Icons.settings /> },
];

// ─── Memory hook (localStorage) ────────────────────────────────────────────────
function useAppMemory() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [prayers, setPrayers] = useState<PrayerEntry[]>([]);
  const [dark, setDark] = useState(false);
  const [fontSize, setFontSize] = useState(17);

  useEffect(() => {
    try {
      const n = localStorage.getItem('BIBLE_NOTES'); if (n) setNotes(JSON.parse(n));
      const b = localStorage.getItem('BIBLE_BOOKMARKS'); if (b) setBookmarks(JSON.parse(b));
      const p = localStorage.getItem('BIBLE_PRAYERS'); if (p) setPrayers(JSON.parse(p));
      const s = localStorage.getItem('BIBLE_SETTINGS'); if (s) { const d = JSON.parse(s); setDark(d.dark ?? false); setFontSize(d.fontSize ?? 17); }
    } catch {}
  }, []);

  const save = useCallback((key: string, val: unknown) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, []);

  return {
    notes, setNotes: (n: Note[]) => { setNotes(n); save('BIBLE_NOTES', n); },
    bookmarks, setBookmarks: (b: Bookmark[]) => { setBookmarks(b); save('BIBLE_BOOKMARKS', b); },
    prayers, setPrayers: (p: PrayerEntry[]) => { setPrayers(p); save('BIBLE_PRAYERS', p); },
    dark, setDark: (d: boolean) => { setDark(d); save('BIBLE_SETTINGS', { dark: d, fontSize }); },
    fontSize, setFontSize: (f: number) => { setFontSize(f); save('BIBLE_SETTINGS', { dark, fontSize: f }); },
  };
}

// Parse a ref like "joh_3_16" -> {bookId, chapter, verse}
function parseRef(ref: string): { bookId: string; chapter: number; verse: number } | null {
  const parts = ref.split('_');
  if (parts.length < 3) return null;
  return { bookId: parts[0], chapter: Number(parts[1]), verse: Number(parts[2]) };
}

// Build a list of all explained verses with their text
const EXPLAINED_LIST = (() => {
  const all = getAllVerses();
  return Object.keys(EXPLANATIONS)
    .map((key) => {
      const found = all.find((v) => `${v.bookId}_${v.chapter}_${v.verse}` === key);
      const book = found ? getBook(found.bookId) : null;
      return found && book
        ? { key, bookId: found.bookId, chapter: found.chapter, verse: found.verse, text: found.text, bookName: book.name, theme: EXPLANATIONS[key].theme }
        : null;
    })
    .filter(Boolean) as { key: string; bookId: string; chapter: number; verse: number; text: string; bookName: string; theme: string }[];
})();

export default function App() {
  const mem = useAppMemory();
  const [tab, setTab] = useState<SidebarTab>('read');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentBookId, setCurrentBookId] = useState('joh');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [verses, setVerses] = useState<string[]>([]);
  const [explainKey, setExplainKey] = useState<string | null>(null);
  const [explainVerse, setExplainVerse] = useState<{ bookName: string; chapter: number; verse: number; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ bookId: string; chapter: number; verse: number; text: string }[]>([]);
  const [explainSearch, setExplainSearch] = useState('');
  const [showExplainedOnly, setShowExplainedOnly] = useState(false);
  const [glossaryTerm, setGlossaryTerm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [noteEditor, setNoteEditor] = useState<{ verseKey: string; bookName: string; chapter: number; verse: number; text: string } | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [prsContent, setPrsContent] = useState('');
  const [prsCategory, setPrsCategory] = useState<'thanksgiving' | 'supplication' | 'confession' | 'intercession'>('supplication');

  const flash = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  }, []);

  // Dark mode sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mem.dark);
  }, [mem.dark]);

  // Load verses
  useEffect(() => {
    const v = getChapter(currentBookId, currentChapter);
    if (v) {
      setVerses(v);
    } else {
      // book has no data for this chapter -> try to find a populated chapter
      const book = getBook(currentBookId);
      if (book && currentBookId !== 'gen') {
        setCurrentChapter(1);
      } else {
        setVerses([]);
      }
    }
  }, [currentBookId, currentChapter]);

  const book = getBook(currentBookId);
  const chapterLabel = book ? `${book.name} ${currentChapter}` : '';

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const all = getAllVerses();
    setSearchResults(all.filter((v) => v.text.toLowerCase().includes(q) || getBook(v.bookId)?.name.toLowerCase().includes(q)).slice(0, 200));
  }, [searchQuery]);

  const navigateTo = useCallback((bookId: string, chapter: number) => {
    setCurrentBookId(bookId);
    setCurrentChapter(chapter);
    setTab('read');
    setSidebarOpen(false);
  }, []);

  const openExplain = useCallback((bookId: string, chapter: number, verse: number, text: string) => {
    const book = getBook(bookId);
    const key = `${bookId}_${chapter}_${verse}`;
    if (!EXPLANATIONS[key]) { flash('No explanation available for this verse yet.', 'info'); return; }
    setExplainKey(key);
    setExplainVerse({ bookName: book?.name ?? bookId, chapter, verse, text });
  }, [flash]);

  // ─── Explanation Modal ─────────────────────────────────────────────────────
  function ExplanationModal() {
    if (!explainKey || !explainVerse) return null;
    const ex = EXPLANATIONS[explainKey];
    if (!ex) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setExplainKey(null); setExplainVerse(null); }} />
        <div className="relative w-full sm:max-w-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto max-h-full sm:max-h-[88vh] flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 px-5 py-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-white/80 text-xs font-medium uppercase tracking-wide">
                <Icons.explain className="w-4 h-4" /> Verse Explanation
              </div>
              <h3 className="text-white font-bold text-lg mt-0.5">
                {explainVerse.bookName} {explainVerse.chapter}:{explainVerse.verse}
              </h3>
            </div>
            <button onClick={() => { setExplainKey(null); setExplainVerse(null); }} className="p-1.5 rounded-lg text-white/80 hover:bg-white/15">
              <Icons.x className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Verse text */}
            <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-400 dark:border-amber-600 rounded-r-lg px-4 py-3">
              <p className="text-gray-700 dark:text-amber-100 italic leading-relaxed">"{explainVerse.text}"</p>
            </div>

            {/* Theme badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-semibold">
                <Icons.tag className="w-3.5 h-3.5" /> {ex.theme}
              </span>
            </div>

            {/* Summary */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Summary
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{ex.summary}</p>
            </div>

            {/* Details */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Deeper Study
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[15px]">{ex.details}</p>
            </div>

            {/* Keywords / word study */}
            {ex.keywords && ex.keywords.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Word Study
                </h4>
                <div className="space-y-2">
                  {ex.keywords.map((kw) => (
                    <div key={kw.word} className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <span className="font-semibold text-amber-700 dark:text-amber-300">{kw.word}</span>
                      <span className="text-gray-700 dark:text-gray-300"> — {kw.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cross references */}
            {ex.crossReferences.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Cross References
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ex.crossReferences.map((ref) => {
                    const p = parseRef(ref);
                    const hasData = p ? !!getChapter(p.bookId, p.chapter) : false;
                    return (
                      <button
                        key={ref}
                        disabled={!hasData}
                        onClick={() => { if (p) { navigateTo(p.bookId, p.chapter); setExplainKey(null); setExplainVerse(null); flash(`Opened ${resolveRef(ref)}`); } }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                          hasData
                            ? "bg-white dark:bg-gray-800 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                            : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        )}
                        title={hasData ? `Go to ${resolveRef(ref)}` : `${resolveRef(ref)} — not in this edition`}
                      >
                        {resolveRef(ref)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Application */}
            {ex.application && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-3">
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide mb-1 flex items-center gap-2">
                  <Icons.heart className="w-4 h-4" /> Apply It
                </h4>
                <p className="text-emerald-900 dark:text-emerald-100 leading-relaxed">{ex.application}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  if (!explainVerse) return;
                  const vkey = explainKey!;
                  const idx = mem.bookmarks.findIndex((b) => b.verseKey === vkey);
                  if (idx >= 0) {
                    mem.setBookmarks(mem.bookmarks.filter((b) => b.verseKey !== vkey));
                    flash('Removed from bookmarks', 'info');
                  } else {
                    mem.setBookmarks([...mem.bookmarks, {
                      id: `${Date.now()}`, verseKey: vkey, bookName: explainVerse.bookName,
                      chapter: explainVerse.chapter, verse: explainVerse.verse, text: explainVerse.text, note: '', createdAt: new Date().toISOString(), color: 'amber',
                    }]);
                    flash('Bookmarked!');
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
              >
                <Icons.pin className="w-4 h-4 inline mr-1" /> Bookmark
              </button>
              <button
                onClick={() => {
                  if (!explainVerse) return;
                  setNoteEditor({ verseKey: explainKey!, bookName: explainVerse.bookName, chapter: explainVerse.chapter, verse: explainVerse.verse, text: explainVerse.text });
                  setNoteContent('');
                  setExplainKey(null);
                  setExplainVerse(null);
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
              >
                <Icons.note className="w-4 h-4 inline mr-1" /> Add Note
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Verse block ────────────────────────────────────────────────────────────
  function VerseBlock({ vIdx }: { vIdx: number }) {
    const text = verses[vIdx];
    if (!text) return null;
    const verseNum = vIdx + 1;
    const key = `${currentBookId}_${currentChapter}_${verseNum}`;
    const hasEx = !!EXPLANATIONS[key];
    const hasNote = mem.notes.some((n) => n.verseKey === key);
    const isBookmarked = mem.bookmarks.some((b) => b.verseKey === key);

    return (
      <div className={cn("group relative py-3", showExplainedOnly && !hasEx ? "hidden" : "")}>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
            <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-white dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
              {verseNum}
            </span>
            {hasEx && (
              <button
                onClick={() => openExplain(currentBookId, currentChapter, verseNum, text)}
                className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                title="Explain this verse"
              >
                <Icons.explain className="w-4 h-4" />
              </button>
            )}
          </div>
          <p
            className="flex-1 leading-relaxed text-gray-800 dark:text-gray-200"
            style={{ fontSize: `${mem.fontSize}px`, lineHeight: 1.7 }}
          >
            {text}
          </p>
        </div>

        {/* hover actions */}
        <div className="absolute right-1 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          {hasEx && (
            <button onClick={() => openExplain(currentBookId, currentChapter, verseNum, text)} className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60" title="Explain">
              <Icons.explain className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              const vkey = key;
              const idx = mem.bookmarks.findIndex((b) => b.verseKey === vkey);
              if (idx >= 0) { mem.setBookmarks(mem.bookmarks.filter((b) => b.verseKey !== vkey)); flash('Removed bookmark', 'info'); }
              else { mem.setBookmarks([...mem.bookmarks, { id: `${Date.now()}`, verseKey: vkey, bookName: book?.name ?? currentBookId, chapter: currentChapter, verse: verseNum, text, note: '', createdAt: new Date().toISOString(), color: 'amber' }]); flash('Bookmarked!'); }
            }}
            className={cn("p-1.5 rounded-lg", isBookmarked ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600")}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Icons.pin className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setNoteEditor({ verseKey: key, bookName: book?.name ?? currentBookId, chapter: currentChapter, verse: verseNum, text }); setNoteContent(''); }}
            className={cn("p-1.5 rounded-lg", hasNote ? "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600")}
            title={hasNote ? 'Edit note' : 'Add note'}
          >
            <Icons.note className="w-4 h-4" />
          </button>
        </div>

        {hasNote && (() => {
          const nt = mem.notes.find((n) => n.verseKey === key);
          if (!nt) return null;
          return (
            <div className="ml-10 mt-1.5">
              <div className="bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/50 rounded-lg px-3 py-2 text-sm text-violet-700 dark:text-violet-300">
                {nt.content}
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // Filtered explained list (for Explain tab search)
  const filteredExplained = useMemo(() => {
    if (!explainSearch.trim()) return EXPLAINED_LIST;
    const q = explainSearch.toLowerCase();
    return EXPLAINED_LIST.filter((e) =>
      e.text.toLowerCase().includes(q) ||
      e.theme.toLowerCase().includes(q) ||
      `${e.bookName} ${e.chapter}:${e.verse}`.toLowerCase().includes(q) ||
      (EXPLANATIONS[e.key] && (EXPLANATIONS[e.key].summary.toLowerCase().includes(q) || EXPLANATIONS[e.key].details.toLowerCase().includes(q)))
    );
  }, [explainSearch]);

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside className={cn("fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300", sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        <div className="h-14 px-4 flex items-center gap-2.5 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-amber-900/40">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.361 0 4.021.888 5.25 2.298l4.75-4.75A8.966 8.966 0 0 0 12 6.042z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Scripture<span className="text-amber-600 dark:text-amber-400">Forge</span></h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Explaining God's Word</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setSidebarOpen(false); }} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border", tab === t.id ? "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200 dark:shadow-amber-900/40" : "text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800")}>
              {t.icon}
              {t.label}
              {t.id === 'explain' && (
                <span className="ml-auto text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-bold">
                  {EXPLAINED_LIST.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Icons.sun className="w-4 h-4" />
            <input type="range" min="14" max="24" value={mem.fontSize} onChange={(e) => mem.setFontSize(Number(e.target.value))} className="w-16 accent-amber-500" />
            <span>{mem.fontSize}</span>
          </div>
          <button onClick={() => mem.setDark(!mem.dark)} className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            {mem.dark ? <Icons.sun className="w-5 h-5" /> : <Icons.moon className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Top bar */}
        <div className="h-14 shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur flex items-center gap-2 px-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Icons.menu className="w-5 h-5" />
          </button>

          {tab === 'read' && (
            <>
              <select value={currentBookId} onChange={(e) => { setCurrentBookId(e.target.value); setCurrentChapter(1); }} className="flex-1 min-w-0 text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {BOOKS.map((b) => (
                  <option key={b.id} value={b.id} disabled={!getChapter(b.id, 1)}>
                    {b.name}{!getChapter(b.id, 1) ? ' (soon)' : ''}
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {book?.testament === 'old' ? 'OT' : 'NT'} · {currentChapter}/{book?.chapters ?? '?'}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentChapter((c) => Math.max(1, c - 1))} disabled={currentChapter <= 1} className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">
                  <Icons.arrowLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setCurrentChapter((c) => Math.min(book?.chapters ?? currentChapter, c + 1))} disabled={currentChapter >= (book?.chapters ?? 1)} className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">
                  <Icons.arrowRight className="w-4 h-4" />
                </button>
              </div>
              <label className="hidden md:flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 cursor-pointer select-none">
                <input type="checkbox" checked={showExplainedOnly} onChange={(e) => setShowExplainedOnly(e.target.checked)} className="accent-amber-500" />
                Explained only
              </label>
            </>
          )}

          {tab !== 'read' && (
            <h2 className="text-base font-bold capitalize text-gray-900 dark:text-white">{TABS.find((t) => t.id === tab)?.label}</h2>
          )}

          <button onClick={() => mem.setDark(!mem.dark)} className="lg:hidden ml-auto p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            {mem.dark ? <Icons.sun className="w-5 h-5" /> : <Icons.moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* READ */}
          {tab === 'read' && (
            <div className="max-w-2xl mx-auto px-4 py-6">
              {book && verses.length > 0 ? (
                <>
                  <div className="mb-4 flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{chapterLabel}</h3>
                    {showExplainedOnly && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">Showing verses with explanations</span>
                    )}
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm divide-y divide-gray-100 dark:divide-gray-800/60 px-3 sm:px-5">
                    {verses.map((_, i) => <VerseBlock key={i} vIdx={i} />)}
                  </div>
                  <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-5">
                    Tap the ✦ icon on any verse to read its explanation, cross-references, and word study.
                  </p>
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                    <Icons.book className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">More Bible Books Coming</h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    This edition currently includes {BOOKS.filter((b) => getChapter(b.id, 1)).length} books with verse explanations. Choose one from the dropdown above to begin.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* EXPLAIN */}
          {tab === 'explain' && (
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
              <div className="relative">
                <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={explainSearch} onChange={(e) => setExplainSearch(e.target.value)} placeholder="Search explanations, themes, or verses..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {EXPLAINED_LIST.length} explained passages — tap any to study it
              </p>
              <div className="space-y-2.5">
                {filteredExplained.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-sm">No explanations match your search.</div>
                )}
                {filteredExplained.map((e) => {
                  const exp = EXPLANATIONS[e.key];
                  return (
                    <button key={e.key} onClick={() => openExplain(e.bookId, e.chapter, e.verse, e.text)} className="w-full text-left bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all group">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-amber-700 dark:text-amber-300 text-sm">{e.bookName} {e.chapter}:{e.verse}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-medium shrink-0">{e.theme}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">"{e.text}"</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1.5 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">✦ {exp.summary}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SEARCH */}
          {tab === 'search' && (
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
              <div className="relative">
                <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search the Bible..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              {searchQuery && (
                <div className="text-xs text-gray-500 dark:text-gray-400">{searchResults.length} results</div>
              )}
              <div className="space-y-2">
                {searchResults.map((r, i) => {
                  const b = getBook(r.bookId);
                  return (
                    <button key={`${r.bookId}-${r.chapter}-${r.verse}-${i}`} onClick={() => navigateTo(r.bookId, r.chapter)} className="w-full text-left bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 hover:border-amber-300 dark:hover:border-amber-700 transition-all">
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">{b?.name ?? r.bookId} {r.chapter}:{r.verse}</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{r.text}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* GLOSSARY / WORD STUDY */}
          {tab === 'glossary' && (
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Key biblical words with their original-language meaning.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(GLOSSARY).map(([term, g]) => (
                  <button key={term} onClick={() => setGlossaryTerm(term)} className="text-left bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-amber-300 dark:hover:border-amber-700 transition-all">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-700 dark:text-amber-300">{term}</span>
                      {g.hebrew && <span className="text-lg" dir="rtl">{g.hebrew}</span>}
                      {g.greek && <span className="text-lg italic">{g.greek}</span>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{g.definition}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BOOKMARKS */}
          {tab === 'bookmarks' && (
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-2.5">
              {mem.bookmarks.length === 0 && <div className="text-center py-16 text-gray-400 text-sm">No bookmarks yet. Tap the pin on any verse.</div>}
              {mem.bookmarks.map((b) => (
                <div key={b.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex items-start gap-2">
                    <Icons.pin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">{b.bookName} {b.chapter}:{b.verse}</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{b.text}</p>
                    </div>
                    <button onClick={() => { mem.setBookmarks(mem.bookmarks.filter((x) => x.id !== b.id)); flash('Removed', 'info'); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500">
                      <Icons.x className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NOTES */}
          {tab === 'notes' && (
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-2.5">
              {mem.notes.length === 0 && <div className="text-center py-16 text-gray-400 text-sm">No notes yet. Tap the note icon on any verse.</div>}
              {mem.notes.map((n) => (
                <div key={n.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex items-start gap-2">
                    <Icons.note className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">{n.bookName} {n.chapter}:{n.verse}</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{n.content}</p>
                    </div>
                    <button onClick={() => { mem.setNotes(mem.notes.filter((x) => x.id !== n.id)); flash('Deleted', 'info'); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500">
                      <Icons.x className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PRAYER */}
          {tab === 'prayer' && (
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <textarea value={prsContent} onChange={(e) => setPrsContent(e.target.value)} rows={3} placeholder="Lord, I pray..." className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(['thanksgiving', 'supplication', 'confession', 'intercession'] as const).map((c) => (
                    <button key={c} onClick={() => setPrsCategory(c)} className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", prsCategory === c ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400")}>
                      {c}
                    </button>
                  ))}
                </div>
                <button onClick={() => {
                  if (!prsContent.trim()) { flash('Write a prayer first', 'error'); return; }
                  mem.setPrayers([...mem.prayers, { id: `${Date.now()}`, content: prsContent.trim(), category: prsCategory, createdAt: new Date().toISOString(), answered: false }]);
                  setPrsContent('');
                  flash('Prayer recorded');
                }} className="mt-2 w-full px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium">Record Prayer</button>
              </div>
              <div className="space-y-2.5">
                {mem.prayers.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">Your prayer journal is empty.</div>}
                {mem.prayers.map((p) => (
                  <div key={p.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium">{p.category}</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{p.content}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { mem.setPrayers(mem.prayers.map((x) => x.id === p.id ? { ...x, answered: !x.answered } : x)); flash(p.answered ? 'Marked unanswered' : 'Praise God — answered!'); }} className={cn("p-1.5 rounded-lg", p.answered ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30" : "text-gray-400 hover:text-emerald-600")}>
                          <Icons.check className="w-4 h-4" />
                        </button>
                        <button onClick={() => { mem.setPrayers(mem.prayers.filter((x) => x.id !== p.id)); flash('Deleted', 'info'); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500">
                          <Icons.x className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABOUT */}
          {tab === 'about' && (
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white text-center shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <Icons.explain className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold">ScriptureForge</h2>
                <p className="text-white/80 text-sm mt-1">Explaining God's Word, verse by verse</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
                <h3 className="font-bold text-gray-900 dark:text-white">What this app does</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex gap-2"><span className="text-amber-500">✦</span> <span><b>Explain any verse</b> — tap the sparkle to read a summary, deeper study, word study, cross-references, and a practical application.</span></li>
                  <li className="flex gap-2"><span className="text-amber-500">✦</span> <span><b>Browse all explained passages</b> in the Explain tab, searchable by theme or keyword.</span></li>
                  <li className="flex gap-2"><span className="text-amber-500">✦</span> <span><b>Word Study</b> — original-language meanings of key biblical terms.</span></li>
                  <li className="flex gap-2"><span className="text-amber-500">✦</span> <span><b>Cross-references</b> that link related verses across the Bible.</span></li>
                  <li className="flex gap-2"><span className="text-amber-500">✦</span> <span><b>Notes, bookmarks, and a prayer journal</b> — all saved privately in your browser.</span></li>
                </ul>
              </div>
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 px-4">
                This edition includes {BOOKS.filter((b) => getChapter(b.id, 1)).length} books of the KJV with {EXPLAINED_LIST.length} verse explanations. More books and commentary are added continuously. All data stays on your device.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Glossary modal */}
      {glossaryTerm && GLOSSARY[glossaryTerm] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setGlossaryTerm(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-amber-700 dark:text-amber-300">{glossaryTerm}</h3>
                {GLOSSARY[glossaryTerm].hebrew && <span className="text-2xl" dir="rtl">{GLOSSARY[glossaryTerm].hebrew}</span>}
                {GLOSSARY[glossaryTerm].greek && <span className="text-2xl italic">{GLOSSARY[glossaryTerm].greek}</span>}
              </div>
              <button onClick={() => setGlossaryTerm(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><Icons.x className="w-5 h-5" /></button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{GLOSSARY[glossaryTerm].definition}</p>
          </div>
        </div>
      )}

      {/* Note editor */}
      {noteEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setNoteEditor(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full p-5">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Note — {noteEditor.bookName} {noteEditor.chapter}:{noteEditor.verse}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-3 border-l-4 border-violet-300 dark:border-violet-700 pl-3">"{noteEditor.text}"</p>
            <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} rows={4} placeholder="Write your study note..." className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setNoteEditor(null)} className="px-4 py-2 rounded-lg text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
              <button onClick={() => {
                if (!noteContent.trim()) { flash('Note cannot be empty', 'error'); return; }
                const ne = noteEditor;
                const newNote: Note = { id: `${Date.now()}`, verseKey: ne.verseKey, bookName: ne.bookName, chapter: ne.chapter, verse: ne.verse, text: ne.text, content: noteContent.trim(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
                mem.setNotes([...mem.notes, newNote]);
                setNoteEditor(null);
                flash('Note saved!');
              }} className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium">Save Note</button>
            </div>
          </div>
        </div>
      )}

      <ExplanationModal />

      {/* Toast */}
      {toast && (
        <div className={cn("fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all", toast.type === 'success' && "bg-emerald-600 text-white", toast.type === 'error' && "bg-red-600 text-white", toast.type === 'info' && "bg-gray-800 dark:bg-gray-700 text-white")}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
