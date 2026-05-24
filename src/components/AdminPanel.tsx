import React, { useState, useEffect } from "react";
import { useUser } from "../hooks/useUser";
import { useAuth } from "../context/AuthContext";
import {
  saveUserProfile,
  getUserProfile,
  getLocalUserByEmail,
  subscribeToPendingPayments,
} from "../lib/db";
import { auth } from "../lib/firebase";
import emailjs from "emailjs-com";
import toast from "react-hot-toast";
import {
  ShieldAlert,
  Zap,
  X,
  Loader2,
  Gift,
  Check,
  Copy,
  Clipboard,
  Clock,
  Mail,
} from "lucide-react";

export default function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { userId, isActive } = useUser();
  const { refreshProfile } = useAuth();

  // Tab Management
  const [activeTab, setActiveTab] = useState<"activate" | "requests" | "trial">(
    "requests",
  );

  // Single Activation Inputs
  const [targetUserId, setTargetUserId] = useState("");
  const [loading, setLoading] = useState(false);

  // Real-time Requests List state
  const [requests, setRequests] = useState<any[]>([]);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<
    Record<string, "approve" | "reject" | null>
  >({});

  // Set the current user ID as initial query value for ease of testing
  useEffect(() => {
    if (userId && !targetUserId) {
      setTargetUserId(userId);
    }
  }, [userId]);

  // Global keydown listener for Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Set up real-time subscription when panel is open
  useEffect(() => {
    if (!isOpen) return;

    // Verify current user is an admin before establishing the subscription
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const isCurrentUserAdmin =
      currentUser.uid === "KlSSLp05vSdk5JtJb4Xr0OVhkbH2" ||
      currentUser.email === "naranbadrakh1013@gmail.com";
    if (!isCurrentUserAdmin) return;

    const unsubscribe = subscribeToPendingPayments(
      (data) => {
        setRequests(data);
        setRequestsError(null);
      },
      (err) => {
        console.error("Real-time payment requests sub error:", err);
        setRequestsError(err.message || String(err));
      },
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("UID амжилттай хуулагдлаа! 📋");
  };

  const handleActivateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify current user has admin permissions
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Админ эрх шаардлагатай (Нэвтрээгүй байна).");
      return;
    }
    const isCurrentUserAdmin =
      currentUser.uid === "KlSSLp05vSdk5JtJb4Xr0OVhkbH2" ||
      currentUser.email === "naranbadrakh1013@gmail.com";
    if (!isCurrentUserAdmin) {
      toast.error("Танд админ эрх байхгүй байна.");
      return;
    }

    if (!targetUserId.trim()) {
      toast.error("User ID оруулна уу.");
      return;
    }

    const cleanInput = targetUserId.trim();
    setLoading(true);

    try {
      let targetUid = cleanInput;
      let foundUserEmail = "";

      // Try searching by direct UID in Firestore first
      const uidProfile = await getUserProfile(cleanInput);
      if (uidProfile && uidProfile.uid) {
        targetUid = uidProfile.uid;
        foundUserEmail = uidProfile.email || "";
      } else {
        // If not found by ID, try searching by email
        const emailProfile = await getLocalUserByEmail(cleanInput);
        if (emailProfile && emailProfile.uid) {
          targetUid = emailProfile.uid;
          foundUserEmail = emailProfile.email || "";
        }
      }

      if (!targetUid || targetUid === "undefined") {
        throw new Error("Код эсвэл Имэйл хаяг буруу байна.");
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

      console.log("Firestore write success: Activated user subscription.", {
        targetUid,
        email: foundUserEmail,
        payload: updatePayload,
      });

      toast.success(
        `Хэрэглэгч ${foundUserEmail || targetUid} амжилттай идэвхжлээ! 🎉 (30 хоног)`,
      );

      // Sync local profile state immediately
      await refreshProfile();

      // Close admin panel on success
      setTimeout(() => {
        setIsOpen(false);
      }, 800);
    } catch (err) {
      console.error("Firestore write error in handleActivateUser:", err);
      toast.error("Идэвхжүүлэх явцад алдаа гарлаа. Дахин шалгана уу.");
    } finally {
      setLoading(false);
    }
  };

  const handleGiveTrial = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify current user has admin permissions
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Админ эрх шаардлагатай (Нэвтрээгүй байна).");
      return;
    }
    const isCurrentUserAdmin =
      currentUser.uid === "KlSSLp05vSdk5JtJb4Xr0OVhkbH2" ||
      currentUser.email === "naranbadrakh1013@gmail.com";
    if (!isCurrentUserAdmin) {
      toast.error("Танд админ эрх байхгүй байна.");
      return;
    }

    if (!targetUserId.trim())
      return toast.error("Хэрэглэгчийн ID эсвэл Имэйл оруулна уу");

    setLoading(true);
    try {
      const cleanInput = targetUserId.trim();
      let targetUid = cleanInput;
      let foundUserEmail = "";

      // Try searching by direct UID in Firestore first
      const uidProfile = await getUserProfile(cleanInput);
      if (uidProfile && uidProfile.uid) {
        targetUid = uidProfile.uid;
        foundUserEmail = uidProfile.email || "";
      } else {
        // If not found by ID, try searching by email
        const emailProfile = await getLocalUserByEmail(cleanInput);
        if (emailProfile && emailProfile.uid) {
          targetUid = emailProfile.uid;
          foundUserEmail = emailProfile.email || "";
        }
      }

      if (!targetUid || targetUid === "undefined") {
        throw new Error("Код эсвэл Имэйл хаяг буруу байна.");
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

      console.log("Firestore write success: Granted trial to user.", {
        targetUid,
        email: foundUserEmail,
        payload: updatePayload,
      });

      toast.success(
        `Хэрэглэгч ${foundUserEmail || targetUid} амжилттай 1 өдрийн туршилт авлаа! 🎉`,
      );
      await refreshProfile();

      // Close admin panel on success
      setTimeout(() => {
        setIsOpen(false);
      }, 800);
    } catch (err) {
      console.error("Firestore write error in handleGiveTrial:", err);
      toast.error("Туршилт олгоход алдаа гарлаа. Дахин шалгана уу.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (uid: string, foundUserEmail: string) => {
    // Verify current user has admin permissions
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Админ эрх шаардлагатай.");
      return;
    }
    const isCurrentUserAdmin =
      currentUser.uid === "KlSSLp05vSdk5JtJb4Xr0OVhkbH2" ||
      currentUser.email === "naranbadrakh1013@gmail.com";
    if (!isCurrentUserAdmin) {
      toast.error("Танд админ эрх байхгүй байна.");
      return;
    }

    setActionLoading((prev) => ({ ...prev, [uid]: "approve" }));
    try {
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

      await saveUserProfile(uid, updatePayload as any);

      toast.success("Эрхийг амжилттай идэвхжүүллээ! 🎉");

      if (uid === userId) {
        await refreshProfile();
      }
    } catch (err) {
      console.error("Activation approve error:", err);
      toast.error("Хүсэлтийг баталгаажуулахад алдаа гарлаа.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [uid]: null }));
    }
  };

  const handleRejectRequest = async (uid: string, foundUserEmail: string) => {
    // Verify current user has admin permissions
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Админ эрх шаардлагатай.");
      return;
    }
    const isCurrentUserAdmin =
      currentUser.uid === "KlSSLp05vSdk5JtJb4Xr0OVhkbH2" ||
      currentUser.email === "naranbadrakh1013@gmail.com";
    if (!isCurrentUserAdmin) {
      toast.error("Танд админ эрх байхгүй байна.");
      return;
    }

    setActionLoading((prev) => ({ ...prev, [uid]: "reject" }));
    try {
      // 1. Send rejection template via EmailJS
      const serviceId = "service_2ybfufs";
      const templateId = "template_rn2r8qs";
      const publicKey = "VgKHxGRWiboT5_nY1";

      const templateParams = {
        user_id: uid,
        user_email: foundUserEmail || "",
        message:
          "Таны төлбөр баталгаажаагүй байна. Асуудал гарвал бидэнтэй холбогдоно уу.",
      };

      try {
        await emailjs.send(serviceId, templateId, templateParams, publicKey);
        console.log(
          "EmailJS rejection notice fired successfully to:",
          foundUserEmail,
        );
      } catch (emailErr) {
        console.error(
          "EmailJS service failure inside rejection routine:",
          emailErr,
        );
      }

      // 2. Reject in DB by setting paymentPending: false
      await saveUserProfile(uid, { paymentPending: false } as any);

      toast.success("Хүсэлтийг цуцалж, имэйл мэдэгдлийг илгээлээ. ❌");

      if (uid === userId) {
        await refreshProfile();
      }
    } catch (err) {
      console.error("Activation reject error:", err);
      toast.error("Хүсэлтийг цуцлахад алдаа гарлаа.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [uid]: null }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-[9999] ${activeTab === "requests" ? "max-w-md" : "max-w-sm"} w-full transition-all duration-300 animate-in fade-in slide-in-from-bottom-5`}
      id="admin-panel-component"
    >
      <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative space-y-4">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          title="Хаах"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Status */}
        <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          <span>ADMIN PANEL (Ctrl+Shift+A)</span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-900 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab("activate")}
            className={`flex-1 pb-2 border-b-2 transition-colors ${
              activeTab === "activate"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Идэвхжүүлэх
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 pb-2 border-b-2 relative transition-colors ${
              activeTab === "requests"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Хүсэлтүүд
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("trial")}
            className={`flex-1 pb-2 border-b-2 transition-colors ${
              activeTab === "trial"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Туршилт
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="space-y-3 pt-1">
          {activeTab === "activate" && (
            <form onSubmit={handleActivateUser} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                  Идэвхжүүлэх User ID эсвэл Имэйл
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
            </form>
          )}

          {activeTab === "requests" && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {requestsError && (
                <div className="text-[11px] text-red-400 font-mono bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                  Алдаа: {requestsError}
                </div>
              )}

              {requests.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs flex flex-col items-center justify-center gap-1">
                  <Clock className="w-6 h-6 text-slate-600 mb-1" />
                  <span>Төлбөрийн хүсэлт одоогоор байхгүй байна.</span>
                </div>
              ) : (
                requests.map((req) => (
                  <div
                    key={req.uid}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start text-xs">
                      <div className="space-y-1">
                        {/* ID Block */}
                        <div className="flex items-center gap-1.5 font-mono text-slate-300">
                          <span className="font-bold text-slate-400 text-[10px] uppercase">
                            ID:
                          </span>
                          <span className="font-mono text-[11px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/60 font-medium">
                            {req.uid.slice(0, 8)}...
                          </span>
                          <button
                            onClick={() => handleCopyToClipboard(req.uid)}
                            className="text-slate-400 hover:text-white p-1 hover:bg-slate-850 rounded transition-colors"
                            title="Бүтэн UID хуулах"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {/* Email Block */}
                        <div className="text-[11px] text-slate-300 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span
                            className="truncate max-w-[200px]"
                            title={req.email}
                          >
                            {req.email}
                          </span>
                        </div>
                      </div>

                      {/* Timestamp Info */}
                      <div className="text-[10px] font-mono text-right text-slate-400">
                        <div className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">
                          Илгээсэн:
                        </div>
                        <div className="flex items-center gap-0.5 justify-end text-slate-300 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>
                            {req.paymentSubmittedAt
                              ? new Date(req.paymentSubmittedAt).toLocaleString(
                                  "mn-MN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    month: "2-digit",
                                    day: "2-digit",
                                  },
                                )
                              : "Мэдэгдэхгүй"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(req.uid, req.email)}
                        disabled={
                          actionLoading[req.uid] !== undefined &&
                          actionLoading[req.uid] !== null
                        }
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                      >
                        {actionLoading[req.uid] === "approve" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5 font-bold" />
                        )}
                        <span>Идэвхжүүлэх</span>
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.uid, req.email)}
                        disabled={
                          actionLoading[req.uid] !== undefined &&
                          actionLoading[req.uid] !== null
                        }
                        className="flex-1 py-1.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-500/20 text-rose-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                      >
                        {actionLoading[req.uid] === "reject" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        <span>Татгалзах</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "trial" && (
            <form onSubmit={handleGiveTrial} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                  Туршилт өгөх User ID эсвэл Имэйл
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/30 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <Gift className="w-3.5 h-3.5 text-white" />
                )}
                <span>Give Trial (1d)</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer info bar */}
        <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-400">
          <span className="truncate max-w-[150px]">ID: {userId}</span>
          <span>Төлөв: {isActive ? "Идэвхтэй ✅" : "Идэвхгүй ❌"}</span>
        </div>
      </div>
    </div>
  );
}
