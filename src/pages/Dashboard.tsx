import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Book,
  Headset,
  FileText,
  ChevronRight,
  Star,
  Flame,
  Trophy,
  Target,
  Layout,
  ArrowRight,
  Info,
  X,
  MessageSquare,
} from "lucide-react";
import { HSKLevel, HSKProgress, DailyTip } from "../types";
import { HSK_TIPS } from "../constants";
import {
  getHSKProgress,
  updateHSKProgress,
  saveUserProfile,
  saveFeedback,
} from "../lib/db";
import toast from "react-hot-toast";

function TrialCountdownBanner({ paidUntil }: { paidUntil: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
  } | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const remainingMs = Date.parse(paidUntil) - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft({ hours: 0, minutes: 0 });
        return;
      }
      const totalMinutes = Math.floor(remainingMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      setTimeLeft({ hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 10000); // update every 10 seconds
    return () => clearInterval(interval);
  }, [paidUntil]);

  if (!timeLeft) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-orange-50 border border-orange-105 text-orange-900 rounded-[2rem] text-sm font-extrabold shadow-sm"
      id="trial-countdown-banner"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-xl">🎁</span>
        <span>
          Та үнэгүй 1 өдрийн туршилтын хугацаатай байна. {timeLeft.hours} цаг{" "}
          {timeLeft.minutes} минут үлдлээ.
        </span>
      </div>
      <Link
        to="/payment"
        className="px-4 py-2 bg-primary-orange hover:bg-opacity-95 text-white text-xs font-black rounded-2xl shadow-md transition-all shrink-0 uppercase tracking-wider"
      >
        Хандалт авах →
      </Link>
    </motion.div>
  );
}

