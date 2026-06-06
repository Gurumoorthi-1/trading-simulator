import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './pages/admin/AdminLayout';

// UI Fallback
import PageLoader from './components/ui/PageLoader';

// Protected Route Guard
import ProtectedRoute from './components/ui/ProtectedRoute';
import AdminRoute from './components/ui/AdminRoute';

// Auth Store
import { useAuthStore, useThemeStore } from './context/store';

// Lazy Loaded Pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Market = lazy(() => import('./pages/Market'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Wallet = lazy(() => import('./pages/Wallet'));
const AISuggestions = lazy(() => import('./pages/AISuggestions'));
const Premium = lazy(() => import('./pages/Premium'));
const Notifications = lazy(() => import('./pages/Notifications'));
const RiskAnalysis = lazy(() => import('./pages/RiskAnalysis'));
const UserSettings = lazy(() => import('./pages/Settings'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminSubscriptions = lazy(() => import('./pages/admin/AdminSubscriptions'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminTradingAnalytics = lazy(() => import('./pages/admin/AdminTradingAnalytics'));
const AdminAIAnalytics = lazy(() => import('./pages/admin/AdminAIAnalytics'));
const AdminNotificationCenter = lazy(() => import('./pages/admin/AdminNotificationCenter'));
const AdminSystemMonitoring = lazy(() => import('./pages/admin/AdminSystemMonitoring'));
const AdminSecurityCenter = lazy(() => import('./pages/admin/AdminSecurityCenter'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Legal Pages
import { PrivacyPolicy, TermsConditions, RefundPolicy } from './pages/LegalPages';

function App() {
  const { isAuthenticated, refreshUser, connectSocket, user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme from store
    setTheme(theme);
    // App load ஆகும்போது user data refresh பண்ணும்
    if (isAuthenticated) {
      refreshUser().then(() => {
        connectSocket();
      });
    }
  }, []);

  // Connect socket when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    }
  }, [isAuthenticated, connectSocket]);

  // Redirect logic based on user role
  const getRedirectPath = () => {
    if (user?.role === 'admin') {
      return '/admin';
    }
    return '/dashboard';
  };

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        className: 'bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text border border-light-border dark:border-dark-border',
      }} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* If already authenticated, redirect to appropriate dashboard */}
          <Route path="/" element={
            isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : <Landing />
          } />

          {/* Auth Routes - redirect if already logged in */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : <Login />
            } />
            <Route path="/register" element={
              isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : <Register />
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Protected Dashboard Routes - Login பண்ணாதவங்களுக்கு access இல்லை */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/market" element={<Market />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/ai-suggestions" element={<AISuggestions />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/risk-analysis" element={<RiskAnalysis />} />
              <Route path="/settings" element={<UserSettings />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/trading-analytics" element={<AdminTradingAnalytics />} />
              <Route path="/admin/ai-analytics" element={<AdminAIAnalytics />} />
              <Route path="/admin/notification-center" element={<AdminNotificationCenter />} />
              <Route path="/admin/system-monitoring" element={<AdminSystemMonitoring />} />
              <Route path="/admin/security-center" element={<AdminSecurityCenter />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Legal Pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
