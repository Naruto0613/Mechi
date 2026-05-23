import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Brain, Send, CheckCircle2, RotateCcw, ChevronRight } from 'lucide-react';
import { addXp, updateHSKProgress } from '../lib/db';
import toast from 'react-hot-toast';

interface GrammarLesson {
  title: string;
  explanation: string;
  examples: { ch: string; pinyin: string; mn: string }[];
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

import lessonsData from '../data/lessons.json';

export default function GrammarPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [complete, setComplete] = useState(false);

  const fetchLesson = () => {
    setLoading(true);
    const levelKey = `HSK${profile?.selectedLevel || 1}`;
    const levelLessons = (lessonsData as any)[levelKey]?.grammar || [];
    const randomLesson = levelLessons[Math.floor(Math.random() * levelLessons.length)];
    
    setLesson(randomLesson || null);
    setQuizMode(false);
    setComplete(false);
    setCurrentQuestion(0);
    setCorrectCount(0);
    setSelected(null);
    setLoading(false);
  };

  useEffect(() => {
    if (profile) fetchLesson();
  }, [profile?.selectedLevel]);

  const handleAnswer = async (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === lesson?.quiz[currentQuestion].correctAnswer;
    if (isCorrect) setCorrectCount(prev => prev + 1);
  };

  const nextQuestion = async () => {
    if (currentQuestion < (lesson?.quiz.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelected(null);
    } else {
      setComplete(true);
      if (correctCount + (selected === lesson?.quiz[currentQuestion].correctAnswer ? 1 : 0) === lesson?.quiz.length) {
        if (profile) {
          await addXp(profile.uid, 20);
          await updateHSKProgress(profile.uid, profile.selectedLevel, {
            grammarCompleted: 100 // Simplified for one lesson
          });
          toast.success('+20 XP олсон!', { icon: '💰' });
          refreshProfile();
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-ink">Хичээл бэлдэж байна...</h2>
          <p className="text-ink/60 font-medium">Gemini AI танд зориулж дүрэм боловсруулж байна.</p>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 text-sm font-black text-muted hover:text-emerald-500 transition-colors uppercase tracking-widest group">
          <div className="w-10 h-10 rounded-full bg-white border border-border-sub flex items-center justify-center group-hover:border-emerald-500">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Буцах
        </button>
        <div className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
          Хэл зүй • HSK {profile?.selectedLevel}
        </div>
      </div>

      {!quizMode ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] sm:rounded-[40px] border border-border-sub shadow-xl overflow-hidden"
        >
          <div className="bg-emerald-500 p-6 sm:p-12 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <h1 className="text-2xl sm:text-4xl font-black relative z-10">{lesson.title}</h1>
          </div>
          
          <div className="p-5 sm:p-12 space-y-8 sm:space-y-10">
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-black text-ink flex items-center gap-2">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" /> Тайлбар
              </h3>
              <p className="text-base sm:text-lg text-ink/80 leading-relaxed font-semibold bg-bg-soft p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border-sub">
                {lesson.explanation}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-black text-ink">Жишээ өгүүлбэрүүд</h3>
              <div className="grid gap-3 sm:gap-4">
                {lesson.examples.map((ex, i) => (
                  <div key={i} className="p-4 sm:p-6 bg-white border border-border-sub rounded-2xl sm:rounded-3xl space-y-1.5 sm:space-y-2 hover:border-emerald-200 transition-colors">
                    <div className="text-xl sm:text-2xl font-bold text-ink">{ex.ch}</div>
                    <div className="text-xs sm:text-sm font-medium text-emerald-600">{ex.pinyin}</div>
                    <div className="text-sm text-ink/60">{ex.mn}</div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setQuizMode(true)}
              className="w-full py-4 sm:py-6 bg-emerald-500 text-white rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Мэдлэгээ шалгах <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-8">
          {!complete ? (
            <motion.div 
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-5 sm:p-12 rounded-[2rem] sm:rounded-[40px] border border-border-sub shadow-xl space-y-6 sm:space-y-8"
            >
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-emerald-500 font-black uppercase tracking-widest">Асуулт {currentQuestion + 1} / {lesson.quiz.length}</span>
                <div className="flex gap-1">
                  {[...Array(lesson.quiz.length)].map((_, i) => (
                    <div key={i} className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${i < currentQuestion ? 'bg-emerald-500' : (i === currentQuestion ? 'bg-emerald-200' : 'bg-bg-soft')}`} />
                  ))}
                </div>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-ink leading-tight">{lesson.quiz[currentQuestion].question}</h2>
              <div className="grid gap-3 sm:gap-4">
                {lesson.quiz[currentQuestion].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 text-left font-bold transition-all relative overflow-hidden text-sm sm:text-base ${
                      selected === i 
                        ? (i === lesson.quiz[currentQuestion].correctAnswer ? 'bg-emerald-500 border-emerald-500 text-white scale-[1.02]' : 'bg-red-500 border-red-500 text-white')
                        : (selected !== null && i === lesson.quiz[currentQuestion].correctAnswer ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-bg-soft border-border-sub hover:border-emerald-200 hover:bg-white')
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {selected !== null && (
                <button 
                  onClick={nextQuestion}
                  className="w-full py-4 sm:py-5 bg-ink text-white rounded-2xl font-black text-sm sm:text-lg mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-3 transition-transform active:scale-95"
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
              <div className="w-20 h-20 sm:w-32 sm:h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle2 className="w-10 h-10 sm:w-16 sm:h-16" />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-2xl sm:text-4xl font-black text-ink">Мөнх бахармаар!</h2>
                <p className="text-base sm:text-xl text-muted font-semibold">Та {lesson.quiz.length} асуултаас {correctCount}-ыг зөв хариуллаа.</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm sm:text-lg shadow-lg shadow-emerald-100 hover:opacity-90 transition-all"
                >
                  Дашборд руу буцах
                </button>
                <button 
                  onClick={fetchLesson}
                  className="w-full py-4 bg-white border border-border-sub rounded-2xl font-black text-sm sm:text-lg text-ink hover:bg-bg-soft flex items-center justify-center gap-2 sm:gap-3 transition-all"
                >
                  Өөр хичээл авах <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
