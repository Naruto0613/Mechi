import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  increment,
  onSnapshot,
} from "firebase/firestore";
import { db, auth, handleFirestoreError } from "./firebase";
import {
  HSKLevel,
  UserProfile,
  WordMastery,
  HSKProgress,
  OperationType,
} from "../types";
import { isYesterday, isToday } from "date-fns";

/**
 * User Profile & Progress
 */

export const getUserProfile = async (
  uid: string,
): Promise<UserProfile | null> => {
  if (!uid || uid === "undefined") {
    console.warn("getUserProfile was called with invalid or undefined uid");
    return null;
  }
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, "users", uid);
    let uDoc: any = null;
    let attempts = 0;
    while (attempts < 3) {
      try {
        uDoc = await getDoc(userDocRef);
        break;
      } catch (err: any) {
        if (err.message?.includes("permission") && attempts < 2) {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 300));
        } else {
          throw err;
        }
      }
    }
    if (uDoc && uDoc.exists()) {
      const data = uDoc.data();
      const isPaidUser =
        data.isActive !== undefined
          ? data.isActive
          : data.isPaid !== undefined
            ? data.isPaid
            : false;
      const levelVal =
        typeof data.selectedLevel === "string"
          ? parseInt(data.selectedLevel.replace(/\D/g, ""), 10) || 1
          : data.selectedLevel || 1;
      const streakVal =
        data.streak !== undefined
          ? data.streak
          : data.currentStreak !== undefined
            ? data.currentStreak
            : 0;
      const xpVal =
        data.totalXP !== undefined
          ? data.totalXP
          : data.totalXp !== undefined
            ? data.totalXp
            : data.xp !== undefined
              ? data.xp
              : 0;

      const profileResult = {
        uid: data.uid || uid,
        email: data.email || "",
        displayName: data.displayName !== undefined ? data.displayName : "",
        selectedLevel: levelVal,
        totalXp: xpVal,
        currentStreak: streakVal,
        lastStudiedAt: data.lastStudiedDate || data.lastStudiedAt || null,
        createdAt: data.createdAt
          ? typeof data.createdAt.toDate === "function"
            ? data.createdAt.toDate().toISOString()
            : data.createdAt
          : null,
        isPaid: isPaidUser,
        paidUntil: data.expiryDate || data.paidUntil || undefined,
        paymentPending:
          data.paymentPending !== undefined ? data.paymentPending : false,
        totalXP: xpVal,
        weeklyXP:
          data.weeklyXP !== undefined
            ? data.weeklyXP
            : data.weeklyXp !== undefined
              ? data.weeklyXp
              : 0,
        streak: streakVal,
        lastStudiedDate: data.lastStudiedDate || data.lastStudiedAt || null,
        isActive: isPaidUser,
        expiryDate: data.expiryDate || data.paidUntil || null,
        isTrial: data.isTrial || false,
        trialEligibilityCheckFailed: data.trialEligibilityCheckFailed || false,
      } as any;

      try {
        localStorage.setItem(
          `cached_profile_${uid}`,
          JSON.stringify(profileResult),
        );
      } catch (err) {
        console.warn("Failed to save user profile to localStorage:", err);
      }

      return profileResult;
    }
    return null;
  } catch (error: any) {
    console.warn(
      "getUserProfile Firestore error, checking offline cache:",
      error,
    );
    try {
      const cached = localStorage.getItem(`cached_profile_${uid}`);
      if (cached) {
        console.log(
          "Successfully resolved user profile from offline localStorage cache.",
        );
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error("Failed to parse cached profile:", e);
    }

    const isOffline = error?.message?.includes("offline") || !navigator.onLine;
    if (isOffline) {
      console.warn(
        "Client is offline and no cached profile found. Returning default offline profile.",
      );
      return {
        uid,
        email: auth.currentUser?.email || "",
        displayName: auth.currentUser?.displayName || "",
        selectedLevel: 1,
        totalXp: 0,
        currentStreak: 0,
        lastStudiedAt: null,
        createdAt: new Date().toISOString(),
        isPaid: false,
        paymentPending: false,
        totalXP: 0,
        weeklyXP: 0,
        streak: 0,
        lastStudiedDate: null,
        isActive: false,
        expiryDate: null,
      } as any;
    }

    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const getLocalUserByEmail = async (
  email: string,
): Promise<UserProfile | null> => {
  const path = "users";
  try {
    const q = query(
      collection(db, "users"),
      where("email", "==", email.trim().toLowerCase()),
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const uDoc = querySnapshot.docs[0];
      const data = uDoc.data();
      const isPaidUser =
        data.isActive !== undefined
          ? data.isActive
          : data.isPaid !== undefined
            ? data.isPaid
            : false;
      const levelVal =
        typeof data.selectedLevel === "string"
          ? parseInt(data.selectedLevel.replace(/\D/g, ""), 10) || 1
          : data.selectedLevel || 1;
      const streakVal =
        data.streak !== undefined
          ? data.streak
          : data.currentStreak !== undefined
            ? data.currentStreak
            : 0;
      const xpVal =
        data.totalXP !== undefined
          ? data.totalXP
          : data.totalXp !== undefined
            ? data.totalXp
            : data.xp !== undefined
              ? data.xp
              : 0;

      return {
        uid: data.uid || uDoc.id,
        email: data.email || "",
        displayName: data.displayName !== undefined ? data.displayName : "",
        selectedLevel: levelVal,
        totalXp: xpVal,
        currentStreak: streakVal,
        lastStudiedAt: data.lastStudiedDate || data.lastStudiedAt || null,
        createdAt: data.createdAt
          ? typeof data.createdAt.toDate === "function"
            ? data.createdAt.toDate().toISOString()
            : data.createdAt
          : null,
        isPaid: isPaidUser,
        paidUntil: data.expiryDate || data.paidUntil || undefined,
        paymentPending:
          data.paymentPending !== undefined ? data.paymentPending : false,
        totalXP: xpVal,
        weeklyXP:
          data.weeklyXP !== undefined
            ? data.weeklyXP
            : data.weeklyXp !== undefined
              ? data.weeklyXp
              : 0,
        streak: streakVal,
        lastStudiedDate: data.lastStudiedDate || data.lastStudiedAt || null,
        isActive: isPaidUser,
        expiryDate: data.expiryDate || data.paidUntil || null,
      } as any;
    }
    return null;
  } catch (error: any) {
    console.warn("getLocalUserByEmail Firestore error:", error);
    const isOffline = error?.message?.includes("offline") || !navigator.onLine;
    if (isOffline) {
      console.warn(
        "Cannot perform search by email while offline, returning null.",
      );
      return null;
    }
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const saveUserProfile = async (
  uid: string,
  profile: Partial<UserProfile>,
) => {
  if (!uid || uid === "undefined") {
    console.warn(
      "saveUserProfile was called with invalid or undefined uid:",
      uid,
    );
    return;
  }
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, "users", uid);

    // Support both client and database naming conventions perfectly
    const dbPayload: any = {};

    if (profile.uid !== undefined) dbPayload.uid = profile.uid;
    if (profile.email !== undefined) dbPayload.email = profile.email;
    if (profile.displayName !== undefined)
      dbPayload.displayName = profile.displayName;

    if (profile.selectedLevel !== undefined) {
      dbPayload.selectedLevel =
        typeof profile.selectedLevel === "number"
          ? `HSK${profile.selectedLevel}`
          : profile.selectedLevel;
    }

    if (profile.totalXp !== undefined) {
      dbPayload.totalXp = profile.totalXp;
      dbPayload.xp = profile.totalXp;
      dbPayload.totalXP = profile.totalXp;
    } else if ((profile as any).totalXP !== undefined) {
      dbPayload.totalXP = (profile as any).totalXP;
      dbPayload.totalXp = (profile as any).totalXP;
      dbPayload.xp = (profile as any).totalXP;
    }

    if ((profile as any).weeklyXP !== undefined) {
      dbPayload.weeklyXP = (profile as any).weeklyXP;
    }

    if (profile.currentStreak !== undefined) {
      dbPayload.currentStreak = profile.currentStreak;
      dbPayload.streak = profile.currentStreak;
    } else if ((profile as any).streak !== undefined) {
      dbPayload.streak = (profile as any).streak;
      dbPayload.currentStreak = (profile as any).streak;
    }

    if (profile.createdAt !== undefined)
      dbPayload.createdAt = profile.createdAt;

    if (profile.isPaid !== undefined) {
      dbPayload.isPaid = profile.isPaid;
      dbPayload.isActive = profile.isPaid;
    } else if ((profile as any).isActive !== undefined) {
      dbPayload.isActive = (profile as any).isActive;
      dbPayload.isPaid = (profile as any).isActive;
    }

    if (profile.paidUntil !== undefined) {
      dbPayload.paidUntil = profile.paidUntil;
      dbPayload.expiryDate = profile.paidUntil;
    } else if ((profile as any).expiryDate !== undefined) {
      dbPayload.expiryDate = (profile as any).expiryDate;
      dbPayload.paidUntil = (profile as any).expiryDate;
    }

    if (profile.paymentPending !== undefined) {
      dbPayload.paymentPending = profile.paymentPending;
      if (profile.paymentPending === true) {
        dbPayload.paymentSubmittedAt = new Date().toISOString();
      }
    }

    if (profile.isTrial !== undefined) {
      dbPayload.isTrial = profile.isTrial;
    }

    if (profile.trialEligibilityCheckFailed !== undefined) {
      dbPayload.trialEligibilityCheckFailed =
        profile.trialEligibilityCheckFailed;
    }

    if (profile.lastStudiedAt !== undefined) {
      dbPayload.lastStudiedAt = profile.lastStudiedAt;
      dbPayload.lastStudiedDate = profile.lastStudiedAt;
    } else if ((profile as any).lastStudiedDate !== undefined) {
      dbPayload.lastStudiedDate = (profile as any).lastStudiedDate;
      dbPayload.lastStudiedAt = (profile as any).lastStudiedDate;
    }

    // Save to localStorage too for immediate offline availability
    try {
      const cached = localStorage.getItem(`cached_profile_${uid}`);
      const existing = cached ? JSON.parse(cached) : {};
      const merged = {
        ...existing,
        ...profile,
        // Make sure properties that map are written as expected in actual JS runtime
        totalXP:
          dbPayload.totalXP !== undefined
            ? dbPayload.totalXP
            : existing.totalXP !== undefined
              ? existing.totalXP
              : dbPayload.totalXp,
        totalXp:
          dbPayload.totalXp !== undefined
            ? dbPayload.totalXp
            : existing.totalXp !== undefined
              ? existing.totalXp
              : dbPayload.totalXP,
        streak:
          dbPayload.streak !== undefined
            ? dbPayload.streak
            : existing.streak !== undefined
              ? existing.streak
              : dbPayload.currentStreak,
        currentStreak:
          dbPayload.currentStreak !== undefined
            ? dbPayload.currentStreak
            : existing.currentStreak !== undefined
              ? existing.currentStreak
              : dbPayload.streak,
        isPaid:
          dbPayload.isPaid !== undefined ? dbPayload.isPaid : existing.isPaid,
        isActive:
          dbPayload.isActive !== undefined
            ? dbPayload.isActive
            : existing.isActive,
      };
      localStorage.setItem(`cached_profile_${uid}`, JSON.stringify(merged));
    } catch (e) {
      console.warn("Failed to update local cache:", e);
    }

    await setDoc(userDocRef, dbPayload, { merge: true });
  } catch (error: any) {
    console.warn("saveUserProfile Firestore error (offline?):", error);
    const isOffline = error?.message?.includes("offline") || !navigator.onLine;
    if (isOffline) {
      console.log(
        "Saved to local storage successfully. App operation is offline-ready.",
      );
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateStudyStreak = async (uid: string) => {
  if (!uid) return;
  const path = `users/${uid}`;
  try {
    let user: any = null;
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        user = userDoc.data();
      }
    } catch (e) {
      console.warn("updateStudyStreak check failed, using cache:", e);
      const cached = localStorage.getItem(`cached_profile_${uid}`);
      if (cached) {
        user = JSON.parse(cached);
      }
    }

    if (!user) {
      // Create deep fallback if still no user profile found
      user = { streak: 0, currentStreak: 0 };
    }

    const lastStudiedAt = user.lastStudiedDate || user.lastStudiedAt || null;
    const lastStudiedDateObj = lastStudiedAt ? new Date(lastStudiedAt) : null;
    const now = new Date();

    let newStreak =
      user.streak !== undefined
        ? user.streak
        : user.currentStreak !== undefined
          ? user.currentStreak
          : 0;

    if (!lastStudiedDateObj) {
      newStreak = 1;
    } else if (isToday(lastStudiedDateObj)) {
      // Already studied today
    } else if (isYesterday(lastStudiedDateObj)) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    const updates = {
      streak: newStreak,
      currentStreak: newStreak,
      lastStudiedDate: now.toISOString(),
      lastStudiedAt: now.toISOString(),
    };

    try {
      const cached = localStorage.getItem(`cached_profile_${uid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const merged = { ...parsed, ...updates };
        localStorage.setItem(`cached_profile_${uid}`, JSON.stringify(merged));
      }
    } catch (e) {}

    try {
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, updates, { merge: true });
    } catch (firebaseErr: any) {
      console.warn(
        "Failed to update streak in Firestore (offline?):",
        firebaseErr,
      );
      const isOffline =
        firebaseErr?.message?.includes("offline") || !navigator.onLine;
      if (!isOffline) {
        throw firebaseErr;
      }
    }

    return newStreak;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const addXp = async (uid: string, amount: number) => {
  if (!uid) return;
  const path = `users/${uid}`;
  try {
    try {
      const cached = localStorage.getItem(`cached_profile_${uid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.totalXp = (parsed.totalXp || 0) + amount;
        parsed.totalXP = (parsed.totalXP || 0) + amount;
        localStorage.setItem(`cached_profile_${uid}`, JSON.stringify(parsed));
      }
    } catch (e) {}

    try {
      const userDocRef = doc(db, "users", uid);
      await setDoc(
        userDocRef,
        {
          xp: increment(amount),
          totalXp: increment(amount),
          totalXP: increment(amount),
        },
        { merge: true },
      );
    } catch (firebaseErr: any) {
      console.warn("Failed to save XP in firestore (offline?):", firebaseErr);
      const isOffline =
        firebaseErr?.message?.includes("offline") || !navigator.onLine;
      if (!isOffline) {
        throw firebaseErr;
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * Vocabulary & Mastery
 */

export const getWordMastery = async (
  uid: string,
): Promise<Record<string, WordMastery>> => {
  if (!uid) return {};
  const path = `users/${uid}/mastery`;
  try {
    const colRef = collection(db, "users", uid, "mastery");
    const snapshot = await getDocs(colRef);
    const mastery: Record<string, WordMastery> = {};
    snapshot.forEach((doc) => {
      mastery[doc.id] = doc.data() as WordMastery;
    });

    try {
      localStorage.setItem(`cached_mastery_${uid}`, JSON.stringify(mastery));
    } catch (e) {}

    return mastery;
  } catch (error: any) {
    console.warn("getWordMastery Firestore error, reading cache:", error);
    try {
      const cached = localStorage.getItem(`cached_mastery_${uid}`);
      if (cached) {
        console.log("Successfully loaded Word Mastery from local cache.");
        return JSON.parse(cached);
      }
    } catch (e) {}

    const isOffline = error?.message?.includes("offline") || !navigator.onLine;
    if (isOffline) {
      return {};
    }
    handleFirestoreError(error, OperationType.GET, path);
    return {};
  }
};

export const updateWordMastery = async (
  uid: string,
  wordId: string,
  isCorrect: boolean,
) => {
  if (!uid) return;
  const path = `users/${uid}/mastery/${wordId}`;
  try {
    let current: WordMastery | null = null;

    try {
      const cached = localStorage.getItem(`cached_mastery_${uid}`);
      const mastery = cached ? JSON.parse(cached) : {};
      if (mastery[wordId]) {
        current = mastery[wordId];
      }
    } catch (e) {}

    if (!current) {
      try {
        const masteryDocRef = doc(db, "users", uid, "mastery", wordId);
        const mDoc = await getDoc(masteryDocRef);
        if (mDoc.exists()) {
          current = mDoc.data() as WordMastery;
        }
      } catch (e) {
        console.warn("Failed to read word mastery from firestore", e);
      }
    }

    if (!current) {
      current = {
        wordId,
        status: "new" as const,
        correctCount: 0,
        wrongCount: 0,
        lastSeenAt: new Date().toISOString(),
      };
    }

    if (isCorrect) current.correctCount++;
    else current.wrongCount++;

    if (current.correctCount >= 5) current.status = "mastered";
    else if (current.correctCount > 0) current.status = "learning";

    current.lastSeenAt = new Date().toISOString();

    try {
      const cached = localStorage.getItem(`cached_mastery_${uid}`);
      const mastery = cached ? JSON.parse(cached) : {};
      mastery[wordId] = current;
      localStorage.setItem(`cached_mastery_${uid}`, JSON.stringify(mastery));
    } catch (e) {}

    try {
      const masteryDocRef = doc(db, "users", uid, "mastery", wordId);
      await setDoc(masteryDocRef, current);
    } catch (firebaseErr: any) {
      console.warn(
        "Failed to save word mastery to firestore (offline?):",
        firebaseErr,
      );
      const isOffline =
        firebaseErr?.message?.includes("offline") || !navigator.onLine;
      if (!isOffline) {
        throw firebaseErr;
      }
    }

    if (isCorrect) {
      await addXp(uid, 10);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getHSKProgress = async (
  uid: string,
  level: HSKLevel,
): Promise<HSKProgress | null> => {
  if (!uid) return null;
  const levelKey = `hsk${level}`;
  const path = `users/${uid}/progress/${levelKey}`;
  try {
    const progressDocRef = doc(db, "users", uid, "progress", levelKey);
    const pDoc = await getDoc(progressDocRef);
    if (pDoc.exists()) {
      const progress = pDoc.data() as HSKProgress;
      try {
        localStorage.setItem(
          `cached_progress_${uid}_${levelKey}`,
          JSON.stringify(progress),
        );
      } catch (e) {}
      return progress;
    }
    return null;
  } catch (error: any) {
    console.warn("getHSKProgress Firestore error, checking cache:", error);
    try {
      const cached = localStorage.getItem(`cached_progress_${uid}_${levelKey}`);
      if (cached) {
        console.log("Successfully loaded progress from local cache.");
        return JSON.parse(cached);
      }
    } catch (e) {}

    const isOffline = error?.message?.includes("offline") || !navigator.onLine;
    if (isOffline) {
      return null;
    }
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const updateHSKProgress = async (
  uid: string,
  level: HSKLevel,
  updates: Partial<HSKProgress>,
) => {
  if (!uid) return;
  const levelKey = `hsk${level}`;
  const path = `users/${uid}/progress/${levelKey}`;
  try {
    let current: HSKProgress | null = null;
    try {
      const cached = localStorage.getItem(`cached_progress_${uid}_${levelKey}`);
      if (cached) {
        current = JSON.parse(cached);
      }
    } catch (e) {}

    if (!current) {
      try {
        const progressDocRef = doc(db, "users", uid, "progress", levelKey);
        const pDoc = await getDoc(progressDocRef);
        if (pDoc.exists()) {
          current = pDoc.data() as HSKProgress;
        }
      } catch (e) {
        console.warn("Failed to read HSK progress from firestore", e);
      }
    }

    if (!current) {
      current = {
        vocabularyCompleted: 0,
        grammarCompleted: 0,
        listeningCompleted: 0,
        readingCompleted: 0,
        mockExamHighScore: 0,
        updatedAt: new Date().toISOString(),
      };
    }

    const nextData = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        `cached_progress_${uid}_${levelKey}`,
        JSON.stringify(nextData),
      );
    } catch (e) {}

    try {
      const progressDocRef = doc(db, "users", uid, "progress", levelKey);
      await setDoc(progressDocRef, nextData, { merge: true });
    } catch (firebaseErr: any) {
      console.warn(
        "Failed to save HSK progress to firestore (offline?):",
        firebaseErr,
      );
      const isOffline =
        firebaseErr?.message?.includes("offline") || !navigator.onLine;
      if (!isOffline) {
        throw firebaseErr;
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * Leaderboard
 */

export const getWeeklyLeaderboard = async (limitCount = 20) => {
  const path = "users";
  try {
    const q = query(
      collection(db, "users"),
      orderBy("totalXp", "desc"),
      limit(limitCount),
    );
    const snapshot = await getDocs(q);
    const list: any[] = [];
    let rank = 1;
    snapshot.forEach((doc) => {
      const u = doc.data();
      list.push({
        displayName: u.displayName || "Хэрэглэгч",
        weeklyXp:
          u.totalXp !== undefined ? u.totalXp : u.xp !== undefined ? u.xp : 0,
        rank: rank++,
      });
    });

    // Fallback if empty in Firestore yet
    if (list.length === 0) {
      return [
        { displayName: "Баатар", weeklyXp: 120, rank: 1 },
        { displayName: "Цэцэгээ", weeklyXp: 95, rank: 2 },
      ];
    }
    return list;
  } catch (error) {
    console.warn("Leaderboard Fetch Error:", error);
    return [
      { displayName: "Баатар", weeklyXp: 120, rank: 1 },
      { displayName: "Цэцэгээ", weeklyXp: 95, rank: 2 },
    ];
  }
};

export const subscribeToPendingPayments = (
  onData: (users: UserProfile[]) => void,
  onError: (error: any) => void,
) => {
  const usersCol = collection(db, "users");

  // Try with ordering first (ordered by createdAt descending)
  const qWithOrder = query(
    usersCol,
    where("paymentPending", "==", true),
    orderBy("createdAt", "desc"),
  );

  const parseDocToProfile = (document: any): any => {
    const data = document.data();
    const isPaidUser =
      data.isActive !== undefined
        ? data.isActive
        : data.isPaid !== undefined
          ? data.isPaid
          : false;
    const levelVal =
      typeof data.selectedLevel === "string"
        ? parseInt(data.selectedLevel.replace(/\D/g, ""), 10) || 1
        : data.selectedLevel || 1;
    const streakVal =
      data.streak !== undefined
        ? data.streak
        : data.currentStreak !== undefined
          ? data.currentStreak
          : 0;
    const xpVal =
      data.totalXP !== undefined
        ? data.totalXP
        : data.totalXp !== undefined
          ? data.totalXp
          : data.xp !== undefined
            ? data.xp
            : 0;

    return {
      uid: data.uid || document.id,
      email: data.email || "",
      displayName: data.displayName !== undefined ? data.displayName : "",
      selectedLevel: levelVal,
      totalXp: xpVal,
      currentStreak: streakVal,
      createdAt: data.createdAt
        ? typeof data.createdAt.toDate === "function"
          ? data.createdAt.toDate().toISOString()
          : data.createdAt
        : null,
      isPaid: isPaidUser,
      paymentPending:
        data.paymentPending !== undefined ? data.paymentPending : false,
      isActive: isPaidUser,
      expiryDate: data.expiryDate || data.paidUntil || null,
      paymentSubmittedAt:
        data.paymentSubmittedAt ||
        (data.createdAt
          ? typeof data.createdAt.toDate === "function"
            ? data.createdAt.toDate().toISOString()
            : data.createdAt
          : null),
    };
  };

  try {
    const unsubscribe = onSnapshot(
      qWithOrder,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap: any) => {
          list.push(parseDocToProfile(docSnap));
        });
        onData(list);
      },
      (error) => {
        console.warn(
          "Query with orderBy failed (maybe index is building). Fallback to standard query without orderby:",
          error,
        );

        // Fallback: query without ordered field, sort in memory
        const qNoOrder = query(usersCol, where("paymentPending", "==", true));

        const unsubFallback = onSnapshot(
          qNoOrder,
          (snapshot) => {
            const list: any[] = [];
            snapshot.forEach((docSnap: any) => {
              list.push(parseDocToProfile(docSnap));
            });
            // Client side sort by createdAt or paymentSubmittedAt desc
            list.sort((a, b) => {
              const timeA = new Date(
                a.paymentSubmittedAt || a.createdAt || 0,
              ).getTime();
              const timeB = new Date(
                b.paymentSubmittedAt || b.createdAt || 0,
              ).getTime();
              return timeB - timeA;
            });
            onData(list);
          },
          (fallbackErr) => {
            console.error(
              "All onSnapshot subscription queries failed:",
              fallbackErr,
            );
            onError(fallbackErr);
          },
        );
        (unsubscribe as any).fallback = unsubFallback;
      },
    );

    return () => {
      if ((unsubscribe as any).fallback) {
        (unsubscribe as any).fallback();
      }
      unsubscribe();
    };
  } catch (err) {
    console.error(
      "Failed to set up onSnapshot in subscribeToPendingPayments:",
      err,
    );
    onError(err);
    return () => {};
  }
};
