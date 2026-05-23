import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../hooks/useUser';
import { User as UserIcon, LogOut, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import mechiLogo from '../../assets/images/mechi_logo_1779261115033.png';

export default function Header() {
  const { profile, logout } = useAuth();
  const { isActive } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isGuest = !profile || profile.uid === 'guest' || profile.displayName === 'Зочин';
  const hasPaid = isActive;

  return (
    <header className="bg-white border-b border-border-sub sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between max-w-6xl">
        <div className="flex items-center gap-6">
          <Link 
            to={location.pathname === '/dashboard' ? "/dashboard" : "/"} 
            className="flex items-center gap-3 group"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 overflow-hidden rounded-xl flex items-center justify-center shadow-lg shadow-orange-100 bg-primary-orange"
            >
              <img 
                src={mechiLogo} 
                alt="Mechi Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <span className="font-sans text-xl font-bold tracking-tight text-primary-orange">
              Mechi
            </span>
          </Link>

          {!isGuest && !hasPaid && (
            <Link 
              to="/payment" 
              className="hidden lg:flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-200 animate-pulse"
            >
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Идэвхгүй (15,000₮)
            </Link>
          )}

          {!isGuest && hasPaid && profile?.isTrial && (
            <Link
              to="/payment"
              className="hidden lg:flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-orange-200 hover:bg-orange-100 transition-all shadow-sm"
              title="Үнэгүй туршилтын хугацаа 1 өдөр. Энд дарж сунгана уу."
            >
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" /> ТУРШИЛТЫН ЭРХ (1 ӨДӨР)
            </Link>
          )}

          {!isGuest && hasPaid && !profile?.isTrial && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> PREMIUM ИДЭВХТЭЙ
            </div>
          )}
        </div>

        <nav className="flex items-center gap-2 sm:gap-6">
          {!isGuest && (
            <div className="flex items-center gap-2.5 sm:gap-6 text-xs sm:text-sm font-black">
              <div className="flex items-center gap-1 text-orange-600" title={`${profile?.currentStreak || 0} хоног дараалсан streak`}>
                <span className="text-base sm:text-xl">🔥</span>
                <span>{profile?.currentStreak || 0}<span className="hidden sm:inline"> хоног</span></span>
              </div>
              <div className="flex items-center gap-1 text-blue-600" title={`${profile?.totalXp || 0} XP`}>
                <span className="text-base sm:text-xl">💎</span>
                <span>{profile?.totalXp || 0}<span className="hidden sm:inline"> XP</span></span>
              </div>
              <div className="px-2 sm:px-4 py-1.5 bg-bg-soft border border-border-sub rounded-full text-[9px] sm:text-xs font-black text-muted uppercase tracking-wider" title={`HSK ${profile?.selectedLevel || 1} Түвшин`}>
                <span className="hidden xs:inline">HSK </span><span className="text-primary-orange">{profile?.selectedLevel || 1}</span>
              </div>
            </div>
          )}
          
          <div className="h-10 w-px bg-border-sub hidden sm:block" />
          
          {isGuest ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              <Link 
                to="/login"
                className="px-2.5 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider text-muted hover:text-ink hover:bg-bg-soft transition-all"
              >
                Нэвтрэх
              </Link>
              <Link 
                to="/signup"
                className="px-3 sm:px-5 py-2.5 bg-primary-orange text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider hover:opacity-90 shadow-lg shadow-orange-100 transition-all"
              >
                Бүртгүүлэх
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-3">
              {(!hasPaid || profile?.isTrial) && (
                <Link 
                  to="/payment" 
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  <CreditCard className="w-4 h-4" />
                  {profile?.isTrial ? 'Эрх сунгах (15,000₮)' : 'Эрх нээх (15,000₮)'}
                </Link>
              )}
              <Link 
                to="/profile" 
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-bg-soft rounded-full transition-colors text-ink"
                title="Миний Профайл"
              >
                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <button 
                onClick={handleLogout}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-red-50 rounded-full transition-colors text-red-500"
                title="Системээс гарах"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
