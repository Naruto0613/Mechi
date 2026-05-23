import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Trophy, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-16 md:space-y-24 py-8 md:py-12">
      <section className="flex flex-col md:flex-row items-center gap-10 md:gap-12 pt-4 md:pt-8">
        <div className="flex-1 space-y-6 md:space-y-10 text-center md:text-left">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-ink leading-tight tracking-tight"
          >
            Хятад хэлийг <br />
            <span className="text-primary-orange">сонирхолтойгоор</span> сур
          </motion.h1>
          <p className="text-base sm:text-xl text-muted max-w-xl mx-auto md:mx-0 leading-relaxed font-semibold">
            HSK шалгалтанд бэлдэх хамгийн хялбар, үр дүнтэй арга. Монгол хэлээр тайлбарласан хичээлүүд, тоглоом хэлбэрийн дасгалууд.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <Link 
              to="/signup" 
              className="bg-primary-orange hover:opacity-90 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-[2rem] font-bold text-base sm:text-lg shadow-2xl shadow-orange-100 flex items-center gap-3 group transition-all"
            >
              Одоо эхлэх <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center w-full mt-6 md:mt-0">
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-56 h-56 sm:w-80 sm:h-80 bg-bg-orange rounded-[2rem] sm:rounded-[3rem] rotate-6 flex items-center justify-center p-5 sm:p-8 relative border border-border-sub"
          >
            <div className="w-full h-full bg-white rounded-[1.75rem] sm:rounded-[2.5rem] shadow-2xl flex items-center justify-center text-7xl sm:text-8xl font-black text-primary-orange -rotate-6">
              汉
            </div>
            <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-16 h-16 sm:w-24 sm:h-24 bg-primary-orange rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center text-white text-2xl sm:text-4xl shadow-lg border-2 sm:border-4 border-white">
              字
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-border-sub shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-bg-orange rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
            📖
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 text-ink">Бүрэн Хөтөлбөр</h3>
          <p className="text-xs sm:text-sm text-muted leading-relaxed font-semibold">HSK 1-ээс 6 хүртэлх бүх түвшний үгсийн сан, дүрэм, сонсголын дасгалууд.</p>
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-border-sub shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
            💎
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 text-ink">XP ба Оноо</h3>
          <p className="text-xs sm:text-sm text-muted leading-relaxed font-semibold">Дасгалаа ажиллаад XP цуглуулж, өөрийн ахиц дэвшлээ хянаарай.</p>
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] col-span-2 sm:col-span-1 border border-border-sub shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
            🏆
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 text-ink">Жишиг Шалгалт</h3>
          <p className="text-xs sm:text-sm text-muted leading-relaxed font-semibold">Бодит HSK шалгалтын хэлбэрээр өөрийгөө сорьж, бэлэн болоорой.</p>
        </div>
      </section>
    </div>
  );
}
