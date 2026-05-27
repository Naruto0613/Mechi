import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Headphones, Play, Pause, AlertCircle, HelpCircle, Check, X, CheckCircle2, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { addXp, completeListeningLesson } from '../lib/db';
import listeningData from '../data/listening.json';
import toast from 'react-hot-toast';

interface DialogueLine {
  speaker: string;
  chinese: string;
  pinyin: string;
  mongolian: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface ListeningExercise {
  id: string;
  title: string;
  difficulty: string;
  dialogue: DialogueLine[];
  quiz: QuizQuestion[];
}

export default function ListeningLessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();

  const [exercise, setExercise] = useState<ListeningExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showScript, setShowScript] = useState(false);

  // Quiz state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    // Find the exercise by ID across all levels
    let foundEx: ListeningExercise | null = null;
    for (const level of Object.values(listeningData)) {
      const match = level.find((e: any) => e.id === id);
      if (match) {
        foundEx = match as ListeningExercise;
        break;
      }
    }

    if (foundEx) {
      setExercise(foundEx);
    }
    setLoading(false);
  }, [id]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="space-y-2">
          <h2 className="text-xl font-black text-ink">Ачааллаж байна...</h2>
          <p className="text-ink/60 font-medium">Сонсголын дасгалыг бэлдэж байна.</p>
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
          <p className="text-ink/60 font-medium font-semibold">Уучлаарай, ийм сонсголын дасгал байхгүй байна.</p>
        </div>
        <button
          onClick={() => navigate('/listening')}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold"
        >
          Жагсаалт руу буцах
        </button>
      </div>
    );
  }

  // Parse HSK level number from ID
  const hskMatch = exercise.id.match(/hsk(\d)_/i);
  const levelNumber = hskMatch ? parseInt(hskMatch[1], 10) : 1;

  // Speak dialogue text
  const speakDialogue = () => {
    window.speechSynthesis.cancel();
    
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    // Build speech text from all lines
    const textToSpeak = exercise.dialogue.map(line => line.chinese).join(' ... ');
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'zh-CN';
    // Slightly slower rate for easier HSK levels
    utterance.rate = levelNumber <= 2 ? 0.75 : 0.90;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

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
          // completeListeningLesson saves to progress subcollection and awards +30 XP completion bonus
          await completeListeningLesson(profile.uid, levelNumber, exercise.id);
          await refreshProfile();
        }
      } catch (e) {
        console.error('Failed to notify database about listening completion:', e);
      } finally {
        setSavingProgress(false);
        setQuizFinished(true);
        window.speechSynthesis.cancel();
      }
    }
  };

  const currentQuestion = exercise.quiz[currentQuestionIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12" id="listening-lesson-container">
      {/* Back Button and Progress Indicator */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/listening')} 
          className="flex items-center gap-3 text-sm font-black text-muted hover:text-blue-500 transition-colors uppercase tracking-widest group"
          id="lesson-back-btn"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-border-sub flex items-center justify-center group-hover:border-blue-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Жагсаалт руу
        </button>
        <div className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
          Сонсгол • HSK {levelNumber}
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
            <div className="bg-blue-500 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="space-y-4 relative z-10">
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  Сонсох дасгал
                </span>
                <h1 className="text-2xl sm:text-3xl font-black">{exercise.title}</h1>
              </div>
            </div>

            {/* Spearker Audio Area */}
            <div className="p-6 sm:p-10 space-y-8 flex flex-col items-center">
              <div className="w-full max-w-md bg-bg-soft border border-border-sub p-6 rounded-2xl flex flex-col items-center gap-6 relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-100 rounded-t-2xl overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: isPlaying ? '100%' : '0%' }} />
                </div>

                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-blue-500 text-white animate-pulse' : 'bg-blue-50 text-blue-500 border border-blue-100'}`}>
                  <Headphones className="w-8 h-8" />
                </div>

                <div className="text-center space-y-1">
                  <p className="text-sm font-black text-ink">{isPlaying ? 'Харилцан яриаг сонсож байна...' : 'Сонсоход бэлэн'}</p>
                  <p className="text-xs text-ink/50 font-semibold">Хятад хэллэгийг сонсоод доорх асуултанд хариулна уу.</p>
                </div>

                <button 
                  onClick={speakDialogue}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 ${isPlaying ? 'bg-white text-blue-500 border-2 border-blue-500' : 'bg-blue-500 text-white'}`}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>

                <button 
                  onClick={() => setShowScript(!showScript)}
                  className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1.5 mt-2"
                >
                  {showScript ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showScript ? 'Тэктсийг нуух' : 'Текстийг ил гаргах'}
                </button>
              </div>

              {/* Dialogue Transcript lines block */}
              <AnimatePresence>
                {showScript && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full space-y-4 overflow-hidden pt-4"
                  >
                    <h3 className="text-sm font-black text-ink uppercase tracking-wider">Харилцан ярианы хэсэг</h3>
                    <div className="space-y-3">
                      {exercise.dialogue.map((line, idx) => (
                        <div key={idx} className="p-4 bg-bg-soft border border-border-sub rounded-xl space-y-1">
                          <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                            Яригч {line.speaker}
                          </span>
                          <p className="text-lg font-bold text-ink pt-1">{line.chinese}</p>
                          <p className="text-xs font-mono font-bold text-blue-600">{line.pinyin}</p>
                          <p className="text-xs text-ink/60 font-semibold pt-1 border-t border-border-sub/40">Орчуулга: {line.mongolian}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Interactive Multiple-Choice Quiz Block */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border-sub shadow-sm space-y-6">
            <div className="flex justify-between items-center text-xs sm:text-sm border-b border-border-sub pb-4">
              <span className="flex items-center gap-2 font-black text-blue-600 uppercase tracking-widest">
                <HelpCircle className="w-5 h-5 text-blue-500" /> Сонсголын сорил {currentQuestionIdx + 1} / {exercise.quiz.length}
              </span>
              <div className="flex gap-1">
                {exercise.quiz.map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i < currentQuestionIdx 
                        ? 'bg-blue-500' 
                        : i === currentQuestionIdx 
                          ? 'bg-blue-300 animate-pulse' 
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

                  let optionStyle = 'bg-bg-soft border-border-sub hover:border-blue-200 hover:bg-blue-50/10 text-ink/80';
                  let iconElement = null;

                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = 'bg-blue-500 border-blue-500 text-white font-extrabold';
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
          id="listening-celebration-screen"
        >
          <div className="w-24 h-24 bg-blue-50 text-blue-550 rounded-full flex items-center justify-center mx-auto border-4 border-blue-100">
            <CheckCircle2 className="w-14 h-14" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-ink">Дууслаа!</h2>
            <p className="text-lg text-blue-600 font-extrabold flex items-center justify-center gap-2">
              +30 XP олсон 🎉
            </p>
            <p className="text-sm font-semibold text-muted max-w-md mx-auto leading-relaxed">
              Баяр хүргэе! Та энэхүү сонсголын дасгалыг амжилттай бөглөж гүйцэтгэлээ. Таны арилжсан амжилт амжилттай хадгалагдлаа.
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
              <div className="text-xl font-mono font-black text-blue-600">+{earnedXp + 30} XP</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <button 
              onClick={() => navigate('/listening')}
              className="px-6 py-4 bg-blue-500 text-white rounded-xl font-extrabold text-sm sm:text-base border border-blue-600 shadow-md shadow-blue-100 hover:bg-blue-600 transition-all min-w-[180px]"
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
