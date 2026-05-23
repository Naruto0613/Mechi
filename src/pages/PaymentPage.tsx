import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../context/AuthContext';
import PaymentCard from '../components/PaymentCard';
import { motion } from 'framer-motion';
import { Shield, CreditCard, HelpCircle, Copy, Check } from 'lucide-react';

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

export default function PaymentPage() {
  const { userId, email, isActive } = useUser();
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);

  const shortId = userId ? userId.slice(0, 8).toUpperCase() : '';
  const showTrialExpiredBanner = profile?.isTrial === true && !profile?.isActive;

  const handleCopy = () => {
    if (!shortId) return;
    navigator.clipboard.writeText(shortId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy ID:', err);
    });
  };

  const bank = {
    name: 'Хаан Банк (Khan Bank)',
    account: '5222111351',
    holder: 'Naranbadrakh (Наранбадрах)',
    price: '15,000 ₮',
    description: '1 сарын хугацаанд Хятад хэлний бүх түвшний хичээл, дасгал, сонсгол болон жишиг шалгалтуудыг хязгааргүй ашиглах эрх.',
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12" id="payment-page">
      {showTrialExpiredBanner && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-orange-50 border border-orange-100 text-orange-900 rounded-3xl font-black text-center text-sm shadow-md"
          id="trial-expired-banner"
        >
          ⏰ Таны үнэгүй туршилтын хугацаа дууслаа. Доорх дансанд шилжүүлэг хийж хандалтаа нээгээрэй.
        </motion.div>
      )}

      {/* Header section with generous space */}
      <div className="text-center space-y-4">
        <span className="text-4xl">💎</span>
        <h1 className="text-4xl font-black text-ink tracking-tight">1 Сарын Хандалт нээх</h1>
        <p className="text-sm font-semibold text-ink/60 max-w-xl mx-auto">
          Хятад хэл сурах аяллаараа тасралтгүй суралцаж, HSK шалгалтууддаа бэлдээрэй.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Bank Transfer Instruction Details */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-7 bg-white rounded-[3rem] border border-border-sub shadow-xl p-8 space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-ink">Шилжүүлэг хийх заавар</h2>
            <p className="text-sm text-ink/75 leading-relaxed">
              Та доорх данс руу хандалтын хураамж болох <b>{bank.price}</b>-ийг шилжүүлж,
              гүйлгээний утга дээр өөрийн <b>систем дэх ID</b>-г оруулна уу. Төлбөр хийгдсэний дараа баруун талын <b>"Би төлсөн"</b> товчийг дараарай.
            </p>
          </div>

          {/* Bank Details Card */}
          <div className="p-6 bg-bg-soft rounded-3xl border border-border-sub/60 space-y-6">
            <div className="flex items-center gap-4">
              <KhanBankLogo />
              <div>
                <h3 className="font-extrabold text-ink text-lg leading-tight">{bank.name}</h3>
                <p className="text-[11px] text-emerald-800 font-black uppercase tracking-wider">Шилжүүлэг хүлээн авагч данс</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border-sub/40 text-sm">
              <div>
                <span className="text-[10px] text-ink/40 font-black uppercase tracking-wider">Дансны дугаар</span>
                <div className="text-ink font-black text-lg select-all bg-white py-2 px-3 rounded-xl border border-border-sub inline-block mt-1">
                  {bank.account}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-ink/40 font-black uppercase tracking-wider">Гүйлгээний дүн</span>
                <div className="text-primary-orange font-black text-lg py-2 mt-1">
                  {bank.price}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-ink/40 font-black uppercase tracking-wider">Хүлээн авагч</span>
                <div className="text-ink font-extrabold text-base mt-1">
                  {bank.holder}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-ink/40 font-black uppercase tracking-wider">Гүйлгээний утга (Маш чухал)</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-emerald-700 font-mono font-black text-base select-all bg-white py-2 px-3 rounded-xl border border-border-sub inline-block">
                    {shortId || 'Таны хэрэглэгчийн ID'}
                  </div>
                  {shortId && (
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-xl border border-border-sub bg-white hover:bg-bg-soft transition-colors text-ink/70 hover:text-ink cursor-pointer focus:outline-none shrink-0"
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

          {/* Guarantee / Info Alerts */}
          <div className="flex gap-4 p-5 bg-amber-50 border border-amber-100 rounded-3xl text-xs text-amber-900 leading-relaxed font-semibold">
            <Shield className="w-5 h-5 text-primary-orange shrink-0 mt-0.5" />
            <div>
              Төлбөр шилжиж ирсэн даруйд манай админууд шалгаад <b>9 цагаас өмнө хандалтыг шууд идэвхжүүлэх</b> болно. Хэрэв асуудал гарвал манай сургалтын төвтэй холбогдоорой.
            </div>
          </div>
        </motion.div>

        {/* Right Side: Interactive Payment Card (EmailJS submission) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-5"
        >
          <PaymentCard />
        </motion.div>
      </div>
    </div>
  );
}
