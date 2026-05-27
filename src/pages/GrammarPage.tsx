import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle2, Bookmark, ArrowRight, Award } from 'lucide-react';
import { getCompletedGrammarLessons } from '../lib/db';
import grammarData from '../data/grammar.json';

interface GrammarPattern {
  id: string;
  title: string;
  pattern: string;
  explanation: string;
}

export default function GrammarPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const levelKey = `HSK${profile?.selectedLevel || 1}` as keyof typeof grammarData;
  const currentPatterns = (grammarData[levelKey] || []) as GrammarPattern[];

  useEffect(() => {
    if (profile?.uid) {
      setLoading(true);
      getCompletedGrammarLessons(profile.uid)
        .then((ids) => {
          setCompletedIds(ids);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [profile?.uid, profile?.selectedLevel]);

  // Calculate completed count for the current HSK level
  const levelPrefix = `hsk${profile?.selectedLevel || 1}_`;
  const completedForLevel = currentPatterns.filter(p => completedIds.includes(p.id)).length;
  const totalForLevel = currentPatterns.length || 10;
  const progressPercent = Math.min(100, Math.round((completedForLevel / totalForLevel) * 100));

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div className="space-y-2">
          <h2 className="text-xl font-black text-ink">Ачааллаж байна...</h2>
          <p className="text-ink/60 font-medium">Хэл зүйн дүрмийн жагсаалтыг бэлдэж байна.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12" id="grammar-page-container">
      {/* Back Button and Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-3 text-sm font-black text-muted hover:text-emerald-500 transition-colors uppercase tracking-widest group"
          id="grammar-back-btn"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-border-sub flex items-center justify-center group-hover:border-emerald-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Буцах
        </button>
        <div className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
          Хэл зүй • HSK {profile?.selectedLevel || 1}
        </div>
      </div>

      {/* Progress Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-border-sub p-6 sm:p-10 shadow-sm relative overflow-hidden"
        id="grammar-progress-header"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="space-y-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              HSK {profile?.selectedLevel || 1} — Хэл зүйн дүрмүүд
            </h1>
            <p className="text-ink/60 font-semibold text-sm sm:text-base leading-relaxed">
              Түвшнийхээ хамгийн чухал {totalForLevel} дүрмийн өгүүлбэрийн бүтцийг жишээнүүдээр сурч, сорилоор баталгаажуулаарай.
            </p>
          </div>

          <div className="space-y-3 bg-bg-soft p-4 sm:p-6 rounded-2xl border border-border-sub">
            <div className="flex justify-between items-center text-xs sm:text-sm font-black text-ink/70">
              <span className="flex items-center gap-2 uppercase tracking-wider">
                <Award className="w-4 h-4 text-emerald-500" /> Таны амжилт
              </span>
              <span>{completedForLevel} / {totalForLevel} дууссан ({progressPercent}%)</span>
            </div>
            
            <div className="w-full h-3 bg-white border border-border-sub rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-emerald-500" 
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grammar Cards List */}
      <div className="space-y-4" id="grammar-patterns-list">
        {currentPatterns.map((pattern, index) => {
          const isCompleted = completedIds.includes(pattern.id);
          return (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl border p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all ${
                isCompleted 
                  ? 'border-emerald-200 shadow-sm shadow-emerald-50 bg-emerald-50/5' 
                  : 'border-border-sub hover:border-slate-300'
              }`}
              id={`grammar-card-${pattern.id}`}
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                    isCompleted 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-bg-soft text-ink/50'
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-ink hover:text-emerald-500 transition-colors">
                    {pattern.title}
                  </h3>
                  {isCompleted && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-750 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Дууссан
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-ink/60 line-clamp-2 pl-11">
                  {pattern.explanation}
                </p>

                {/* Structure / Formula Container */}
                <div className="pl-11">
                  <span className="inline-block font-mono text-xs font-black bg-bg-soft text-ink/70 px-3 py-1.5 rounded-lg border border-border-sub">
                    Бүтэц: <code className="text-emerald-700 ml-1">{pattern.pattern}</code>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate(`/grammar/${pattern.id}`)}
                className={`w-full md:w-auto px-6 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
                  isCompleted
                    ? 'bg-bg-soft text-ink/70 border border-border-sub hover:bg-slate-100'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-100 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isCompleted ? 'Дахин үзэх' : 'Үзэх'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
