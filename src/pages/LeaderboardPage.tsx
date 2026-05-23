import { useEffect, useState } from 'react';
import { getWeeklyLeaderboard } from '../lib/db';
import { motion } from 'framer-motion';
import { Trophy, ChevronLeft, Medal, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const data = await getWeeklyLeaderboard(20);
        setLeaders(data);
      } catch (error) {
        console.error('Leaderboard error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard"
            className="w-10 h-10 rounded-full border border-border-sub flex items-center justify-center hover:border-primary-orange transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-black text-ink tracking-tight flex items-center gap-3">
            Лидерүүд
          </h1>
        </div>
        <div className="bg-primary-orange/10 text-primary-orange px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary-orange/20">
          Энэ долоо хоног
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-border-sub shadow-xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin" />
            <p className="text-ink/40 font-bold uppercase tracking-widest">Ачаалж байна...</p>
          </div>
        ) : leaders.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="text-4xl">🌵</div>
            <p className="text-ink/60 font-medium">Одоогоор оноо цуглуулсан суралцагч алга.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-sub/50">
            {leaders.map((leader, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-6 p-6 transition-all ${index < 3 ? 'bg-orange-50/20' : 'hover:bg-bg-soft'}`}
              >
                <div className="w-10 flex justify-center">
                  {index < 3 ? (
                    <Medal className={`w-8 h-8 ${
                      index === 0 ? 'text-yellow-400 drop-shadow-sm' : 
                      index === 1 ? 'text-slate-400' : 
                      'text-orange-400'
                    }`} />
                  ) : (
                    <span className="font-sans font-black text-lg text-ink/30">#{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-ink flex items-center gap-2">
                    {leader.displayName || 'Нууцлаг суралцагч'}
                    {index === 0 && <span className="text-xs bg-yellow-400/20 text-yellow-700 px-2 py-0.5 rounded-md font-black">KING</span>}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-ink/40 font-black uppercase tracking-widest">Долоо хоногийн XP</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-primary-orange">+{leader.weeklyXp}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-bg-soft p-8 rounded-[32px] border border-border-sub text-center space-y-2">
        <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
        <h4 className="font-bold text-ink">Даваа гарагийн 00:00 цагт шинэчлэгдэнэ</h4>
        <p className="text-sm text-ink/60 font-medium">Шилдэг 3-т орж тусгай тэмдэг аваарай!</p>
      </div>
    </div>
  );
}
