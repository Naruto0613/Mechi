import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../../hooks/useUser';
import { Lock, CreditCard } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { profile } = useAuth();
  const { isActive, expiryDate } = useUser();

  // If loading or somehow profile is null
  if (!profile) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center" id="subscription-guard-loading">
        <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate days remaining
  let countdownText = '';
  if (isActive && expiryDate) {
    const diffMs = expiryDate - Date.now();
    if (profile?.isTrial) {
      const totalMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      countdownText = `Туршилт ${hours > 0 ? `${hours} цаг ` : ''}${minutes} минут үлдлээ`;
    } else {
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        countdownText = `Хандалт ${diffDays} өдрийн дараа дуусна`;
      } else {
        countdownText = 'Хандалт өнөөдөр дуусна';
      }
    }
  }

  // Locked Content Overlay
  if (!isActive) {
    const isAbuseFailed = profile?.trialEligibilityCheckFailed === true;

    return (
      <div className="relative min-h-[75vh] flex flex-col items-center justify-center p-4" id="subscription-locked-overlay">
        {/* Background visual container blurred */}
        <div className="absolute inset-0 filter blur-[12px] opacity-10 pointer-events-none select-none overflow-hidden">
          {children}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 w-full max-w-md mx-auto py-12 px-8 bg-white/95 rounded-[3rem] border border-border-sub shadow-2xl flex flex-col items-center text-center space-y-6 backdrop-blur-sm"
        >
          <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-3xl shadow-sm">
            🔒
          </div>

          <div className="space-y-3">
            {isAbuseFailed ? (
              <>
                <h2 className="text-xl sm:text-2xl font-black text-ink leading-snug">
                  Туршилтын хугацаа ашиглах боломжгүй
                </h2>
                <p className="text-sm font-semibold text-ink/70 leading-relaxed">
                  Таны төхөөрөмж эсвэл и-мэйл хаяг аль хэдийн туршилтын хугацаа ашигласан байна. Хандалт авахын тулд төлбөр төлнө үү.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-black text-ink leading-snug">
                  Үргэлжлүүлэн суралцахын тулд хандалт авна уу
                </h2>
                <p className="text-sm font-semibold text-ink/50">
                  Таны суралцах эрх идэвхгүй байна. 1 сарын эрх нээн сургалтаа үргэлжлүүлнэ үү.
                </p>
              </>
            )}
          </div>

          {!isAbuseFailed && (
            <div className="p-4 w-full bg-orange-50/80 border border-orange-100 rounded-2xl flex justify-between items-center px-6">
              <span className="font-bold text-ink/60 text-sm">Хандалтын үнэ</span>
              <span className="text-xl font-black text-primary-orange">15,000₮</span>
            </div>
          )}

          <Link
            to="/payment"
            className="w-full py-4 bg-primary-orange text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 hover:opacity-95 transition-all outline-none"
          >
            <CreditCard className="w-5 h-5" />
            <span>Төлбөр төлөх</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Active state -> render children normally, status check can also show up here optionally
  return (
    <div className="space-y-4" id="subscription-active-view">
      {isActive && expiryDate && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-wrap items-center justify-between gap-3 px-6 py-3 border rounded-2xl text-xs font-black ${
            profile?.isTrial 
              ? 'bg-orange-50 border-orange-100 text-orange-850' 
              : 'bg-emerald-50 border-emerald-100 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${profile?.isTrial ? 'bg-orange-500' : 'bg-emerald-500'}`} />
            <span className="uppercase tracking-wider">
              {profile?.isTrial ? 'Үнэгүй 1 өдрийн туршилтын хандалт олгогдсон байна' : 'Суралцах эрх: Идэвхтэй (Premium)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span>⏱</span>
            <span>{countdownText}</span>
          </div>
        </motion.div>
      )}
      {children}
    </div>
  );
}
