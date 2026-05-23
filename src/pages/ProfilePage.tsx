import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Medal, Star, Edit2, Check, X, Flame, LogOut } from 'lucide-react';
import { HSKLevel } from '../types';
import { saveUserProfile } from '../lib/db';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { profile, refreshProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(profile?.displayName || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!profile) return null;

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === profile.displayName) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      await saveUserProfile(profile.uid, { ...profile, displayName: newName.trim() });
      await refreshProfile();
      toast.success('Нэр шинэчлэгдлээ');
      setIsEditing(false);
    } catch (error) {
      console.error('Update name error:', error);
      toast.error('Шинэчлэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = async (level: HSKLevel) => {
    setLoading(true);
    try {
      await saveUserProfile(profile.uid, { ...profile, selectedLevel: level });
      await refreshProfile();
      toast.success(`Түвшин HSK ${level} болж өөрчлөгдлөө`);
    } catch (error) {
      console.error('Update level error:', error);
    } finally {
      setLoading(false);
    }
  };

  const levels = [1, 2, 3, 4, 5, 6];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-300" id="profile-page">
      <section className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-border-sub shadow-xl flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-orange/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="w-40 h-40 md:w-48 md:h-48 bg-orange-100 rounded-full flex items-center justify-center text-primary-orange relative z-10 border-8 border-white shadow-xl">
          <div className="text-6xl">👤</div>
        </div>
        
        <div className="relative z-10 space-y-4 text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-2xl md:text-4xl font-black text-ink bg-bg-soft border-b-4 border-primary-orange outline-none px-2 py-1 rounded-t-xl"
                  autoFocus
                />
                <button 
                  onClick={handleUpdateName}
                  disabled={loading}
                  className="p-2 bg-emerald-500 text-white rounded-xl"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2 bg-rose-500 text-white rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black text-ink">{profile.displayName || 'Суралцагч'}</h1>
                <button onClick={() => setIsEditing(true)} className="p-2 text-ink/20 hover:text-primary-orange transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          <p className="text-sm sm:text-base text-ink/40 font-semibold">{profile.email}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
            <Badge icon={<Flame className="w-4 h-4 text-orange-500 fill-orange-500" />} label={`${profile.currentStreak || 0} хоног`} />
            <Badge icon={<Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />} label={`${profile.totalXp || 0} XP`} />
            <Badge icon={<Medal className="w-4 h-4 text-blue-500" />} label={`HSK ${profile.selectedLevel || 1}`} />
          </div>
        </div>

        {/* Dynamic & visible logout button */}
        <button 
          onClick={async () => {
            await logout();
            navigate('/', { replace: true });
            toast.success('Амжилттай гарлаа');
          }}
          className="md:absolute md:top-8 md:right-8 flex items-center justify-center gap-2 px-6 py-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl font-black text-xs hover:bg-rose-100 transition-all shadow-sm shrink-0"
        >
          <LogOut className="w-4 h-4" /> Гарах
        </button>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3.5rem] border border-border-sub shadow-sm space-y-8">
          <h3 className="text-2xl font-black text-ink">Түвшин солих</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {levels.map(l => (
              <button
                key={l}
                onClick={() => handleLevelChange(l as HSKLevel)}
                disabled={loading || profile.selectedLevel === l}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                  profile.selectedLevel === l 
                  ? 'bg-primary-orange border-primary-orange text-white shadow-lg' 
                  : 'bg-white border-border-sub text-ink/40 hover:border-primary-orange'
                }`}
              >
                <span className="text-[10px] font-black uppercase">HSK</span>
                <span className="text-xl font-black">{l}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subscription Info Card */}
        <div className="bg-white p-8 rounded-[3.5rem] border border-border-sub shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-black text-ink mb-4">Сургалтын эрх & Төлбөр</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-border-sub">
                <span className="text-sm font-bold text-ink/60">Эрхийн төлөв:</span>
                {profile.isPaid ? (
                  <span className="text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    Premium Идэвхтэй
                  </span>
                ) : (
                  <span className="text-xs font-black bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                    Идэвхгүй (15,000₮)
                  </span>
                )}
              </div>
              {profile.isPaid && profile.paidUntil && (
                <div className="flex justify-between items-center py-2.5 border-b border-border-sub">
                  <span className="text-sm font-bold text-ink/60">Дуусах хугацаа:</span>
                  <span className="text-sm font-black text-ink">
                    {new Date(profile.paidUntil).toLocaleDateString('mn-MN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2.5 border-b border-border-sub">
                <span className="text-sm font-bold text-ink/60">Сар бүрийн хураамж:</span>
                <span className="text-sm font-black text-primary-orange">15,000 ₮</span>
              </div>
            </div>
          </div>
          
          {!profile.isPaid && (
            <button
              onClick={() => navigate('/payment')}
              className="w-full py-4 text-xs font-black bg-primary-orange hover:opacity-90 text-white rounded-2xl uppercase tracking-wider transition-all text-center block shadow-md mt-4"
            >
              Сургалтын эрх нээх (15,000₮)
            </button>
          )}
        </div>
      </div>

      <div className="bg-ink p-8 rounded-[3.5rem] text-white flex flex-col justify-center">
        <h3 className="text-3xl font-black mb-2">Тууштай байгаарай!</h3>
        <p className="text-white/60 mb-8">Та одоогоор {profile.currentStreak || 0} өдрийн дараалсан streak-тэй байна. Өдөр бүр 10 минут зарцуулж аялалаа үргэлжлүүлээрэй.</p>
        <div className="flex gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full ${i < (profile.currentStreak || 0) % 7 ? 'bg-primary-orange' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-2 px-6 py-2 bg-white border border-border-sub rounded-2xl font-bold text-sm text-ink shadow-sm">
      {icon} {label}
    </div>
  );
}
