import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Info, HelpCircle, Check, X, Award, MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';
import { addXp, completeGrammarLesson } from '../lib/db';
import grammarData from '../data/grammar.json';
import toast from 'react-hot-toast';

interface Example {
  chinese: string;
  pinyin: string;
  mongolian: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface GrammarPattern {
  id: string;
  title: string;
  pattern: string;
  explanation: string;
  examples: Example[];
  quiz: QuizQuestion[];
}

export default function GrammarLessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();

  const [pattern, setPattern] = useState<GrammarPattern | null>(null);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    // Find the pattern by ID across all levels
    let foundPattern: GrammarPattern | null = null;
    for (const level of Object.values(grammarData)) {
      const match = level.find((p: any) => p.id === id);
      if (match) {
        foundPattern = match as GrammarPattern;
        break;
      }
    }

    if (foundPattern) {
      setPattern(foundPattern);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div className="space-y-2">
          <h2 className="text-xl font-black text-ink">Ачааллаж байна...</h2>
          <p className="text-ink/60 font-medium">Хичээлийн агуулгыг бэлдэж байна.</p>
        </div>
      </div>
    );
  }

  if (!pattern) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="text-5xl">⚠️</div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-ink">Хичээл олдсонгүй</h2>
          <p className="text-ink/60 font-medium">Уучлаарай, ийм дүрмийн хичээл байхгүй байна.</p>
        </div>
        <button
          onClick={() => navigate('/grammar')}
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold"
        >
          Жагсаалт руу буцах
        </button>
      </div>
    );
  }

  // Parse HSK level number from ID
  const hskMatch = pattern.id.match(/hsk(\d)_/i);
  const levelNumber = hskMatch ? parseInt(hskMatch[1], 10) : 1;

  const handleOptionClick = async (idx: number) => {
    if (isAnswered) return;
    setSelectedOptIdx(idx);
    setIsAnswered(true);

    const question = pattern.quiz[currentQuestionIdx];
    const isCorrect = idx === question.correct;

    if (isCorrect) {
      setEarnedXp(prev => prev + 10);
      toast.success('+10 XP оноо шууд авлаа! 🎉', { id: 'quiz-success' });
      if (profile?.uid) {
        await addXp(profile.uid, 10);
      }
    } else {
      toast.error('Буруу хариуллаа, зөв хариултыг зааж өглөө.', { id: 'quiz-error' });
    }
  };

  const handleNextBtn = async () => {
    setSelectedOptIdx(null);
    setIsAnswered(false);

    if (currentQuestionIdx < pattern.quiz.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Quiz completed!
      setSavingProgress(true);
      try {
        if (profile?.uid) {
          // completeGrammarLesson returns updated progress percentage
          // It also awards the ultimate +20 XP internally
          await completeGrammarLesson(profile.uid, levelNumber, pattern.id);
          await refreshProfile();
        }
      } catch (e) {
        console.error('Failed to notify database about grammar lesson completion:', e);
      } finally {
        setSavingProgress(false);
        setQuizFinished(true);
      }
    }
  };

  const currentQuestion = pattern.quiz[currentQuestionIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12" id="grammar-lesson-container">
      {/* Back Button and Progress Indicator */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/grammar')} 
          className="flex items-center gap-3 text-sm font-black text-muted hover:text-emerald-500 transition-colors uppercase tracking-widest group"
          id="lesson-back-btn"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-border-sub flex items-center justify-center group-hover:border-emerald-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Жагсаалт руу
        </button>
        <div className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
          Хэл зүй • HSK {levelNumber}
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
            {/* Header Box with highlighted Title & Structure Formula code-block */}
            <div className="bg-emerald-500 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="space-y-4 relative z-10">
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  Дүрмийн бүтэц
                </span>
                <h1 className="text-2xl sm:text-3xl font-black">{pattern.title}</h1>
                
                {/* Structural Formula highlighted Box */}
                <div className="bg-black/15 border border-white/20 p-4 rounded-xl font-mono text-base sm:text-lg text-emerald-100 font-bold tracking-wide">
                  Бүтэц хувилбар: <span className="text-white bg-emerald-600 px-2 py-0.5 rounded ml-1">{pattern.pattern}</span>
                </div>
              </div>
            </div>

            {/* Mongolian explanation and Examples */}
            <div className="p-6 sm:p-10 space-y-8">
              {/* Mongolian explanation */}
              <div className="space-y-3">
                <h3 className="text-md font-black text-ink uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-5 h-5 text-emerald-500" /> Дүрмийн тайлбар
                </h3>
                <p className="text-base sm:text-lg text-ink/80 leading-relaxed font-semibold bg-bg-soft p-5 border border-border-sub rounded-2xl">
                  {pattern.explanation}
                </p>
              </div>

              {/* Example Sentences */}
              <div className="space-y-4">
                <h3 className="text-md font-black text-ink uppercase tracking-wider">
                  Жишээ өгүүлбэрүүд
                </h3>
                <div className="grid gap-4">
                  {pattern.examples.map((ex, idx) => (
                    <div 
                      key={idx} 
                      className="p-5 bg-white border border-border-sub rounded-2xl hover:border-emerald-250 transition-colors space-y-2 relative"
                    >
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold font-mono">
                        {idx + 1}
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-ink">
                        {ex.chinese}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-emerald-600 font-mono">
                        {ex.pinyin}
                      </div>
                      <div className="text-sm text-ink/60 font-semibold pt-1">
                        Монголоор: {ex.mongolian}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Interactive Multiple-Choice Quiz Block */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border-sub shadow-sm space-y-6">
            <div className="flex justify-between items-center text-xs sm:text-sm border-b border-border-sub pb-4">
              <span className="flex items-center gap-2 font-black text-emerald-550 uppercase tracking-widest">
                <HelpCircle className="w-5 h-5 text-emerald-500" /> Сэдэвчилсэн сорил {currentQuestionIdx + 1} / {pattern.quiz.length}
              </span>
              <div className="flex gap-1">
                {pattern.quiz.map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i < currentQuestionIdx 
                        ? 'bg-emerald-500' 
                        : i === currentQuestionIdx 
                          ? 'bg-emerald-300 animate-pulse' 
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

                  let optionStyle = 'bg-bg-soft border-border-sub hover:border-emerald-200 hover:bg-emerald-50/10 text-ink/80';
                  let iconElement = null;

                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-500 border-emerald-500 text-white font-extrabold';
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
                  {currentQuestionIdx < pattern.quiz.length - 1 ? 'Дараагийн асуулт' : 'Дуусгах'}
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
          id="grammar-celebration-screen"
        >
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100">
            <CheckCircle2 className="w-14 h-14" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-ink">Хичээл дууслаа!</h2>
            <p className="text-lg text-emerald-600 font-extrabold flex items-center justify-center gap-2">
              +20 XP олсон 🎉
            </p>
            <p className="text-sm font-semibold text-muted max-w-md mx-auto leading-relaxed">
              Баяр хүргэе! Та энэхүү хэл зүйн дүрмийг амжилттай судалж, дүрмийн сорилыг амжилттай бөглөж дууслаа. Таны амжилт системд хадгалагдсан.
            </p>
          </div>

          {/* XP summary info box */}
          <div className="bg-bg-soft p-5 rounded-2xl border border-slate-150 inline-grid grid-cols-2 gap-6 min-w-[280px]">
            <div>
              <div className="text-xs font-black text-ink/40 uppercase tracking-wider">Сорил зөв</div>
              <div className="text-xl font-mono font-black text-ink">{(earnedXp/10)} / 3 асуулт</div>
            </div>
            <div>
              <div className="text-xs font-black text-ink/40 uppercase tracking-wider">Нийт олсон</div>
              <div className="text-xl font-mono font-black text-emerald-600">+{earnedXp + 20} XP</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <button 
              onClick={() => navigate('/grammar')}
              className="px-6 py-4 bg-emerald-500 text-white rounded-xl font-extrabold text-sm sm:text-base border border-emerald-600 shadow-md shadow-emerald-100 hover:bg-emerald-600 transition-all min-w-[180px]"
            >
              Буцах
            </button>
            <button 
              onClick={() => {
                setQuizMode(false);
                setQuizFinished(false);
                setCurrentQuestionIdx(0);
                setSelectedOptIdx(null);
                setIsAnswered(false);
                setEarnedXp(0);
              }}
              className="px-6 py-4 bg-bg-soft text-ink rounded-xl font-extrabold text-sm sm:text-base border border-border-sub hover:bg-slate-100 transition-all min-w-[180px]"
            >
              Дахин сорих
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
