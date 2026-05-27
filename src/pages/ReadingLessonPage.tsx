import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, BookOpen, HelpCircle, Check, X, CheckCircle2, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { addXp, completeReadingLesson } from '../lib/db';
import readingData from '../data/reading.json';
import toast from 'react-hot-toast';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface ReadingExercise {
  id: string;
  title: string;
  difficulty: string;
  passage: string;
  pinyin: string;
  translation: string;
  quiz: QuizQuestion[];
}

export default function ReadingLessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();

  const [exercise, setExercise] = useState<ReadingExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);

  // Quiz state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    // Find exercise by id
    let foundEx: ReadingExercise | null = null;
    for (const level of Object.values(readingData)) {
      const match = level.find((e: any) => e.id === id);
      if (match) {
        foundEx = match as ReadingExercise;
        break;
      }
    }

    if (foundEx) {
      setExercise(foundEx);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <div className="space-y-2">
          <h2 className="text-xl font-black text-ink">Ачааллаж байна...</h2>
          <p className="text-ink/60 font-medium">Унших дасгалыг бэлдэж байна.</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="text-5xl">⚠️</div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-ink">Дасгал олдсонгүй</h2>
          <p className="text-ink/60 font-medium font-semibold">Уучлаарай, ийм унших дасгал байхгүй байна.</p>
        </div>
        <button
          onClick={() => navigate('/reading')}
          className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold"
        >
          Жагсаалт руу буцах
        </button>
      </div>
    );
  }

  // Parse HSK level number from ID
  const hskMatch = exercise.id.match(/hsk(\d)_/i);
  const levelNumber = hskMatch ? parseInt(hskMatch[1], 10) : 1;

  const handleOptionClick = async (idx: number) => {
    if (isAnswered) return;
    setSelectedOptIdx(idx);
    setIsAnswered(true);

    const question = exercise.quiz[currentQuestionIdx];
    const isCorrect = idx === question.correct;

    if (isCorrect) {
      setEarnedXp(prev => prev + 15);
      toast.success('+15 XP оноо шууд авлаа! 💰', { id: 'quiz-success' });
      if (profile?.uid) {
        await addXp(profile.uid, 15);
      }
    } else {
      toast.error('Буруу хариуллаа, зөв хариултыг зааж өглөө.', { id: 'quiz-error' });
    }
  };

  const handleNextBtn = async () => {
    setSelectedOptIdx(null);
    setIsAnswered(false);

    if (currentQuestionIdx < exercise.quiz.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Completed full quiz!
      setSavingProgress(true);
      try {
        if (profile?.uid) {
          // completeReadingLesson saves to progress subcollection and awards +25 XP completion bonus
          await completeReadingLesson(profile.uid, levelNumber, exercise.id);
          await refreshProfile();
        }
      } catch (e) {
        console.error('Failed to notify database about reading completion:', e);
      } finally {
        setSavingProgress(false);
        setQuizFinished(true);
      }
    }
  };

  const currentQuestion = exercise.quiz[currentQuestionIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12" id="reading-lesson-container">
      {/* Back Button and Progress Indicator */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/reading')} 
          className="flex items-center gap-3 text-sm font-black text-muted hover:text-indigo-500 transition-colors uppercase tracking-widest group"
          id="lesson-back-btn"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-border-sub flex items-center justify-center group-hover:border-indigo-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Жагсаалт руу
        </button>
        <div className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100">
          Унших • HSK {levelNumber}
        </div>
      </div>

      {!quizFinished ? (
        <React.Fragment>
          {/* Main Learn Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-border-sub shadow-sm overflow-hidden"
          >
            {/* Header Box with highlighted Title */}
            <div className="bg-indigo-500 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="space-y-4 relative z-10">
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  Унших эх
                </span>
                <h1 className="text-2xl sm:text-3xl font-black">{exercise.title}</h1>
              </div>
            </div>

            {/* Passage Display Area */}
            <div className="p-6 sm:p-10 space-y-8">
              <div className="flex flex-wrap items-center justify-end gap-3 border-b border-border-sub pb-4">
                {/* Pinyin Controller */}
                <button 
                  onClick={() => setShowPinyin(!showPinyin)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
                    showPinyin 
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                      : 'bg-white text-ink/40 border-border-sub/50 hover:bg-slate-50'
                  }`}
                >
                  {showPinyin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  Пиньинь {showPinyin ? 'нуух' : 'харах'}
                </button>

                {/* Mongolian Translation Controller */}
                <button 
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
                    showTranslation 
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                      : 'bg-white text-ink/40 border-border-sub/50 hover:bg-slate-50'
                  }`}
                >
                  {showTranslation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  Орчуулга {showTranslation ? 'нуух' : 'харах'}
                </button>
              </div>

              {/* Passage Content Box */}
              <div className="space-y-6">
                <div className="p-6 sm:p-8 bg-bg-soft rounded-2xl border border-border-sub space-y-4">
                  {/* Chinese Passage */}
                  <p className="text-xl sm:text-2xl font-bold text-ink leading-relaxed text-justify tracking-wide selection:bg-indigo-100">
                    {exercise.passage}
                  </p>

                  {/* Pinyin helper */}
                  <AnimatePresence>
                    {showPinyin && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs sm:text-sm font-mono font-bold text-indigo-600 leading-relaxed text-justify overflow-hidden border-t border-dashed border-indigo-100 pt-3"
                      >
                        {exercise.pinyin}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* translation helper */}
                  <AnimatePresence>
                    {showTranslation && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm font-semibold text-ink/65 leading-relaxed text-justify overflow-hidden border-t border-dashed border-border-sub/60 pt-3"
                      >
                        Монголоор: {exercise.translation}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Interactive Multiple-Choice Quiz Block */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border-sub shadow-sm space-y-6">
            <div className="flex justify-between items-center text-xs sm:text-sm border-b border-border-sub pb-4">
              <span className="flex items-center gap-2 font-black text-indigo-600 uppercase tracking-widest">
                <HelpCircle className="w-5 h-5 text-indigo-500" /> Унших сорил {currentQuestionIdx + 1} / {exercise.quiz.length}
              </span>
              <div className="flex gap-1">
                {exercise.quiz.map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i < currentQuestionIdx 
                        ? 'bg-indigo-500' 
                        : i === currentQuestionIdx 
                          ? 'bg-indigo-300 animate-pulse' 
                          : 'bg-bg-soft border border-border-sub'
                    }`} 
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg sm:text-xl font-bold text-ink leading-tight">
                {currentQuestion.question}
              </h2>

              {/* Options Grid */}
              <div className="grid gap-3 sm:gap-4">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === currentQuestion.correct;
                  const isUserSelection = optIdx === selectedOptIdx;

                  let optionStyle = 'bg-bg-soft border-border-sub hover:border-indigo-200 hover:bg-indigo-50/10 text-ink/80';
                  let iconElement = null;

                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = 'bg-indigo-500 border-indigo-500 text-white font-extrabold';
                      iconElement = <Check className="w-5 h-5" />;
                    } else if (isUserSelection) {
                      optionStyle = 'bg-red-500 border-red-500 text-white font-extrabold';
                      iconElement = <X className="w-5 h-5" />;
                    } else {
                      optionStyle = 'bg-bg-soft border-border-sub opacity-50 text-ink/40';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleOptionClick(optIdx)}
                      className={`p-4 sm:p-5 rounded-xl border-2 text-left font-bold text-sm transition-all flex items-center justify-between ${optionStyle}`}
                    >
                      <span>{opt}</span>
                      {iconElement}
                    </button>
                  );
                })}
              </div>

              {/* Advance Button */}
              {isAnswered && (
                <motion.button 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleNextBtn}
                  className="w-full py-4 bg-ink text-white rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:opacity-90 transition-transform active:scale-95"
                >
                  {currentQuestionIdx < exercise.quiz.length - 1 ? 'Дараагийн асуулт' : 'Дуусгах'}
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </div>
        </React.Fragment>
      ) : (
        /* Final Celebration and Achievement Cards Screen */
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 sm:p-12 rounded-3xl border border-border-sub shadow-xl text-center space-y-8"
          id="reading-celebration-screen"
        >
          <div className="w-24 h-24 bg-indigo-50 text-indigo-550 rounded-full flex items-center justify-center mx-auto border-4 border-indigo-100">
            <CheckCircle2 className="w-14 h-14" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-ink">Дууслаа!</h2>
            <p className="text-lg text-indigo-600 font-extrabold flex items-center justify-center gap-2">
              +25 XP олсон 🎉
            </p>
            <p className="text-sm font-semibold text-muted max-w-md mx-auto leading-relaxed">
              Баяр хүргэе! Та энэхүү унших дасгалыг маш амжилттай бөглөж гүйцэтгэлээ. Таны ахисан амжилт амжилттай хадгалагдлаа.
            </p>
          </div>

          {/* XP summary info box */}
          <div className="bg-bg-soft p-5 rounded-2xl border border-slate-150 inline-grid grid-cols-2 gap-6 min-w-[280px]">
            <div>
              <div className="text-xs font-black text-ink/40 uppercase tracking-wider">Сорил зөв</div>
              <div className="text-xl font-mono font-black text-ink">{(earnedXp/15)} / 3 асуулт</div>
            </div>
            <div>
              <div className="text-xs font-black text-ink/40 uppercase tracking-wider">Нийт олсон</div>
              <div className="text-xl font-mono font-black text-indigo-600">+{earnedXp + 25} XP</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <button 
              onClick={() => navigate('/reading')}
              className="px-6 py-4 bg-indigo-500 text-white rounded-xl font-extrabold text-sm sm:text-base border border-indigo-600 shadow-md shadow-indigo-100 hover:bg-indigo-600 transition-all min-w-[180px]"
            >
              Буцах
            </button>
            <button 
              onClick={() => {
                setQuizFinished(false);
                setCurrentQuestionIdx(0);
                setSelectedOptIdx(null);
                setIsAnswered(false);
                setEarnedXp(0);
              }}
              className="px-6 py-4 bg-bg-soft text-ink rounded-xl font-extrabold text-sm sm:text-base border border-border-sub hover:bg-slate-100 transition-all min-w-[180px]"
            >
              Дахин оролдох
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
