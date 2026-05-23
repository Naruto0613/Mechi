import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getUserProfile, saveUserProfile } from '../lib/db';
import { UserProfile } from '../types';
import { Toaster } from 'react-hot-toast';

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signup: (displayName: string, email: string, password: string) => Promise<UserProfile>;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  activateSubscription: (uid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const uid = firebaseUser.uid;
          const userProfile = await getUserProfile(uid);
          
          if (userProfile) {
            // Automatic expiry check: if expiryDate has passed, set isActive/isPaid to false in Firestore
            const now = Date.now();
            const expiryTime = userProfile.paidUntil ? Date.parse(userProfile.paidUntil) : null;
            
            if (expiryTime && now > expiryTime && userProfile.isPaid) {
              userProfile.isPaid = false;
              // Synchronously/Async update Firestore
              await saveUserProfile(uid, { isPaid: false });
            }
            
            setProfile(userProfile);
          } else {
            // Document does not exist for existing auth user, create it automatically with default values
            const initialDoc = {
              uid,
              email: firebaseUser.email || '',
              displayName: "",
              selectedLevel: "HSK1",
              totalXP: 0,
              weeklyXP: 0,
              streak: 0,
              lastStudiedDate: null,
              isActive: false,
              expiryDate: null,
              paymentPending: false,
              createdAt: new Date()
            };
            
            try {
              await setDoc(doc(db, 'users', uid), initialDoc);
            } catch (createErr) {
              console.warn('Failed to set initial user document (offline?):', createErr);
            }

            // Synthesize offline profile for localStorage
            const localRep = {
              uid,
              email: firebaseUser.email || '',
              displayName: "",
              selectedLevel: 1,
              totalXp: 0,
              currentStreak: 0,
              lastStudiedAt: null,
              createdAt: new Date().toISOString(),
              isPaid: false,
              paidUntil: undefined,
              paymentPending: false,
              totalXP: 0,
              weeklyXP: 0,
              streak: 0,
              lastStudiedDate: null,
              isActive: false,
              expiryDate: null
            };
            try {
              localStorage.setItem(`cached_profile_${uid}`, JSON.stringify(localRep));
            } catch (e) {}

            const freshProfile = await getUserProfile(uid);
            if (freshProfile) {
              setProfile(freshProfile);
            } else {
              setProfile(localRep as any);
            }
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('onAuthStateChanged error:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const userProfile = await getUserProfile(auth.currentUser.uid);
      if (userProfile) {
        setProfile(userProfile);
      }
    }
  };

  const signup = async (displayName: string, email: string, password: string): Promise<UserProfile> => {
    const credentials = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    const user = credentials.user;
    const uid = user.uid;
    const cleanEmail = (user.email || email.trim()).toLowerCase();

    // 1. One trial per device fingerprinting
    let deviceId = '';
    try {
      const raw = navigator.userAgent + screen.width + screen.height + navigator.language;
      let hash = 0;
      for (let i = 0; i < raw.length; i++) {
        hash = (hash << 5) - hash + raw.charCodeAt(i);
        hash |= 0;
      }
      deviceId = `dev_${Math.abs(hash)}`;
      localStorage.setItem('deviceId', deviceId);
    } catch (err) {
      console.error('Device ID Generation Error:', err);
      deviceId = `fallback_${uid}`;
    }

    // 2. Perform abuse checks
    let emailCheckPassed = true;
    try {
      const emailDoc = await getDoc(doc(db, 'usedTrials', cleanEmail));
      if (emailDoc.exists()) {
        emailCheckPassed = false;
      }
    } catch (err) {
      console.error('usedTrials check failed:', err);
      emailCheckPassed = false;
    }

    let deviceCheckPassed = true;
    try {
      const deviceDoc = await getDoc(doc(db, 'usedTrialDevices', deviceId));
      if (deviceDoc.exists()) {
        deviceCheckPassed = false;
      }
    } catch (err) {
      console.error('usedTrialDevices check failed:', err);
      deviceCheckPassed = false;
    }

    const trialEligible = true;
    const now = new Date();
    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // exactly 1 day

    const initialDoc: any = {
      uid,
      email: cleanEmail,
      displayName: displayName || "",
      selectedLevel: 1, // Store level index or default
      totalXp: 0,
      weeklyXP: 0,
      streak: 0,
      lastStudiedDate: null,
      paymentPending: false,
      createdAt: now.toISOString(),
    };

    if (trialEligible) {
      initialDoc.isActive = true;
      initialDoc.isPaid = true;
      initialDoc.expiryDate = expiry.toISOString();
      initialDoc.paidUntil = expiry.toISOString();
      initialDoc.isTrial = true;
      initialDoc.trialEligibilityCheckFailed = false;

      // Create used mark docs
      try {
        await setDoc(doc(db, 'usedTrials', cleanEmail), {
          email: cleanEmail,
          usedAt: now.toISOString(),
          userId: uid
        });

        await setDoc(doc(db, 'usedTrialDevices', deviceId), {
          deviceId: deviceId,
          usedAt: now.toISOString(),
          userId: uid
        });
      } catch (logErr) {
        console.error('Error logging trial abuse markers:', logErr);
      }
    } else {
      initialDoc.isActive = false;
      initialDoc.isPaid = false;
      initialDoc.expiryDate = null;
      initialDoc.paidUntil = null;
      initialDoc.isTrial = false;
      initialDoc.trialEligibilityCheckFailed = true;
    }

    // Use setDoc with the user's Firebase UID as the document ID immediately after signup
    await setDoc(doc(db, 'users', uid), initialDoc);

    const userProfile = await getUserProfile(uid);
    if (!userProfile) {
      throw new Error('Бүртгэл амжилттай үүссэн ч хэрэглэгчийн мэдээллийг уншиж чадсангүй.');
    }

    setProfile(userProfile);
    return userProfile;
  };

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const credentials = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    const userProfile = await getUserProfile(credentials.user.uid);
    if (!userProfile) {
      throw new Error('Хэрэглэгчийн мэдээлэл олдсонгүй.');
    }
    setProfile(userProfile);
    return userProfile;
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  const forgotPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  };

  const activateSubscription = async (uid: string) => {
    const duration = new Date();
    duration.setDate(duration.getDate() + 30); // 30 days
    
    await saveUserProfile(uid, {
      isPaid: true,
      paidUntil: duration.toISOString(),
      paymentPending: false
    } as any);

    if (auth.currentUser && auth.currentUser.uid === uid) {
      await refreshProfile();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      profile, 
      loading, 
      refreshProfile,
      signup,
      login,
      logout,
      forgotPassword,
      activateSubscription
    }}>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#fff',
            color: '#1a1a1a',
            fontSize: '14px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '12px 18px',
          },
          success: {
            iconTheme: {
              primary: '#F97316',
              secondary: '#fff',
            },
          },
        }}
      />
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin" />
            <p className="text-ink/60 font-medium animate-pulse">Уншиж байна...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
