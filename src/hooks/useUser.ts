import { useAuth } from "../context/AuthContext";
import { saveUserProfile } from "../lib/db";

export function useUser() {
  const { profile, refreshProfile } = useAuth();

  const userId = profile?.uid || "";
  const email = profile?.email || "";
  const expiryDate = profile?.paidUntil ? Date.parse(profile.paidUntil) : null;
  const isExpired = expiryDate ? Date.now() > expiryDate : false;
  const isActive = (profile?.isPaid || false) && !isExpired;
  const paymentPending = (profile as any)?.paymentPending || false;

  const updateEmail = async (newEmail: string) => {
    if (userId) {
      await saveUserProfile(userId, { email: newEmail });
      await refreshProfile();
    }
  };

  const activateUserSubscription = async (uid?: string, days: number = 30) => {
    const targetId = uid || userId;
    if (targetId) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + days);
      await saveUserProfile(targetId, {
        isPaid: true,
        paidUntil: expiry.toISOString(),
        paymentPending: false,
        isTrial: false,
      } as any);
      await refreshProfile();
    }
  };

  return {
    userId,
    email,
    isActive,
    expiryDate,
    paymentPending,
    updateEmail,
    activateUserSubscription,
  };
}
