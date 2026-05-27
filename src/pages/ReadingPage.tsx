import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle2, BookOpen, Award, ArrowRight } from 'lucide-react';
import { getCompletedReadingLessons } from '../lib/db';
import readingData from '../data/reading.json';

interface ReadingExercise {
  id: string;
  title: string;
  difficulty: string;
}

export default function ReadingPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const levelKey = `HSK${profile?.selectedLevel || 1}` as keyof typeof readingData;
  const currentExercises = (readingData[levelKey] || []) as ReadingExercise[];

  useEffect(() => {
    if (profile?.uid) {
      setLoading(true);
      getCompletedReadingLessons(profile.uid)
        .then((ids) => {
          setCompletedIds(ids);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [profile?.uid, profile?.selectedLevel]);

  // Calculate completed count for the current HSK level
  const completedForLevel = currentExercises.filter(ex => completedIds.includes(ex.id)).length;
  const totalForLevel = currentExercises.length || 10;
  const progressPercent = Math.min(100, Math.round((completedForLevel / totalForLevel) * 100));

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <div className="space-y-2">
          <h2 className="text-xl font-black text-ink">Ачааллаж байна...</h2>
          <p className="text-ink/60 font-medium">Унших дасгалуудыг бэлдэж байна.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12" id="reading-page-container">
      {/* Back Button and Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-3 text-sm font-black text-muted hover:text-indigo-500 transition-colors uppercase tracking-widest group"
          id="reading-back-btn"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-border-sub flex items-center justify-center group-hover:border-indigo-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Буцах
        </button>
        <div className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100">
          Унших • HSK {profile?.selectedLevel || 1}
        </div>
      </div>

      {/* Progress Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-border-sub p-6 sm:p-10 shadow-sm relative overflow-hidden"
        id="reading-progress-header"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="space-y-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              HSK {profile?.selectedLevel || 1} — Унших дасгалууд
            </h1>
            <p className="text-ink/60 font-semibold text-sm sm:text-base leading-relaxed">
              Үгийн сангаа тэлж, унших хурд болон ойлгох чадвараа ахиулах {totalForLevel} богино хэмжээний текстүүд. Текстийг уншиж дуусгаад асуултуудад хариулж оноо цуглуулаарай.
            </p>
          </div>

          <div className="space-y-3 bg-bg-soft p-4 sm:p-6 rounded-2xl border border-border-sub">
            <div className="flex justify-between items-center text-xs sm:text-sm font-black text-ink/70">
              <span className="flex items-center gap-2 uppercase tracking-wider">
                <Award className="w-4 h-4 text-indigo-500" /> Таны унших амжилт
              </span>
              <span>{completedForLevel} / {totalForLevel} дуусгасан ({progressPercent}%)</span>
            </div>
            
            <div className="w-full h-3 bg-white border border-border-sub rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-indigo-500" 
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Exercises Cards List */}
      <div className="grid md:grid-cols-2 gap-4" id="reading-exercises-list">
        {currentExercises.map((exercise, index) => {
          const isCompleted = completedIds.includes(exercise.id);
          
          let difficultyColor = "bg-green-50 text-green-700 border-green-100";
          if (exercise.difficulty === "Дунд") {
            difficultyColor = "bg-amber-50 text-amber-700 border-amber-100";
          } else if (exercise.difficulty === "Хэцүү") {
            difficultyColor = "bg-rose-50 text-rose-700 border-rose-100";
          }

          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all ${
                isCompleted 
                  ? 'border-indigo-200 shadow-sm shadow-indigo-50 bg-indigo-50/5' 
                  : 'border-border-sub hover:border-slate-300'
              }`}
              id={`reading-card-${exercise.id}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                      isCompleted 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'bg-bg-soft text-ink/50'
                    }`}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    {isCompleted && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-200">
                        <CheckCircle2 className="w-3 h-3" /> Дууссан
                      </span>
                    )}
                  </div>
                  
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${difficultyColor}`}>
                    {exercise.difficulty}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-ink flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                    {exercise.title}
                  </h3>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate(`/reading/${exercise.id}`)}
                className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
                  isCompleted
                    ? 'bg-bg-soft text-ink/70 border border-border-sub hover:bg-slate-150'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-100 hover:scale-[1.01] active:scale-95'
                }`}
              >
                {isCompleted ? 'Дахин унших' : 'Унших'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
