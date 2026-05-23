import React, { useState, useEffect } from 'react';
import emailjs from 'emailjs-com';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../context/AuthContext';
import { saveUserProfile } from '../lib/db';
import toast from 'react-hot-toast';
import { CreditCard, Mail, CheckCircle, Smartphone } from 'lucide-react';

export function sendPaymentEmail(userId: string, email: string) {
  const serviceId = 'service_2ybfufs';
  const templateId = 'template_rn2r8qs';
  const publicKey = 'VgKHxGRWiboT5_nY1';

  const templateParams = {
    user_id: userId,
    user_email: email,
    message: 'User paid 15000 MNT for 1 month access'
  };

  return emailjs.send(serviceId, templateId, templateParams, publicKey);
}

export default function PaymentCard() {
  const { userId, email, updateEmail, isActive, paymentPending } = useUser();
  const { profile, refreshProfile } = useAuth();
  
  const [emailInput, setEmailInput] = useState(email);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const shortId = userId ? userId.slice(0, 8).toUpperCase() : '';

  // Sync state if hook finishes loading
  useEffect(() => {
    setEmailInput(email);
  }, [email]);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      toast.error('Зөв имэйл хаяг оруулна уу.');
      return;
    }
    await updateEmail(emailInput.trim());
    setIsEditingEmail(false);
    toast.success('Имэйл хаяг шинэчлэгдлээ.');
  };

  const handlePayClick = async () => {
    if (!userId) return;
    setSubmitting(true);
    try {
      // 1. Send Email using EmailJS
      await sendPaymentEmail(userId, emailInput);
      
      // 2. Save paymentPending: true in Firestore and sync auth profile
      await saveUserProfile(userId, { paymentPending: true } as any);
      await refreshProfile();
      
      toast.success('Төлбөрийн мэдээлэл илгээгдлээ. Бид шалгаад эрхийг идэвхжүүлэх болно!');
    } catch (error) {
      console.error('EmailJS Error:', error);
      toast.error('Алдаа гарлаа, дахин оролдоно уу');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-border-sub shadow-xl p-6 sm:p-8 space-y-6 max-w-md mx-auto relative overflow-hidden" id="payment-card-component">
      {isActive && !profile?.isTrial && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">
          СУРАЛЦАХ ЭРХ ИДЭВХТЭЙ
        </div>
      )}
      {isActive && profile?.isTrial && (
        <div className="absolute top-0 right-0 bg-orange-500 text-white font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">
          ТУРШИЛТЫН ХАНДАЛТ
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0">
          🔑
        </div>
        <div>
          <h3 className="font-black text-ink text-lg">1 Сарын Хандалт</h3>
          <p className="text-xs text-ink/50 font-medium">Хятад хэл сурах бүрэн боломж</p>
        </div>
      </div>

      <div className="p-5 bg-bg-soft rounded-2xl border border-border-sub/40 flex justify-between items-center">
        <span className="font-bold text-ink text-sm">Сургалтын хураамж</span>
        <span className="text-2xl font-black text-primary-orange">15,000₮</span>
      </div>

      <div className="space-y-3 pt-2 text-xs font-medium text-ink/75 leading-relaxed">
        <div className="flex items-center gap-2">
          <span className="text-emerald-500">✓</span> HSK 1-6 түвшний бүх үгс, дүрэм
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-500">✓</span> Сонсгол, унших, дасгал хичээлүүд
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-500">✓</span> Ухаалаг жишиг шалгалт өгөх эрх
        </div>
      </div>

      <div className="border-t border-border-sub/50 pt-4 space-y-3 text-xs">
        <div>
          <span className="text-ink/40 font-bold uppercase tracking-wider text-[10px]">Таны систем дэх ID</span>
          <div className="bg-bg-soft border border-border-sub/80 px-3 py-2 rounded-xl text-ink font-mono font-bold mt-1 select-all">
            {shortId || 'Уншиж байна...'}
          </div>
        </div>

        <div>
          <span className="text-ink/40 font-bold uppercase tracking-wider text-[10px]">Бүртгэлтэй имэйл</span>
          {isEditingEmail ? (
            <form onSubmit={handleUpdateEmail} className="flex gap-2 mt-1">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 bg-white border-2 border-primary-orange px-3 py-1.5 rounded-xl font-medium focus:outline-none"
                placeholder="Имэйл хаяг оруулна уу"
                required
              />
              <button
                type="submit"
                className="px-3 bg-primary-orange text-white rounded-xl font-bold hover:opacity-90"
              >
                Хадгалах
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between bg-bg-soft border border-border-sub/80 px-3 py-2 rounded-xl mt-1">
              <span className="font-semibold text-ink/80 truncate">{email || 'mechi_user@mechi.mn'}</span>
              <button
                type="button"
                onClick={() => setIsEditingEmail(true)}
                className="text-primary-orange font-bold hover:underline"
              >
                Засах
              </button>
            </div>
          )}
        </div>
      </div>

      {paymentPending ? (
        <button
          disabled
          className="w-full py-4 bg-gray-100 text-gray-400 border border-gray-200 rounded-2xl font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5 text-gray-400" />
          <span>Захиалга хүлээгдэж байна</span>
        </button>
      ) : (
        <button
          onClick={handlePayClick}
          disabled={submitting || (isActive && !profile?.isTrial)}
          className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
            (isActive && !profile?.isTrial)
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed'
              : 'bg-primary-orange text-white hover:opacity-90'
         }`}
        >
          {submitting ? 'Илгээж байна...' : (isActive && !profile?.isTrial) ? 'Эрх идэвхжсэн байна' : 'Би төлсөн'}
        </button>
      )}

      {!paymentPending && (!isActive || profile?.isTrial) && (
        <p className="text-[10px] text-center text-ink/40 font-medium">
          "Би төлсөн" товчийг дарсны дараа манай админууд шалгаад хандалтыг идэвхжүүлэх болно.
        </p>
      )}
    </div>
  );
}
