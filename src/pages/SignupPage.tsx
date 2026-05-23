import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Lock, Mail, User, Shield, ArrowRight, CheckCircle, RefreshCw, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendPaymentEmail } from '../components/PaymentCard';
import { saveUserProfile } from '../lib/db';

const KhanBankLogo = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 shrink-0 rounded-2xl shadow-md border border-[#005a24]" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="24" fill="#007A33" />
    <g transform="translate(18, 18) scale(0.64)" fill="#FFFFFF">
      <path d="M 50,0 C 42,15 30,25 5,30 C 30,35 42,45 50,60 C 58,45 70,35 95,30 C 70,25 58,15 50,0 Z" />
      <path d="M 50,40 C 44,52 32,60 10,64 C 32,68 44,76 50,88 C 56,76 68,68 90,64 C 68,60 56,52 50,40 Z" opacity="0.85" />
      <circle cx="50" cy="47" r="14" fill="#007A33" />
      <path d="M 50,22 L 50,72" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <path d="M 25,47 L 75,47" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

export default function SignupPage() {
  const { signup, refreshProfile, profile } = useAuth();
  const { isActive } = useUser();
  const navigate = useNavigate();

  // If already logged in, redirect depending on active state to prevent registering again
  useEffect(() => {
    if (profile) {
      if (isActive) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/payment', { replace: true });
      }
    }
  }, [profile, isActive, navigate]);

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');

  // Registration form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Payment states
  const [submitting, setSubmitting] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!userId) return;
    navigator.clipboard.writeText(userId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy ID:', err);
    });
  };

  // Bank details
  const bank = {
    name: 'Хаан Банк (Khan Bank)',
    account: '5222111351',
    holder: 'Naranbadrakh (Наранбадрах)',
    logo: <KhanBankLogo />
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Нэрээ оруулна уу');
    if (!email.trim() || !email.includes('@')) return toast.error('Зөв имэйл хаяг оруулна уу');
    if (password.length < 6) return toast.error('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой');

    setLoading(true);
    try {
      const profileResult = await signup(name, email, password);
      toast.success('Бүртгэл амжилттай үүслээ! Таны 1 өдрийн үнэгүй туршилтын хугацаа эхэллээ. 🎉');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      let msg = err.message || 'Бүртгэлд алдаа гарлаа';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Энэ имэйл хаяг бүртгэлтэй байна. Нэвтрэх хэсгээр орно уу.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Нууц үг хэт богино байна (хамгийн багадаа 6 тэмдэгт).';
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupPayment = async () => {
    setSubmitting(true);
    try {
      // 1. Send notifications through EmailJS
      await sendPaymentEmail(userId, email);
      
      // 2. Set paymentPending: true in Firestore DB
      await saveUserProfile(userId, { paymentPending: true } as any);
      
      setPaymentSubmitted(true);
      toast.success('Төлбөрийн мэдээлэл илгээгдлээ. Админ шалгаад эрхийг идэвхжүүлэх болно!');
      
      // Refresh auth profile
      await refreshProfile();
    } catch (error) {
      console.error('EmailJS Error:', error);
      toast.error('Алдаа гарлаа, дахин оролдоно уу');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4" id="signup-page">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="register_step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-border-sub shadow-xl space-y-8"
          >
            <div className="text-center space-y-2">
              <span className="text-4xl">🐼</span>
              <h2 className="text-3xl font-black text-ink">Шинэ бүртгэл үүсгэх</h2>
              <p className="text-sm text-ink/60 font-medium">Хятад хэл сурах аяллаа даруй эхлүүлээрэй</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-ink/40">Таны нэр</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/30" />
                  <input
                    type="text"
                    placeholder="Нэрээ оруулна уу"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 border border-border-sub rounded-2xl font-bold text-sm focus:border-primary-orange focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-ink/40">Имэйл хаяг</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/30" />
                  <input
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 border border-border-sub rounded-2xl font-bold text-sm focus:border-primary-orange focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-ink/40">Нууц үг</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/30" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 border border-border-sub rounded-2xl font-bold text-sm focus:border-primary-orange focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3 text-orange-850 text-xs">
                <div className="text-lg">📢</div>
                <div className="font-semibold leading-relaxed">
                  Бүртгүүлээд шууд <b>1 өдрийн үнэгүй туршилтын хандалттайгаар</b> сургалтаа эхлүүлэх боломжтой! Туршилтын хугацаа дуусах үед төлбөрөө төлж сунгана уу.
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-primary-orange text-white rounded-2xl font-bold text-sm shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Бүртгэж байна...' : 'Бүртгүүлээд 1 Өдрийн Туршилт Эхлүүлэх'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2">
              <span className="text-xs text-ink/40 font-bold">Бүртгэлтэй юу? </span>
              <Link to="/login" className="text-xs text-primary-orange font-bold hover:underline">Нэвтрэх</Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="payment_step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-border-sub shadow-xl space-y-6 max-w-lg mx-auto"
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm mx-auto">
                🔑
              </div>
              <h2 className="text-2xl font-black text-ink">1 Сарын Хандалт</h2>
              <p className="text-xs text-ink/50 font-bold">Хятад хэл сурах бүрэн боломж нээх</p>
            </div>

            {/* Selected Bank Details Card */}
            <div className="p-6 bg-bg-soft rounded-3xl border border-border-sub space-y-5">
              <div className="flex items-center gap-4">
                {bank.logo}
                <div>
                  <h3 className="font-black text-ink text-lg leading-tight">{bank.name}</h3>
                  <p className="text-xs text-emerald-700 font-bold uppercase tracking-wide">Төлбөр хүлээн авах утс / данс</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium pt-2 border-t border-border-sub/30">
                <div>
                  <div className="text-[10px] text-ink/40 font-black uppercase tracking-wider">Дансны дугаар</div>
                  <div className="text-ink font-bold text-base select-all bg-white py-1.5 px-3 rounded-lg border border-border-sub inline-block mt-0.5">{bank.account}</div>
                </div>
                <div>
                  <div className="text-[10px] text-ink/40 font-black uppercase tracking-wider">Хүлээн авагч</div>
                  <div className="text-ink font-bold py-1.5 mt-0.5 text-base">{bank.holder}</div>
                </div>
                <div>
                  <div className="text-[10px] text-ink/40 font-black uppercase tracking-wider">Шижүүлэх дүн</div>
                  <div className="text-primary-orange font-black text-base py-1.5 mt-0.5">15,000 ₮</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-[10px] text-ink/40 font-black uppercase tracking-wider">Гүйлгээний утга (Гар утас / Имэйл)</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="text-ink font-mono font-bold bg-white py-1.5 px-3 rounded-lg border border-border-sub inline-block select-all">{userId || 'mechi_user'}</div>
                    {userId && (
                      <button
                        onClick={handleCopy}
                        className="p-2 rounded-lg border border-border-sub bg-white hover:bg-bg-soft transition-colors text-ink/70 hover:text-ink cursor-pointer focus:outline-none shrink-0"
                        title="ID хуулах"
                        type="button"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-600 animate-scale-in" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border-sub/40 pt-4 space-y-2 text-xs text-ink/75 leading-relaxed">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> HSK 1-6 түвшний бүх үгс, дүрэм
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Сонсгол, унших, дасгал хичээлүүд
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Ухаалаг жишиг шалгалт өгөх эрх
              </div>
            </div>

            <div className="pt-4 border-t border-border-sub/40 space-y-3">
              {paymentSubmitted ? (
                <div className="space-y-4">
                  <button
                    disabled
                    className="w-full py-4 bg-gray-100 text-gray-400 border border-gray-200 rounded-2xl font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                    <span>Will activate before 9PM</span>
                  </button>
                  <p className="text-[10px] text-center text-ink/50 font-semibold bg-amber-50 border border-amber-100/60 p-3 rounded-xl leading-relaxed">
                    Төлбөр илгээгдлээ. Хэрэв та симуляциар шууд идэвхжүүлэхийг хүсвэл <b>Ctrl + Shift + A</b> товчийг даран хэрэгчийн ID: <code className="font-mono bg-white px-1.5 py-0.5 border border-border-sub rounded text-[11px] font-bold text-ink">{userId}</code>-аар шууд идэвхжүүлж болно.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleSignupPayment}
                  disabled={submitting}
                  className="w-full py-4 bg-primary-orange text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-80"
                >
                  {submitting ? 'Илгээж байна...' : 'Би төлсөн'}
                </button>
              )}
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-ink/40 font-bold">Бүртгэлтэй имэйл хаяг: </span>
              <span className="text-xs text-ink/70 font-mono font-bold">{email}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
