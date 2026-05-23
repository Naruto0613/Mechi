import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      return toast.error('Зөв имэйл хаяг оруулна уу');
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('Нууц үг шинэчлэх холбоос таны имэйл хаяг руу илгээгдлээ!');
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа. Та дахин оролдоно үү.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4" id="forgot-password-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-border-sub shadow-xl space-y-8"
      >
        <div className="flex items-center gap-2">
          <Link to="/login" className="p-2 hover:bg-bg-soft rounded-full text-ink/60 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs font-black uppercase tracking-widest text-ink/40">Буцах</span>
        </div>

        <div className="text-center space-y-2">
          <span className="text-4xl">🔐</span>
          <h2 className="text-3xl font-black text-ink">Нууц үг сэргээх</h2>
          <p className="text-sm text-ink/60 font-medium">Та бүртгэлтэй имэйл хаягаа оруулна уу</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary-orange text-white rounded-2xl font-bold text-sm shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Илгээж байна...' : 'Шинэчлэх холбоос илгээх'}
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-xs text-ink/40 font-bold">Буцаж </span>
          <Link to="/login" className="text-xs text-primary-orange font-bold hover:underline">Нэвтрэх</Link>
        </div>
      </motion.div>
    </div>
  );
}
