import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PaymentPage from './pages/PaymentPage';
import Dashboard from './pages/Dashboard';
import LeaderboardPage from './pages/LeaderboardPage';
import VocabModule from './pages/VocabModule';
import GrammarPage from './pages/GrammarPage';
import GrammarLessonPage from './pages/GrammarLessonPage';
import ListeningPage from './pages/ListeningPage';
import ListeningLessonPage from './pages/ListeningLessonPage';
import ReadingPage from './pages/ReadingPage';
import ReadingLessonPage from './pages/ReadingLessonPage';
import LessonModule from './pages/LessonModule';
import ExamModule from './pages/ExamModule';
import ProfilePage from './pages/ProfilePage';
import Header from './components/common/Header';
import AuthGuard from './components/common/AuthGuard';
import SubscriptionGuard from './components/common/SubscriptionGuard';
import AdminPanel from './components/AdminPanel';
import { saveUserProfile } from './lib/db';
import toast from 'react-hot-toast';

function TrialExpirationSync() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) return;

    const checkExpiry = async () => {
      const now = Date.now();
      const expiryTime = profile.paidUntil ? Date.parse(profile.paidUntil) : null;
      
      // If trial active but expired
      if (expiryTime && now > expiryTime && profile.isPaid && profile.isTrial) {
        try {
          // Deactivate trial
          await saveUserProfile(profile.uid, { isPaid: false });
          await refreshProfile();
          
          sessionStorage.setItem('trial_just_expired', 'true');
          toast.error("Таны үнэгүй туршилт дууслаа. Үргэлжлүүлэн суралцахыг хүсвэл 15,000₮-ийн хандалт авна уу.", {
            duration: 4000
          });
          
          setTimeout(() => {
            navigate('/payment');
          }, 3000);
        } catch (e) {
          console.error("Failed to auto-expire trial:", e);
        }
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [profile, navigate, refreshProfile]);

  // Handle page load redirect if marker in session storage exists
  useEffect(() => {
    if (sessionStorage.getItem('trial_just_expired') === 'true') {
      sessionStorage.removeItem('trial_just_expired');
      toast.error("Таны үнэгүй туршилт дууслаа. Үргэлжлүүлэн суралцахыг хүсвэл 15,000₮-ийн хандалт авна уу.", {
        duration: 4000
      });
      setTimeout(() => {
        navigate('/payment');
      }, 3000);
    }
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <TrialExpirationSync />
        <div className="min-h-screen bg-surface font-sans text-ink">
          <Header />
          <AdminPanel />
          <main className="container mx-auto px-4 py-8 max-w-6xl">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected Routes (Require Login / Session) */}
              <Route path="/dashboard" element={<AuthGuard><SubscriptionGuard><Dashboard /></SubscriptionGuard></AuthGuard>} />
              <Route path="/leaderboard" element={<AuthGuard><SubscriptionGuard><LeaderboardPage /></SubscriptionGuard></AuthGuard>} />
              <Route path="/vocab" element={<AuthGuard><SubscriptionGuard><VocabModule /></SubscriptionGuard></AuthGuard>} />
              <Route path="/grammar" element={<AuthGuard><SubscriptionGuard><GrammarPage /></SubscriptionGuard></AuthGuard>} />
              <Route path="/grammar/:id" element={<AuthGuard><SubscriptionGuard><GrammarLessonPage /></SubscriptionGuard></AuthGuard>} />
              <Route path="/listening" element={<AuthGuard><SubscriptionGuard><ListeningPage /></SubscriptionGuard></AuthGuard>} />
              <Route path="/listening/:id" element={<AuthGuard><SubscriptionGuard><ListeningLessonPage /></SubscriptionGuard></AuthGuard>} />
              <Route path="/reading" element={<AuthGuard><SubscriptionGuard><ReadingPage /></SubscriptionGuard></AuthGuard>} />
              <Route path="/reading/:id" element={<AuthGuard><SubscriptionGuard><ReadingLessonPage /></SubscriptionGuard></AuthGuard>} />
              <Route path="/lessons/:id" element={<AuthGuard><SubscriptionGuard><LessonModule /></SubscriptionGuard></AuthGuard>} />
              <Route path="/exam" element={<AuthGuard><SubscriptionGuard><ExamModule /></SubscriptionGuard></AuthGuard>} />
              <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
              <Route path="/payment" element={<AuthGuard><PaymentPage /></AuthGuard>} />

              {/* Fallback Catchall */}
              <Route path="*" element={<AuthGuard><SubscriptionGuard><Dashboard /></SubscriptionGuard></AuthGuard>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
