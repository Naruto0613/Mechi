import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, BookOpen, CheckCircle2, RotateCcw, ChevronRight } from 'lucide-react';
import { addXp, updateHSKProgress } from '../lib/db';
import toast from 'react-hot-toast';

interface ReadingExercise {
  title: string;
  chineseText: string;
  translation: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

import lessonsData from '../data/lessons.json';

export default function ReadingPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<ReadingExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const fetchExercise = () => {
    setLoading(true);
    const levelKey = `HSK${profile?.selectedLevel || 1}`;
    const levelExercises = (lessonsData as any)[levelKey]?.reading || [];
    const randomEx = levelExercises[Math.floor(Math.random() * levelExercises.length)];
    
    setExercise(randomEx || null);
    setComplete(false);
    setCurrentQuestion(0);
    setCorrectCount(0);
    setSelected(null);
    setShowTranslation(false);
    setLoading(false);
  };

  useEffect(() => {
    if (profile) fetchExercise();
  }, [profile?.selectedLevel]);

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
            readingCompleted: 100
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
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-ink">Унших дасгал бэлдэж байна...</h2>
          <p className="text-ink/60 font-medium">Gemini AI танд зориулж унших текст боловсруулж байна.</p>
        </div>
      </div>
    );
  }

  if (!exercise) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 text-sm font-black text-muted hover:text-purple-500 transition-colors uppercase tracking-widest group">
          <div className="w-10 h-10 rounded-full bg-white border border-border-sub flex items-center justify-center group-hover:border-purple-500">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Буцах
        </button>
        <div className="px-6 py-2 bg-purple-50 text-purple-600 rounded-full text-xs font-black uppercase tracking-widest border border-purple-100">
          Унших • HSK {profile?.selectedLevel}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] sm:rounded-[40px] border border-border-sub shadow-xl overflow-hidden">
        <div className="p-5 sm:p-12 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <h1 className="text-xl sm:text-3xl font-black text-ink tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-purple-500 shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span>{exercise.title}</span>
            </h1>
            <button 
              onClick={() => setShowTranslation(!showTranslation)}
              className="text-left text-xs font-black text-purple-500 uppercase tracking-widest hover:underline shrink-0"
            >
              {showTranslation ? 'Орчуулгыг нуух' : 'Орчуулгыг харах'}
            </button>
          </div>

          <div className="space-y-6">
            <div className="p-5 sm:p-10 bg-bg-soft rounded-[2rem] border border-border-sub relative group">
              <p className="text-xl sm:text-3xl font-bold text-ink leading-relaxed text-left sm:text-justify break-words">
                {exercise.chineseText}
              </p>
              
              <AnimatePresence>
                {showTranslation && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border-sub"
                  >
                    <p className="text-base sm:text-lg text-ink/60 leading-relaxed font-semibold">
                      {exercise.translation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        {!complete ? (
          <motion.div 
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 sm:p-12 rounded-[2rem] sm:rounded-[40px] border border-border-sub shadow-xl space-y-6 sm:space-y-8"
          >
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-purple-500 font-black uppercase tracking-widest">Асуулт {currentQuestion + 1} / {exercise.questions.length}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-ink leading-tight">{exercise.questions[currentQuestion].question}</h2>
            <div className="grid gap-3 sm:gap-4">
              {exercise.questions[currentQuestion].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 text-left font-bold transition-all text-sm sm:text-base ${
                    selected === i 
                      ? (i === exercise.questions[currentQuestion].correctAnswer ? 'bg-purple-500 border-purple-500 text-white' : 'bg-red-500 border-red-500 text-white')
                      : (selected !== null && i === exercise.questions[currentQuestion].correctAnswer ? 'bg-purple-50 border-purple-500 text-purple-600' : 'bg-bg-soft border-border-sub hover:border-purple-200 hover:bg-white')
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {selected !== null && (
              <button 
                onClick={nextQuestion}
                className="w-full py-4 sm:py-5 bg-ink text-white rounded-2xl font-black text-sm sm:text-lg mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-3 transition-transform active:scale-95 animate-fade-in"
              >
                Дараагийнх <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 sm:p-16 rounded-[2rem] sm:rounded-[48px] border border-border-sub shadow-2xl text-center space-y-6 sm:space-y-10"
          >
            <div className="w-20 h-20 sm:w-32 sm:h-32 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-purple-500">
              <CheckCircle2 className="w-10 h-10 sm:w-16 sm:h-16" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-4xl font-black text-ink">Унших чадвар +1</h2>
              <p className="text-base sm:text-xl text-muted font-semibold">Дасгалыг амжилттай дуусгалаа. {correctCount}/{exercise.questions.length} зөв.</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full py-4 bg-purple-500 text-white rounded-2xl font-black text-sm sm:text-lg shadow-lg hover:opacity-90 transition-all"
              >
                Дашборд руу буцах
              </button>
              <button 
                onClick={fetchExercise}
                className="w-full py-4 bg-white border border-border-sub rounded-2xl font-black text-sm sm:text-lg text-ink hover:bg-bg-soft flex items-center justify-center gap-2 sm:gap-3 transition-all"
              >
                Өөр текст унших <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
