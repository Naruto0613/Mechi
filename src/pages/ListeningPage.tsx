import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Headset, Volume2, CheckCircle2, RotateCcw, Play, Pause } from 'lucide-react';
import { addXp, updateHSKProgress } from '../lib/db';
import toast from 'react-hot-toast';

interface ListeningExercise {
  chineseText: string;
  pinyin: string;
  translation: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

import lessonsData from '../data/lessons.json';

export default function ListeningPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<ListeningExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showScript, setShowScript] = useState(false);

  const fetchExercise = () => {
    setLoading(true);
    const levelKey = `HSK${profile?.selectedLevel || 1}`;
    const levelExercises = (lessonsData as any)[levelKey]?.listening || [];
    const randomEx = levelExercises[Math.floor(Math.random() * levelExercises.length)];
    
    setExercise(randomEx || null);
    setComplete(false);
    setCurrentQuestion(0);
    setCorrectCount(0);
    setSelected(null);
    setShowScript(false);
    setLoading(false);
  };

  useEffect(() => {
    if (profile) fetchExercise();
  }, [profile?.selectedLevel]);

  const speak = () => {
    if (!exercise) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(exercise.chineseText);
    utterance.lang = 'zh-CN';
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === exercise?.questions[currentQuestion].correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestion < (exercise?.questions.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelected(null);
    } else {
      setComplete(true);
      if (correctCount + (selected === exercise?.questions[currentQuestion].correctAnswer ? 1 : 0) === exercise?.questions.length) {
        if (profile) {
          await addXp(profile.uid, 15);
          await updateHSKProgress(profile.uid, profile.selectedLevel, {
            listeningCompleted: 100
          });
          toast.success('+15 XP олсон!', { icon: '💰' });
          refreshProfile();
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-ink">Сонсгол бэлдэж байна...</h2>
          <p className="text-ink/60 font-medium">Gemini AI танд зориулж сонсголын дасгал боловсруулж байна.</p>
        </div>
      </div>
    );
  }

  if (!exercise) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 text-sm font-black text-muted hover:text-blue-500 transition-colors uppercase tracking-widest group">
          <div className="w-10 h-10 rounded-full bg-white border border-border-sub flex items-center justify-center group-hover:border-blue-500">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Буцах
        </button>
        <div className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
          Сонсгол • HSK {profile?.selectedLevel}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-5 sm:p-12 rounded-[2rem] sm:rounded-[40px] border border-border-sub shadow-xl flex flex-col items-center text-center gap-6 sm:gap-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-100">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: isPlaying ? '100%' : '0%' }} />
            </div>
            
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-blue-500 text-white animate-pulse' : 'bg-blue-50 text-blue-500'}`}>
              <Headset className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <div className="space-y-3 sm:space-y-4 text-center">
              <div className="p-3 sm:p-4 bg-bg-soft rounded-2xl border border-border-sub h-20 sm:h-24 flex items-center justify-center">
                <p className="text-lg sm:text-xl font-bold text-ink/40 italic">
                  {isPlaying ? 'Сонсож байна...' : 'Сонсоход бэлэн'}
                </p>
              </div>
              <p className="text-ink/60 font-semibold text-xs sm:text-base">Дээрх товчийг дарж текстийг сонсоод асуултад хариулна уу.</p>
            </div>

            <button 
              onClick={speak}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${isPlaying ? 'bg-white text-blue-500 border-2 border-blue-500' : 'bg-blue-500 text-white'}`}
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>

            <button 
              onClick={() => setShowScript(!showScript)}
              className="text-xs font-black text-blue-500 uppercase tracking-widest hover:underline"
            >
              {showScript ? 'Текстийг нуух' : 'Текстийг харах'}
            </button>

            <AnimatePresence>
              {showScript && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden w-full"
                >
                  <div className="p-4 sm:p-6 bg-blue-50 rounded-2xl sm:rounded-3xl space-y-2 text-left">
                    <p className="text-lg sm:text-xl font-bold text-ink">{exercise.chineseText}</p>
                    <p className="text-xs sm:text-sm font-medium text-blue-600 italic">{exercise.pinyin}</p>
                    <p className="text-xs sm:text-sm text-ink/60">{exercise.translation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {!complete ? (
            <motion.div 
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-5 sm:p-12 rounded-[2rem] sm:rounded-[40px] border border-border-sub shadow-xl space-y-6 sm:space-y-8"
            >
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-blue-500 font-black uppercase tracking-widest text-xs sm:text-sm">Асуулт {currentQuestion + 1} / {exercise.questions.length}</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-ink leading-tight">{exercise.questions[currentQuestion].question}</h2>
              <div className="grid gap-3 sm:gap-4">
                {exercise.questions[currentQuestion].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 text-left font-bold transition-all text-sm sm:text-base ${
                      selected === i 
                        ? (i === exercise.questions[currentQuestion].correctAnswer ? 'bg-blue-500 border-blue-500 text-white' : 'bg-red-500 border-red-500 text-white')
                        : (selected !== null && i === exercise.questions[currentQuestion].correctAnswer ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-bg-soft border-border-sub hover:border-blue-200 hover:bg-white')
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {selected !== null && (
                <button 
                  onClick={nextQuestion}
                  className="w-full py-4 sm:py-5 bg-ink text-white rounded-2xl font-black text-sm sm:text-lg mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-3 active:scale-95 transition-all"
                >
                  Дараагийнх
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-6 sm:p-16 rounded-[2rem] sm:rounded-[48px] border border-border-sub shadow-2xl text-center space-y-6 sm:space-y-10"
            >
              <div className="w-20 h-20 sm:w-32 sm:h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500">
                <CheckCircle2 className="w-10 h-10 sm:w-16 sm:h-16" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-ink tracking-tight">Сайн байна!</h2>
              <p className="text-base sm:text-xl text-muted font-semibold">Сонсголын дасгалыг амжилттай дуусгалаа.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black text-sm sm:text-lg shadow-lg"
                >
                  Дашборд руу буцах
                </button>
                <button 
                  onClick={fetchExercise}
                  className="w-full py-4 bg-white border border-border-sub rounded-2xl font-black text-sm sm:text-lg text-ink hover:bg-bg-soft flex items-center justify-center gap-2 sm:gap-3 transition-all"
                >
                  Дахин оролдох <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
