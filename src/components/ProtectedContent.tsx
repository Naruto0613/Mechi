import React from 'react';
import { useUser } from '../hooks/useUser';
import PaymentCard from './PaymentCard';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

// This system uses localStorage and is not secure. For production, use backend + real payment API.

interface ProtectedContentProps {
  children: React.ReactNode;
}

export default function ProtectedContent({ children }: ProtectedContentProps) {
  const { isActive } = useUser();

  if (isActive) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center p-4">
      {/* Blurred mock content in the background for visual context */}
      <div className="absolute inset-0 filter blur-[8px] opacity-20 pointer-events-none select-none overflow-hidden">
        <div className="max-w-4xl mx-auto p-8 space-y-6">
          <div className="h-8 bg-ink rounded-lg w-1/3" />
          <div className="space-y-3">
            <div className="h-4 bg-ink rounded w-full" />
            <div className="h-4 bg-ink rounded w-5/6" />
            <div className="h-4 bg-ink rounded w-4/5" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-ink rounded-xl" />
            <div className="h-32 bg-ink rounded-xl" />
          </div>
        </div>
      </div>

      {/* Access overlay */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg mx-auto py-8 sm:py-12 px-4 flex flex-col items-center text-center space-y-6"
      >
        <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-3xl shadow-sm animate-pulse">
          🔒
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-ink">
            Purchase access to continue learning Chinese
          </h2>
          <p className="text-sm font-semibold text-ink/60 max-w-md mx-auto">
            Mechi платформ хятад хэл сурах бүх хэрэгсэл, шалгалтуудаа нээн суралцахыг урьж байна.
          </p>
        </div>

        <div className="w-full">
          <PaymentCard />
        </div>
      </motion.div>
    </div>
  );
}
