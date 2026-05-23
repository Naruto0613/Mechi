import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../context/AuthContext';
import { saveUserProfile, getUserProfile, getLocalUserByEmail } from '../lib/db';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';
import { ShieldAlert, Zap, X, Loader2, Gift } from 'lucide-react';

// This panel is not secure. Move to a real backend before going to production.

export default function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { userId, isActive } = useUser();
  const { refreshProfile } = useAuth();
  const [targetUserId, setTargetUserId] = useState('');
  const [loading, setLoading] = useState(false);

  // Set the current user ID as initial query value for ease of testing
  useEffect(() => {
    if (userId) {
      setTargetUserId(userId);
    }
  }, [userId]);

  // Global keydown listener for Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleActivateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify current user has admin permissions
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error('Админ эрх шаардлагатай (Нэвтрээгүй байна).');
      return;
    }
    const isCurrentUserAdmin = currentUser.uid === 'KlSSLp05vSdk5JtJb4Xr0OVhkbH2' || currentUser.email === 'naranbadrakh1013@gmail.com';
    if (!isCurrentUserAdmin) {
      toast.error('Танд админ эрх байхгүй байна.');
      return;
    }

    if (!targetUserId.trim()) {
      toast.error('User ID оруулна уу.');
      return;
    }

    const cleanInput = targetUserId.trim();
    setLoading(true);

    try {
      let targetUid = cleanInput;
      let foundUserEmail = '';

      // Try searching by direct UID in Firestore first
      const uidProfile = await getUserProfile(cleanInput);
      if (uidProfile && uidProfile.uid) {
        targetUid = uidProfile.uid;
        foundUserEmail = uidProfile.email || '';
      } else {
        // If not found by ID, try searching by email
        const emailProfile = await getLocalUserByEmail(cleanInput);
        if (emailProfile && emailProfile.uid) {
          targetUid = emailProfile.uid;
          foundUserEmail = emailProfile.email || '';
        }
      }

      if (!targetUid || targetUid === 'undefined') {
        throw new Error('Код эсвэл Имэйл хаяг буруу байна.');
      }

      // Activate user subscription for 30 days
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);

      const updatePayload = {
        isPaid: true,
        isActive: true,
        paidUntil: expiry.toISOString(),
        expiryDate: expiry.toISOString(),
        paymentPending: false,
        isTrial: false,
      };

      // Perform the Firestore write
      await saveUserProfile(targetUid, updatePayload as any);
      
      console.log('Firestore write success: Activated user subscription.', {
        targetUid,
        email: foundUserEmail,
        payload: updatePayload
      });

      toast.success(`Хэрэглэгч ${foundUserEmail || targetUid} амжилттай идэвхжлээ! 🎉 (30 хоног)`);
      
      // Sync local profile state immediately
      await refreshProfile();
      
      // Close admin panel on success
      setTimeout(() => {
        setIsOpen(false);
      }, 800);
    } catch (err) {
      console.error('Firestore write error in handleActivateUser:', err);
      toast.error('Идэвхжүүлэх явцад алдаа гарлаа. Дахин шалгана уу.');
    } finally {
      setLoading(false);
    }
  };

  const handleGiveTrial = async () => {
    // Verify current user has admin permissions
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error('Админ эрх шаардлагатай (Нэвтрээгүй байна).');
      return;
    }
    const isCurrentUserAdmin = currentUser.uid === 'KlSSLp05vSdk5JtJb4Xr0OVhkbH2' || currentUser.email === 'naranbadrakh1013@gmail.com';
    if (!isCurrentUserAdmin) {
      toast.error('Танд админ эрх байхгүй байна.');
      return;
    }

    if (!targetUserId.trim()) return toast.error('Хэрэглэгчийн ID эсвэл Имэйл оруулна уу');
    
    setLoading(true);
    try {
      const cleanInput = targetUserId.trim();
      let targetUid = cleanInput;
      let foundUserEmail = '';

      // Try searching by direct UID in Firestore first
      const uidProfile = await getUserProfile(cleanInput);
      if (uidProfile && uidProfile.uid) {
        targetUid = uidProfile.uid;
        foundUserEmail = uidProfile.email || '';
      } else {
        // If not found by ID, try searching by email
        const emailProfile = await getLocalUserByEmail(cleanInput);
        if (emailProfile && emailProfile.uid) {
          targetUid = emailProfile.uid;
          foundUserEmail = emailProfile.email || '';
        }
      }

      if (!targetUid || targetUid === 'undefined') {
        throw new Error('Код эсвэл Имэйл хаяг буруу байна.');
      }

      // Give 1 Day Trial
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24); // Exactly 1 day (24 hours)

      const updatePayload = {
        isPaid: true,
        isActive: true,
        paidUntil: expiry.toISOString(),
        expiryDate: expiry.toISOString(),
        paymentPending: false,
        isTrial: true,
      };

      await saveUserProfile(targetUid, updatePayload as any);

      console.log('Firestore write success: Granted trial to user.', {
        targetUid,
        email: foundUserEmail,
        payload: updatePayload
      });

      toast.success(`Хэрэглэгч ${foundUserEmail || targetUid} амжилттай 1 өдрийн туршилт авлаа! 🎉`);
      await refreshProfile();
      
      // Close admin panel on success
      setTimeout(() => {
        setIsOpen(false);
      }, 800);
    } catch (err) {
      console.error('Firestore write error in handleGiveTrial:', err);
      toast.error('Туршилт олгоход алдаа гарлаа. Дахин шалгана уу.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-200" id="admin-panel-component">
      <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative space-y-4">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          title="Хаах"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          <span>ADMIN PANEL (Ctrl+Shift+A)</span>
        </div>

        <p className="text-[10px] text-red-400 leading-relaxed font-bold border-l-2 border-red-500 pl-2">
          АНХААР: This panel is not secure. Move to a real backend before going to production.
        </p>

        <form onSubmit={handleActivateUser} className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              User ID эсвэл Имэйл хаяг
            </label>
            <input
              type="text"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="user_XXXXX эсвэл Имэйл оруулна уу"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 flex items-center justify-center gap-1.5 transition-all text-center disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
              )}
              <span>Activate (30d)</span>
            </button>

            <button
              type="button"
              onClick={handleGiveTrial}
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-slate-800 text-white border border-indigo-500/30 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Gift className="w-3.5 h-3.5 text-white" />
              )}
              <span>Give Trial (1d)</span>
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-400">
          <span className="truncate max-w-[150px]">ID: {userId}</span>
          <span>Төлөв: {isActive ? 'Идэвхтэй ✅' : 'Идэвхгүй ❌'}</span>
        </div>
      </div>
    </div>
  );
}
