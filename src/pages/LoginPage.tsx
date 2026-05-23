import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return toast.error('Зөв имэйл хаяг оруулна уу');
    if (!password) return toast.error('Нууц үгээ оруулна уу');

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Амжилттай нэвтэрлээ!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Имэйл эсвэл нууц үг буруу байна.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-border-sub shadow-xl space-y-8"
      >
        <div className="text-center space-y-2">
          <span className="text-4xl">🐼</span>
          <h2 className="text-3xl font-black text-ink">Нэвтрэх</h2>
          <p className="text-sm text-ink/60 font-medium">Күнзийн хэлний сургалтаа үргэлжлүүлнэ үү</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
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
            <div className="flex justify-end pr-1 pt-1">
              <Link to="/forgot-password" className="text-xs text-ink/40 hover:text-primary-orange font-bold transition-all">
                Нууц үг мартсан уу?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary-orange text-white rounded-2xl font-bold text-sm shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3 text-orange-800 text-xs">
          <ShieldCheck className="w-6 h-6 text-primary-orange shrink-0" />
          <div className="font-semibold leading-relaxed">
            Сургалтын систем нь сар бүр 15,000₮-ийн идэвхжүүлэлт шаардана. Хэрэв бүртгэлгүй бол бүртгүүлж идэвхжүүлнэ үү.
          </div>
        </div>

        <div className="text-center pt-2">
          <span className="text-xs text-ink/40 font-bold">Бүртгэлгүй байгаа юу? </span>
          <Link to="/signup" className="text-xs text-primary-orange font-bold hover:underline">Бүртгүүлэх</Link>
        </div>
      </motion.div>
    </div>
  );
}
