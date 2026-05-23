import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import vocabData from '../data/hsk.json';
import { Volume2, ChevronLeft, ChevronRight, Heart, RotateCcw, Book, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VocabWord, WordMastery } from '../types';
import { updateWordMastery, updateStudyStreak, updateHSKProgress, getWordMastery } from '../lib/db';
import toast from 'react-hot-toast';

export default function VocabModule() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<'flashcard' | 'practice'>('flashcard');
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [masteryData, setMasteryData] = useState<Record<string, WordMastery>>({});
  const [loadingMastery, setLoadingMastery] = useState(false);

  // Initialize streak on load
  useEffect(() => {
    if (profile) {
      updateStudyStreak(profile.uid).then(() => refreshProfile());
    }
  }, []);

  // Fetch mastery data
  useEffect(() => {
    async function fetchMastery() {
      if (!profile) return;
      setLoadingMastery(true);
      try {
        const data = await getWordMastery(profile.uid);
        setMasteryData(data);
      } catch (err) {
        console.error('Error fetching mastery:', err);
      } finally {
        setLoadingMastery(false);
      }
    }
    fetchMastery();
  }, [profile?.uid, profile?.selectedLevel]);

  const { categories, allWordsInCategory, rawLevelData } = useMemo(() => {
    const levelKey = `HSK${profile?.selectedLevel || 1}`;
    const rawData = (vocabData as any)[levelKey];
    
    let cats: string[] = [];
    let allMappedWords: any[] = [];

    if (Array.isArray(rawData)) {
      allMappedWords = rawData.map((w, i) => ({ 
        ...w, 
        id: `${levelKey}-${i}`, 
        category: 'Ерөнхий',
        level: profile?.selectedLevel || 1
      }));
      cats = ['Ерөнхий'];
    } else if (rawData && typeof rawData === 'object') {
      Object.entries(rawData).forEach(([cat, wordList]: [string, any]) => {
        cats.push(cat);
        const mapped = wordList.map((w: any, i: number) => ({
          ...w,
          id: `${levelKey}-${cat}-${i}`,
          category: cat,
          level: profile?.selectedLevel || 1
        }));
        allMappedWords = [...allMappedWords, ...mapped];
      });
      if (cats.length > 1) {
        cats = ['Бүгд', ...cats];
      }
    }

    const words = allMappedWords.map((w: any) => ({
      id: w.id,
      character: w.hanzi,
      pinyin: w.pinyin,
      translation: w.mongolian,
      level: w.level,
      category: w.category
    })) as VocabWord[];

    // Sort words: new > learning > mastered (mastered go to end)
    const sortedWords = [...words].sort((a, b) => {
      const statusA = masteryData[a.id]?.status || 'new';
      const statusB = masteryData[b.id]?.status || 'new';
      const order = { 'new': 0, 'learning': 1, 'mastered': 2 };
      return order[statusA] - order[statusB];
    });

    return { categories: cats, allWordsInCategory: sortedWords, rawLevelData: sortedWords };
  }, [profile?.selectedLevel, masteryData]);

  const filteredWords = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'Бүгд') return allWordsInCategory;
    return allWordsInCategory.filter(w => w.category === selectedCategory);
  }, [allWordsInCategory, selectedCategory]);

  useEffect(() => {
    setIndex(0);
    setShowTranslation(false);
  }, [filteredWords, mode]);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % filteredWords.length);
    setShowTranslation(false);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + filteredWords.length) % filteredWords.length);
    setShowTranslation(false);
  };

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  };

  const onPractiseResult = async (wordId: string, isCorrect: boolean) => {
    if (!profile) return;
    try {
      await updateWordMastery(profile.uid, wordId, isCorrect);
      if (isCorrect) {
        toast.success('+10 XP олсон!', { duration: 2000, icon: '💰' });
      }
      
      // Fetch fresh mastery data to keep the UI & stats updated
      const freshMastery = await getWordMastery(profile.uid);
      setMasteryData(freshMastery);
      
      // Update overall progress percentage using fresh mastery data
      const masteredCount = Object.values(freshMastery).filter((m: any) => m.status === 'mastered').length;
      const totalWords = allWordsInCategory.length;
      const percentage = Math.round((masteredCount / totalWords) * 100);
      
      await updateHSKProgress(profile.uid, profile.selectedLevel, {
        vocabularyCompleted: percentage
      });

      refreshProfile();
    } catch (err) {
      console.error('Result update error:', err);
    }
  };

  if (loadingMastery) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin" />
        <p className="text-ink/40 font-bold uppercase tracking-widest">Ачаалж байна...</p>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 py-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 text-sm font-black text-muted hover:text-primary-orange transition-colors uppercase tracking-widest group"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-border-sub flex items-center justify-center group-hover:border-primary-orange">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Дашборд руу буцах
        </button>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-ink">Юу сурмаар байна вэ?</h1>
          <p className="text-muted text-lg">Суралцах ангиллаа сонгоно уу</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => {
            const catWords = cat === 'Бүгд' ? allWordsInCategory : allWordsInCategory.filter(w => w.category === cat);
            const totalCount = catWords.length;
            const masteredCount = catWords.filter(w => masteryData[w.id]?.status === 'mastered').length;
            const learningCount = catWords.filter(w => masteryData[w.id]?.status === 'learning').length;
            const pct = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
            
            return (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, translateY: -8 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className="bg-white p-6 rounded-[2.5rem] border-2 border-border-sub hover:border-primary-orange hover:shadow-2xl transition-all text-left flex flex-col justify-between h-72 group relative overflow-hidden"
              >
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-bg-orange/20 rounded-full group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10 space-y-3 w-full">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-xl bg-bg-soft group-hover:bg-primary-orange flex items-center justify-center transition-colors">
                      <Book className="w-6 h-6 text-ink group-hover:text-white transition-colors" />
                    </div>
                    {pct > 0 && (
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {pct}% цээжилсэн
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-primary-orange uppercase tracking-widest block mb-0.5">Ангилал</span>
                    <h3 className="text-2xl font-black text-ink leading-tight">{cat}</h3>
                  </div>
                  
                  <div className="pt-2 space-y-1.5 text-xs text-ink/60 font-bold w-full relative z-20">
                    <div className="flex justify-between">
                      <span>Нийт ханз:</span>
                      <span className="text-ink font-black">{totalCount} ханз</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Цээжилсэн / Бэлтгэл:</span>
                      <span className="text-emerald-600 font-extrabold">{masteredCount} <span className="text-ink/30">/</span> <span className="text-blue-600">{learningCount}</span></span>
                    </div>
                    <div className="w-full bg-bg-soft h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-primary-orange h-full rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
                <div className="relative z-10 flex items-center justify-between w-full pt-2">
                   <p className="text-[10px] text-muted-light font-black uppercase tracking-wider">HSK {profile?.selectedLevel || 1} Түвшин</p>
                   <ChevronRight className="w-5 h-5 text-muted-light group-hover:text-primary-orange group-hover:translate-x-1 transition-all" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <button 
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-3 text-sm font-black text-muted hover:text-primary-orange transition-colors uppercase tracking-widest group"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-border-sub flex items-center justify-center group-hover:border-primary-orange">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Буцах
        </button>
        <div className="flex bg-white p-1.5 rounded-2xl border border-border-sub shadow-sm w-full sm:w-auto">
          <button 
            onClick={() => setMode('flashcard')}
            className={`flex-1 sm:flex-none sm:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'flashcard' ? 'bg-primary-orange text-white shadow-md' : 'text-muted hover:bg-bg-soft'}`}
          >
            Цээжлэх
          </button>
          <button 
            onClick={() => setMode('practice')}
            className={`flex-1 sm:flex-none sm:px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'practice' ? 'bg-primary-orange text-white shadow-md' : 'text-muted hover:bg-bg-soft'}`}
          >
            Дасгал
          </button>
        </div>
      </div>

      {filteredWords.length > 0 && (
        <div className="bg-white px-6 py-4 rounded-3xl border border-border-sub flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-ink/70">
          <div className="flex items-center gap-2">
            <span className="text-primary-orange">📖 Ангилал:</span>
            <span className="text-ink font-extrabold">{selectedCategory}</span>
            <span className="text-ink/20">|</span>
            <span>Нийт: <span className="text-ink font-black">{filteredWords.length} ханз</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span>Одоо суралцаж буй: <span className="text-primary-orange font-black">Үг {index + 1} / {filteredWords.length}</span></span>
            <span className="text-ink/20">|</span>
            <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] uppercase">
              Ханз №{(filteredWords[index]?.id || '').split('-').pop()}
            </div>
          </div>
        </div>
      )}

      {mode === 'flashcard' ? (
        <div className="space-y-10">
          <div className="relative aspect-[4/3] md:aspect-[2/1] cursor-pointer group" onClick={() => setShowTranslation(!showTranslation)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={index + (showTranslation ? 'back' : 'front')}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                className="w-full h-full bg-white rounded-[40px] border-2 border-border-sub shadow-xl flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-bg-orange/20">
                  <div className="h-full bg-primary-orange transition-all" style={{ width: `${((index + 1) / filteredWords.length) * 100}%` }} />
                </div>
                
                <MasteryBadge status={masteryData[filteredWords[index].id]?.status || 'new'} />

                {!showTranslation ? (
                  <>
                    <h2 className="text-9xl font-black text-ink mb-2 tracking-tight">{filteredWords[index].character}</h2>
                    <p className="text-3xl font-bold text-primary-orange">{filteredWords[index].pinyin}</p>
                  </>
                ) : (
                  <div className="space-y-6">
                    <h3 className="text-6xl font-black text-ink">{filteredWords[index].character}</h3>
                    <h2 className="text-5xl font-black text-ink">{filteredWords[index].translation}</h2>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-8 right-8">
              <button 
                onClick={(e) => { e.stopPropagation(); playAudio(filteredWords[index].character); }}
                className="w-16 h-16 bg-primary-orange text-white rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110"
              >
                <Volume2 className="w-8 h-8" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8">
            <button onClick={handlePrev} className="w-20 h-20 flex items-center justify-center bg-white rounded-3xl border-2 border-border-sub hover:border-primary-orange hover:text-primary-orange transition-all">
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button 
              onClick={() => setShowTranslation(!showTranslation)}
              className="px-12 h-20 bg-primary-orange text-white font-black uppercase tracking-widest text-xs rounded-3xl shadow-xl hover:opacity-90 transition-all"
            >
              {showTranslation ? 'Ханз' : 'Утга'}
            </button>
            <button onClick={handleNext} className="w-20 h-20 flex items-center justify-center bg-white rounded-3xl border-2 border-border-sub hover:border-primary-orange hover:text-primary-orange transition-all">
              <ChevronRight className="w-10 h-10" />
            </button>
          </div>
        </div>
      ) : (
        <PracticeMode words={filteredWords} allLevelWords={rawLevelData} onResult={onPractiseResult} onRetry={() => setIndex(0)} />
      )}
    </div>
  );
}

function MasteryBadge({ status }: { status: string }) {
  const colors = {
    new: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    learning: 'bg-blue-50 text-blue-600 border-blue-100',
    mastered: 'bg-primary-orange/10 text-primary-orange border-primary-orange/20'
  };
  const labels = { new: 'Шинэ', learning: 'Уншиж байна', mastered: 'Цээжилсэн' };
  
  return (
    <div className={`absolute top-8 left-8 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors[status as keyof typeof colors]}`}>
      {labels[status as keyof typeof labels]}
    </div>
  );
}

function PracticeMode({ words, allLevelWords, onResult, onRetry }: { words: any[], allLevelWords: any[], onResult: (id: string, correct: boolean) => void, onRetry: () => void }) {
  const [practiceWords] = useState(() => [...words]);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [lives, setLives] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);

  const currentWord = practiceWords[index];

  useEffect(() => {
    if (!practiceWords || practiceWords.length === 0) return;
    if (index >= practiceWords.length) {
      setSessionFinished(true);
      return;
    }
    const correct = practiceWords[index];
    const pool = allLevelWords.length > 4 ? allLevelWords.filter(w => w.id !== correct.id) : practiceWords.filter(w => w.id !== correct.id);
    
    // Pick 3 random distractors efficiently instead of sorting the whole pool
    const wrongs: any[] = [];
    if (pool.length > 0) {
      const wrongsCount = Math.min(3, pool.length);
      const chosenIndices = new Set<number>();
      while (chosenIndices.size < wrongsCount) {
        const randIdx = Math.floor(Math.random() * pool.length);
        chosenIndices.add(randIdx);
      }
      chosenIndices.forEach(idx => {
        wrongs.push(pool[idx]);
      });
    }

    setOptions([correct, ...wrongs].sort(() => 0.5 - Math.random()));
  }, [index, practiceWords]);

  const handleSelect = (idx: number) => {
    if (selected !== null || gameOver || sessionFinished) return;
    setSelected(idx);
    const correct = options[idx].id === currentWord.id;
    setIsCorrect(correct);
    onResult(currentWord.id, correct);
    if (!correct) setLives(l => l - 1);
  };

  if (gameOver || lives <= 0) return (
    <div className="bg-white p-12 rounded-[40px] text-center space-y-6">
      <div className="text-6xl">💔</div>
      <h2 className="text-3xl font-black">Амь дууслаа</h2>
      <button onClick={() => { setLives(5); setIndex(0); setGameOver(false); }} className="px-8 py-4 bg-primary-orange text-white rounded-2xl font-bold">Дахин оролдох</button>
    </div>
  );

  if (sessionFinished) return (
    <div className="bg-white p-12 rounded-[40px] text-center space-y-6">
      <div className="text-6xl">🎉</div>
      <h2 className="text-3xl font-black">Маш сайн!</h2>
      <button onClick={() => { setIndex(0); setSessionFinished(false); onRetry(); }} className="px-8 py-4 bg-ink text-white rounded-2xl font-bold">Дахин эхлэх</button>
    </div>
  );

  return (
    <div className="bg-white p-12 rounded-[40px] border-2 border-border-sub shadow-xl space-y-10 text-center">
      <div className="flex justify-center gap-2">
        {[...Array(5)].map((_, i) => (
          <Heart key={i} className={`w-6 h-6 ${i < lives ? 'text-red-500 fill-red-500' : 'text-ink/10'}`} />
        ))}
      </div>
      <h2 className="text-8xl font-black text-ink">{currentWord.character}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={selected !== null}
            className={`p-6 rounded-2xl border-2 font-bold transition-all ${
              selected === i 
                ? (isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-red-500 border-red-500 text-white')
                : (selected !== null && opt.id === currentWord.id ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-bg-soft border-border-sub text-ink hover:border-muted')
            }`}
          >
            {opt.translation}
          </button>
        ))}
      </div>
      {selected !== null && (
        <button onClick={() => { setIndex(i => i + 1); setSelected(null); }} className="px-12 py-5 bg-ink text-white rounded-2xl font-black">Дараагийнх</button>
      )}
    </div>
  );
}