export default function Dashboard() {
  const { profile, refreshProfile } = useAuth();
  const [selectedTip, setSelectedTip] = useState<DailyTip | null>(null);
  const [currentProgress, setCurrentProgress] = useState<HSKProgress | null>(
    null,
  );
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const levels = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    if (profile) {
      getHSKProgress(profile.uid, profile.selectedLevel).then(
        setCurrentProgress,
      );
    }
  }, [profile?.selectedLevel, profile?.uid]);

  const setLevel = async (level: HSKLevel) => {
    if (!profile) return;
    try {
      // Save locally
      await saveUserProfile(profile.uid, { ...profile, selectedLevel: level });

      // Also initialize level progress if it doesn't exist
      const progress = await getHSKProgress(profile.uid, level);
      if (!progress) {
        await updateHSKProgress(profile.uid, level, {
          vocabularyCompleted: 0,
          grammarCompleted: 0,
          listeningCompleted: 0,
          readingCompleted: 0,
        });
      }

      await refreshProfile();
      toast.success(`HSK ${level} түвшин сонгогдлоо`);
    } catch (err) {
      console.error("Set level error:", err);
      toast.error("Түвшин солиход алдаа гарлаа");
    }
  };

  const levelTips = HSK_TIPS.filter((t) => t.level === profile?.selectedLevel);
  const dayIndex = new Date().getDate();
  const currentTip =
    levelTips.length > 0 ? levelTips[dayIndex % levelTips.length] : null;

  return (
    <div className="space-y-8 pb-20">
      {/* Welcome Header */}
      <section className="bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-[32px] border border-border-sub shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-orange/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8">
          <div className="space-y-2 w-full">
            <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight flex flex-wrap items-center gap-2">
              Сайн байна уу, {profile?.displayName}!{" "}
              <span className="animate-bounce">👋</span>
            </h2>
            <p className="text-ink/60 text-sm sm:text-base font-medium">
              Күнзийн хэл сурах аялалаа үргэлжлүүлцгээе.
            </p>

            <div className="flex flex-wrap gap-2.5 mt-4 sm:mt-6">
              <StatBadge
                icon={
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                }
                label={`${profile?.currentStreak || 0} өдөр`}
              />
              <StatBadge
                icon={
                  <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                }
                label={`${profile?.totalXp || 0} XP`}
              />
              <StatBadge
                icon={<Target className="w-4 h-4 text-blue-500" />}
                label={`HSK ${profile?.selectedLevel}`}
              />
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-2 shrink-0">
            <span className="text-[10px] font-black text-ink/40 uppercase tracking-wider md:hidden">
              Түвшин сонгох:
            </span>
            <div className="flex gap-1.5 p-1 bg-bg-soft rounded-2xl border border-border-sub overflow-x-auto max-w-full scrollbar-none flex-nowrap">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl as HSKLevel)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all shrink-0 ${
                    profile?.selectedLevel === lvl
                      ? "bg-primary-orange text-white shadow-lg shadow-orange-100 scale-105 font-black"
                      : "text-ink/40 hover:text-ink hover:bg-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {profile?.isPaid &&
        profile?.paidUntil &&
        (() => {
          if (profile.isTrial) {
            return <TrialCountdownBanner paidUntil={profile.paidUntil} />;
          }

          const diffMs = Date.parse(profile.paidUntil) - Date.now();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 px-6 py-4 bg-emerald-50/80 border border-emerald-100 text-emerald-800 rounded-3xl text-xs sm:text-sm font-bold shadow-sm"
                id="dashboard-countdown-banner"
              >
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                <span>Хандалт {diffDays} өдрийн дараа дуусна</span>
              </motion.div>
            );
          }
          return null;
        })()}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Main learning slots */}
          <div className="grid sm:grid-cols-2 gap-6">
            <Link to="/vocab" className="group">
              <div className="bg-white p-8 rounded-[32px] border border-border-sub shadow-sm hover:border-primary-orange transition-all h-full">
                <div className="w-14 h-14 bg-bg-orange rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  📖
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">Үгсийн сан</h3>
                <p className="text-ink/60 text-sm mb-6 leading-relaxed">
                  HSK {profile?.selectedLevel} түвшний шаардлагатай бүх үгс.
                </p>
                <div className="space-y-3">
                  <ProgressBar
                    label="Суралцаж буй"
                    progress={currentProgress?.vocabularyCompleted || 0}
                    max={100}
                    color="bg-primary-orange"
                  />
                </div>
              </div>
            </Link>

            <Link to="/grammar" className="group">
              <div className="bg-white p-8 rounded-[32px] border border-border-sub shadow-sm hover:border-emerald-500 transition-all h-full">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  ✍️
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">Хэл зүй</h3>
                <p className="text-ink/60 text-sm mb-6 leading-relaxed">
                  Дүрэм болон өгүүлбэрийн бүтэц.
                </p>
                <div className="space-y-3">
                  <ProgressBar
                    label="Явц"
                    progress={currentProgress?.grammarCompleted || 0}
                    max={100}
                    color="bg-emerald-500"
                  />
                </div>
              </div>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[24px] border border-border-sub flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">
                🎧
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-ink mb-0.5">Сонсгол</h4>
                <div className="w-full bg-blue-100 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full"
                    style={{
                      width: `${currentProgress?.listeningCompleted || 0}%`,
                    }}
                  />
                </div>
              </div>
              <Link
                to="/listening"
                className="w-10 h-10 bg-bg-soft rounded-xl flex items-center justify-center text-ink/40 hover:text-primary-orange transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-border-sub flex items-center gap-5">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl">
                📝
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-ink mb-0.5">Унших</h4>
                <div className="w-full bg-purple-100 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full"
                    style={{
                      width: `${currentProgress?.readingCompleted || 0}%`,
                    }}
                  />
                </div>
              </div>
              <Link
                to="/reading"
                className="w-10 h-10 bg-bg-soft rounded-xl flex items-center justify-center text-ink/40 hover:text-primary-orange transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Sidebar / Mini sections */}
          <div className="bg-white p-8 rounded-[32px] border border-border-sub shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-lg text-ink">Өдрийн зөвлөгөө</h3>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            {currentTip ? (
              <div className="space-y-4">
                <div className="text-4xl font-black text-primary-orange">
                  {currentTip.characters[0].hanzi}
                </div>
                <p className="text-ink/70 text-sm font-medium line-clamp-3">
                  {currentTip.title}
                </p>
                <button
                  onClick={() => setSelectedTip(currentTip)}
                  className="w-full py-4 bg-bg-soft hover:bg-border-sub rounded-2xl font-bold text-sm transition-all"
                >
                  Дэлгэрэнгүй
                </button>
              </div>
            ) : (
              <p className="text-xs text-ink/40">
                Өнөөдөртөө зөвлөгөө алга байна.
              </p>
            )}
          </div>

          <Link
            to="/leaderboard"
            className="block bg-ink p-8 rounded-[32px] text-white overflow-hidden relative group"
          >
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-lg font-black mb-1">Лидерүүдийн самбар</h3>
            <p className="text-white/60 text-sm mb-6">
              Бусадтай өрсөлдөн оноогоо ахиул.
            </p>
            <div className="flex items-center gap-2 text-primary-orange font-bold text-sm">
              Шалгах <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {selectedTip && (
          <TipModal tip={selectedTip} onClose={() => setSelectedTip(null)} />
        )}
        {isFeedbackOpen && (
          <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />
        )}
      </AnimatePresence>

      {/* Floating Feedback Button */}
      <button
        onClick={() => setIsFeedbackOpen(true)}
        className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-5 py-3.5 bg-white text-ink border border-border-sub hover:border-ink/20 rounded-full shadow-lg hover:shadow-xl transition-all font-bold text-xs uppercase tracking-wider active:scale-95 group"
        id="feedback-floating-button"
      >
        <MessageSquare className="w-4 h-4 text-primary-orange group-hover:rotate-12 transition-transform" />
        <span>Санал хүсэлт</span>
      </button>
    </div>
  );
}

function StatBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-border-sub rounded-2xl text-sm font-bold text-ink/80">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function ProgressBar({
  label,
  progress,
  max,
  color,
}: {
  label: string;
  progress: number;
  max: number;
  color: string;
}) {
  const percentage = Math.round((progress / max) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-ink/40 uppercase tracking-widest">{label}</span>
        <span className="text-ink">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-bg-soft rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}

function TipModal({ tip, onClose }: { tip: DailyTip; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-8 border-b border-border-sub flex items-center justify-between bg-bg-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl">
              💡
            </div>
            <div>
              <h3 className="text-xl font-black text-ink">{tip.title}</h3>
              <p className="text-xs text-ink/40 font-bold uppercase tracking-widest">
                HSK {tip.level} зөвлөгөө
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto space-y-8">
          {tip.characters.map((char, i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="text-6xl font-black text-primary-orange">
                  {char.hanzi}
                </div>
                <div>
                  <div className="text-xl font-bold">{char.pinyin}</div>
                  <div className="text-ink/60">{char.meanings.join(", ")}</div>
                </div>
              </div>
              <div className="grid gap-2">
                {char.examples.map((ex, ei) => (
                  <div
                    key={ei}
                    className="p-4 bg-bg-soft rounded-2xl flex items-center justify-between"
                  >
                    <span className="font-bold">{ex.ch}</span>
                    <span className="text-sm text-ink/60">{ex.mn}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-bg-soft border-t border-border-sub">
          <button
            onClick={onClose}
            className="w-full py-4 bg-ink text-white rounded-2xl font-bold"
          >
            Ойлголоо
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function FeedbackModal({ onClose }: { onClose: () => void }) {
  const { profile } = useAuth();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toast.error("Та нэвтэрсэн байх шаардлагатай.");
      return;
    }
    if (!message.trim()) {
      toast.error("Санал хүсэлтээ бичнэ үү.");
      return;
    }

    setLoading(true);
    try {
      await saveFeedback(
        profile.uid,
        profile.email || "",
        message.trim(),
        rating,
      );
      toast.success("Санал хүсэлт илгээгдлээ, баярлалаа! 🙏");
      onClose();
    } catch (err) {
      console.error("Feedback save error:", err);
      toast.error("Илгээхэд алдаа гарлаа. Дахин шалгана уу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden p-6 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-105 pb-3">
          <h3 className="text-lg font-black text-ink">Санал хүсэлт илгээх</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Үнэлгээ:
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform active:scale-95"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-205 fill-transparent"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Санал, сэтгэгдэл:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-none focus:border-slate-400 transition-colors placeholder-slate-400 min-h-[120px] resize-none"
              placeholder="Санал хүсэлтээ бичнэ үү..."
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-ink hover:bg-ink/90 text-white rounded-2xl font-bold transition-transform text-center disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Илгээж байна..." : "Илгээх"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
