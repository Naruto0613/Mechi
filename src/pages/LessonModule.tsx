import { useParams, useNavigate } from 'react-router-dom';
import { SAMPLE_LESSONS } from '../constants';
import { motion } from 'framer-motion';
import { ChevronLeft, Award } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addXp } from '../lib/db';
import toast from 'react-hot-toast';

export default function LessonModule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lesson = SAMPLE_LESSONS.find(l => l.id === id);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const { profile, refreshProfile } = useAuth();

  if (!lesson) return <div>Хичээл олдсонгүй.</div>;

  const handleQuizSelect = async (idx: number) => {
    setSelected(idx);
    const isCorrect = idx === lesson.quiz[currentQuiz].correctIndex;
    if (isCorrect) {
      if (profile) {
        try {
          await addXp(profile.uid, 5);
          toast.success('+5 XP', { duration: 1000, icon: '⭐' });
        } catch (err) {
          console.error('Add XP error:', err);
        }
      }
    }
  };

  const nextQuiz = () => {
    if (currentQuiz < lesson.quiz.length - 1) {
      setCurrentQuiz(prev => prev + 1);
      setSelected(null);
    } else {
      setComplete(true);
      refreshProfile();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-amber-900/60 font-bold hover:text-amber-500 transition-colors">
        <ChevronLeft className="w-5 h-5" /> Буцах
      </button>

      {!quizMode ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 sm:p-12 rounded-[2rem] sm:rounded-[40px] border border-border-sub shadow-xl space-y-6 sm:space-y-8"
        >
          <h1 className="text-2xl sm:text-4xl font-black text-ink tracking-tight">{lesson.title}</h1>
          <div className="prose prose-orange max-w-none text-ink/80 leading-relaxed font-semibold text-sm sm:text-base">
            {lesson.content.split('\n').map((line, i) => {
              if (line.startsWith('###')) return <h3 key={i} className="text-xl sm:text-2xl font-black mt-6 sm:mt-8 mb-3 sm:mb-4 text-ink">{line.replace('###', '')}</h3>;
              if (line.startsWith('-')) return <li key={i} className="ml-3 sm:ml-4 list-disc mb-1.5 sm:mb-2">{line.replace('-', '')}</li>;
              if (line.trim() === '') return <div key={i} className="h-3 sm:h-4" />;
              return <p key={i} className="mb-3 sm:mb-4">{line}</p>;
            })}
          </div>

          <div className="pt-6 sm:pt-8 border-t border-border-sub">
            <button 
              onClick={() => setQuizMode(true)}
              className="w-full bg-primary-orange hover:opacity-90 text-white py-4 sm:py-6 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-2xl shadow-xl shadow-orange-100 transition-all active:scale-95"
            >
              Мэдлэгээ шалгах
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {!complete ? (
            <motion.div 
              key={currentQuiz}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-5 sm:p-12 rounded-[2rem] sm:rounded-[40px] border border-border-sub shadow-xl space-y-6 sm:space-y-8"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-primary-orange font-black uppercase tracking-widest text-xs sm:text-sm">Асуулт {currentQuiz + 1} / {lesson.quiz.length}</span>
                <div className="w-24 sm:w-32 h-1.5 sm:h-2 bg-bg-soft rounded-full overflow-hidden">
                  <div className="h-full bg-primary-orange transition-all duration-500" style={{ width: `${((currentQuiz + 1) / lesson.quiz.length) * 100}%` }} />
                </div>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-ink tracking-tight leading-snug">{lesson.quiz[currentQuiz].question}</h2>
              <div className="grid gap-3 sm:gap-4">
                {lesson.quiz[currentQuiz].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizSelect(i)}
                    className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 font-black text-left text-base sm:text-xl transition-all ${
                      selected === i 
                        ? (i === lesson.quiz[currentQuiz].correctIndex ? 'bg-accent-green border-accent-green text-white' : 'bg-red-500 border-red-500 text-white')
                        : 'bg-bg-soft border-border-sub text-ink hover:border-muted'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {selected !== null && (
                <button 
                  onClick={nextQuiz}
                  className="w-full bg-ink text-white py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl mt-6 sm:mt-8 shadow-xl transition-all active:scale-95"
                >
                  Дараагийнх
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-6 sm:p-16 rounded-[2rem] sm:rounded-[48px] border border-border-sub shadow-2xl text-center space-y-6 sm:space-y-8"
            >
              <div className="w-20 h-20 sm:w-32 sm:h-32 bg-green-50 rounded-full flex items-center justify-center mx-auto text-accent-green">
                <Award className="w-10 h-10 sm:w-16 sm:h-16" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-ink tracking-tight">Баяр хүргэе!</h2>
              <p className="text-base sm:text-xl text-muted font-medium italic">Та энэ хичээлийг амжилттай дуусгалаа. +10 XP бонус!</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-primary-orange text-white px-8 sm:px-12 py-3.5 sm:py-5 rounded-2xl font-black text-base sm:text-xl shadow-xl shadow-orange-100 transition-all active:scale-95"
              >
                Дашборд руу буцах
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
