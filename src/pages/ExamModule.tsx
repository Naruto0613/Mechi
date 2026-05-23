import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, FileCheck, ArrowRight, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addXp, updateHSKProgress } from '../lib/db';
import toast from 'react-hot-toast';

export default function ExamModule() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleFinish = async () => {
    if (!profile) return;
    
    // In a real app, this score would be calculated from answers
    const mockScore = 85; 
    const xpReward = 150;

    try {
      await updateHSKProgress(profile.uid, profile.selectedLevel, {
        mockExamHighScore: mockScore
      });
      await addXp(profile.uid, xpReward);
      toast.success(`Шалгалт амжилттай! +${xpReward} XP`, { icon: '🎓' });
      await refreshProfile();
      setFinished(true);
    } catch (err) {
      console.error('Exam save error:', err);
      toast.error('Үр дүнг хадгалахад алдаа гарлаа');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      {!started && !finished ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 sm:p-12 md:p-16 rounded-[2rem] sm:rounded-[4rem] border-4 sm:border-8 border-primary-orange/5 shadow-2xl text-center space-y-8 sm:space-y-12"
        >
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary-orange/10 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-primary-orange mx-auto rotate-12">
            <FileCheck className="w-8 h-8 sm:w-12 sm:h-12" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black text-ink">HSK {profile?.selectedLevel} Шалгалт</h1>
            <p className="text-base sm:text-xl text-ink/60 font-medium tracking-tight">Бодит шалгалтын хэлбэрээр өөрийгөө сориорой.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:gap-8 max-w-lg mx-auto">
            <div className="bg-bg-soft p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border-sub">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-primary-orange mx-auto mb-1.5 sm:mb-2" />
              <p className="text-xs sm:text-sm font-bold text-ink/40 uppercase tracking-widest">Хугацаа</p>
              <p className="text-base sm:text-xl font-black text-ink">45 минут</p>
            </div>
            <div className="bg-bg-soft p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border-sub">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-primary-orange mx-auto mb-1.5 sm:mb-2" />
              <p className="text-xs sm:text-sm font-bold text-ink/40 uppercase tracking-widest">Шагнал</p>
              <p className="text-base sm:text-xl font-black text-ink">150 XP</p>
            </div>
          </div>

          <button 
            onClick={() => setStarted(true)}
            className="bg-primary-orange hover:bg-primary-orange/90 text-white px-10 sm:px-16 py-4 sm:py-6 rounded-2xl sm:rounded-3xl font-black text-xl sm:text-3xl shadow-xl shadow-orange-100 transition-all active:scale-95"
          >
            Эхлэх
          </button>
        </motion.div>
      ) : started && !finished ? (
        <div className="bg-white p-5 sm:p-12 rounded-[2rem] sm:rounded-[3rem] border-2 border-border-sub shadow-xl space-y-8 sm:space-y-12">
          <div className="flex justify-between items-center text-ink/40 font-black italic text-xs sm:text-base">
            <span>Асуулт 1/20</span>
            <span className="flex items-center gap-1.5 sm:gap-2 bg-bg-soft px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-primary-orange not-italic">
              <Clock className="w-4 sm:w-5 h-4 sm:h-5" /> 44:59
            </span>
          </div>
          
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-xl sm:text-4xl font-black text-ink leading-tight">Зургийг тохирох ханзтай нь холбоно уу.</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-8">
              {['🍎', '🚗', '🏫', '👤'].map((emoji, i) => (
                <div key={i} className="aspect-square bg-bg-soft border-2 sm:border-4 border-dashed border-border-sub rounded-2xl sm:rounded-3xl flex items-center justify-center text-5xl sm:text-7xl hover:bg-primary-orange/10 cursor-pointer transition-all">
                  {emoji}
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={handleFinish}
            className="w-full bg-ink text-white py-4 sm:py-6 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-2xl shadow-xl transition-all active:scale-95"
          >
            Дуусгах
          </button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 sm:p-12 md:p-16 rounded-[2rem] sm:rounded-[4rem] border-2 border-border-sub shadow-2xl text-center space-y-8 sm:space-y-12"
        >
          <div className="text-5xl sm:text-6xl">🎓</div>
          <h2 className="text-3xl sm:text-6xl font-black text-ink">Шалгалт дууслаа!</h2>
          <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center p-4 sm:p-6 bg-emerald-50 rounded-2xl sm:rounded-3xl border border-emerald-100">
              <span className="font-bold text-xs sm:text-sm text-emerald-900/60 uppercase tracking-widest">Таны оноо</span>
              <span className="text-2xl sm:text-4xl font-black text-emerald-600">85%</span>
            </div>
            <div className="flex justify-between items-center p-4 sm:p-6 bg-primary-orange/5 rounded-2xl sm:rounded-3xl border border-primary-orange/10">
              <span className="font-bold text-xs sm:text-sm text-primary-orange/60 uppercase tracking-widest">Авсан XP</span>
              <span className="text-2xl sm:text-4xl font-black text-primary-orange">+150</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              onClick={() => { setStarted(false); setFinished(false); }}
              className="flex-1 bg-bg-soft border border-border-sub py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors text-sm sm:text-base"
            >
              <RotateCcw className="w-5 h-5" /> Дахин өгөх
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-primary-orange text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-100 hover:opacity-90 transition-all text-sm sm:text-base"
            >
              Дашборд <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
