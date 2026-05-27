import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle2, Headphones, Play, Award, ArrowRight } from 'lucide-react';
import { getCompletedListeningLessons } from '../lib/db';
import listeningData from '../data/listening.json';

interface ListeningExercise {
  id: string;
  title: string;
  difficulty: string;
}

export default function ListeningPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const levelKey = `HSK${profile?.selectedLevel || 1}` as keyof typeof listeningData;
  const currentExercises = (listeningData[levelKey] || []) as ListeningExercise[];

  useEffect(() => {
    if (profile?.uid) {
      setLoading(true);
      getCompletedListeningLessons(profile.uid)
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
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="space-y-2">
          <h2 className="text-xl font-black text-ink">Ачааллаж байна...</h2>
          <p className="text-ink/60 font-medium">Сонсголын хичээлүүдийг бэлдэж байна.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12" id="listening-page-container">
      {/* Back Button and Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-3 text-sm font-black text-muted hover:text-blue-500 transition-colors uppercase tracking-widest group"
          id="listening-back-btn"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-border-sub flex items-center justify-center group-hover:border-blue-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Буцах
        </button>
        <div className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
          Сонсгол • HSK {profile?.selectedLevel || 1}
        </div>
      </div>

      {/* Progress Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-border-sub p-6 sm:p-10 shadow-sm relative overflow-hidden"
        id="listening-progress-header"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="space-y-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              HSK {profile?.selectedLevel || 1} — Сонсголын дасгалууд
            </h1>
            <p className="text-ink/60 font-semibold text-sm sm:text-base leading-relaxed">
              Хятад хэлээр ярилцах харилцааны сонсголыг хөгжүүлэх сонирхолтой {totalForLevel} дасгал. Яриаг сонсож асуултанд зөв хариулан оноогоо ахиулаарай.
            </p>
          </div>

          <div className="space-y-3 bg-bg-soft p-4 sm:p-6 rounded-2xl border border-border-sub">
            <div className="flex justify-between items-center text-xs sm:text-sm font-black text-ink/70">
              <span className="flex items-center gap-2 uppercase tracking-wider">
                <Award className="w-4 h-4 text-blue-500" /> Таны сонсголын амжилт
              </span>
              <span>{completedForLevel} / {totalForLevel} дуусгасан ({progressPercent}%)</span>
            </div>
            
            <div className="w-full h-3 bg-white border border-border-sub rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-blue-500" 
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Exercises Cards List */}
      <div className="grid md:grid-cols-2 gap-4" id="listening-exercises-list">
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
                  ? 'border-blue-200 shadow-sm shadow-blue-50 bg-blue-50/5' 
                  : 'border-border-sub hover:border-slate-300'
              }`}
              id={`listening-card-${exercise.id}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                      isCompleted 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-bg-soft text-ink/50'
                    }`}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    {isCompleted && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-200">
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
                    <Headphones className="w-4 h-4 text-blue-500 shrink-0" />
                    {exercise.title}
                  </h3>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate(`/listening/${exercise.id}`)}
                className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
                  isCompleted
                    ? 'bg-bg-soft text-ink/70 border border-border-sub hover:bg-slate-150'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-100 hover:scale-[1.01] active:scale-95'
                }`}
              >
                {isCompleted ? 'Дахин сонсох' : 'Сонсох'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
