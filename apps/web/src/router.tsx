import { useEffect, useState } from 'react';
import { AdminGuard } from './components/AdminGuard';
import { getInitData, getTelegramWebApp } from './lib/telegram';
import { adminFetch } from './lib/adminApi';
import { DashboardPage } from './admin/pages/DashboardPage';
import { UsersPage } from './admin/pages/UsersPage';
import { FraudReviewPage } from './admin/pages/FraudReviewPage';
import { PayoutsPage } from './admin/pages/PayoutsPage';
import { BoostLogsPage } from './admin/pages/BoostLogsPage';
import { AdminEventsPage } from './admin/pages/AdminEventsPage';
import { AdminTuningPage } from './admin/pages/AdminTuningPage';
import { AdminCampaignsPage } from './admin/pages/AdminCampaignsPage';
import { AdminCorrectionsPage } from './admin/pages/AdminCorrectionsPage';
import { AdminRevenuePage } from './admin/pages/AdminRevenuePage';
import { AdminNotificationsPage } from './admin/pages/AdminNotificationsPage';
import { AdminLayout } from './admin/AdminLayout';
import AppPage from './pages/App';
import LitePaperPage from './pages/LitePaperPage';
import TermsPage from './pages/TermsPage';
import { useUser } from './store/useUser';
import AnalyticsDashboard from './admin/pages/AnalyticsDashboard';
import ABTestsPage from './admin/pages/ABTestsPage';
import LiveEventsPage from './admin/pages/LiveEventsPage';
import FraudManagementPage from './admin/pages/FraudManagementPage';
import NotificationCampaigns from './admin/pages/NotificationCampaigns';

type AdminRoute = 'dashboard' | 'users' | 'fraud' | 'payouts' | 'boost-logs' | 'events' | 'tuning' | 'campaigns' | 'corrections' | 'revenue' | 'notifications' | 'analytics' | 'ab-tests' | 'live-events' | 'fraud-management' | 'notification-campaigns';

function isAdminRoute(value: string): value is AdminRoute {
  return ['dashboard', 'users', 'fraud', 'payouts', 'boost-logs', 'events', 'tuning', 'campaigns', 'corrections', 'revenue', 'notifications', 'analytics', 'ab-tests', 'live-events', 'fraud-management', 'notification-campaigns'].includes(value);
}

function resolveAdminRoute(pathname: string): AdminRoute {
  if (pathname.includes('/users')) return 'users';
  if (pathname.includes('/fraud-management')) return 'fraud-management';
  if (pathname.includes('/fraud')) return 'fraud';
  if (pathname.includes('/payouts')) return 'payouts';
  if (pathname.includes('/boost-logs')) return 'boost-logs';
  if (pathname.includes('/live-events')) return 'live-events';
  if (pathname.includes('/events')) return 'events';
  if (pathname.includes('/tuning')) return 'tuning';
  if (pathname.includes('/notification-campaigns')) return 'notification-campaigns';
  if (pathname.includes('/campaigns')) return 'campaigns';
  if (pathname.includes('/corrections')) return 'corrections';
  if (pathname.includes('/revenue')) return 'revenue';
  if (pathname.includes('/notifications')) return 'notifications';
  if (pathname.includes('/analytics')) return 'analytics';
  if (pathname.includes('/ab-tests')) return 'ab-tests';
  return 'dashboard';
}

export default function MainRouter() {
  const { user, setUser } = useUser();
  const [adminRoute, setAdminRoute] = useState<AdminRoute>('dashboard');
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const tg = getTelegramWebApp();
    const startParam = tg?.initDataUnsafe?.start_param;
    const url = new URL(window.location.href);
    const route = url.searchParams.get('admin') || (startParam === 'admin' ? 'dashboard' : '');

    if (isAdminRoute(route)) {
      setAdminRoute(route);
      window.history.replaceState({}, '', `/admin/${route === 'dashboard' ? '' : route}`);
      setPathname(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    if (user) return;
    const token = localStorage.getItem('adn_airdrop_token');
    const initData = getInitData();
    if (!token && !initData) return;

    adminFetch('/api/profile')
      .then((res) => setUser(res.user))
      .catch(() => undefined);
  }, [user, setUser]);

  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
  const isLitePaperPath = pathname === '/lite-paper' || pathname.startsWith('/lite-paper/') || pathname === '/adntoken-lite-paper' || pathname.startsWith('/adntoken-lite-paper/');
  const isTermsPath = pathname === '/terms' || pathname.startsWith('/terms/') || pathname === '/faq' || pathname.startsWith('/faq/');

  if (isTermsPath) {
    return <TermsPage />;
  }

  if (isLitePaperPath) {
    return <LitePaperPage />;
  }

  if (!isAdminPath) {
    return <AppPage />;
  }

  return (
    <AdminGuard>
      <AdminLayout
        active={resolveAdminRoute(pathname)}
        onNavigate={(key) => {
          setAdminRoute(key);
          const secret = new URLSearchParams(window.location.search).get('admin_secret');
          const secretParam = secret ? `?admin_secret=${secret}` : '';
          const path = key === 'dashboard' ? `/admin${secretParam}` : `/admin/${key}${secretParam}`;
          window.history.pushState({}, '', path);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
        onExit={() => {
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
      >
        {pathname.includes('/users') ? (
          <UsersPage />
        ) : pathname.includes('/fraud-management') ? (
          <FraudManagementPage />
        ) : pathname.includes('/fraud') ? (
          <FraudReviewPage />
        ) : pathname.includes('/payouts') ? (
          <PayoutsPage />
        ) : pathname.includes('/boost-logs') ? (
          <BoostLogsPage />
        ) : pathname.includes('/live-events') ? (
          <LiveEventsPage />
        ) : pathname.includes('/events') ? (
          <AdminEventsPage />
        ) : pathname.includes('/tuning') ? (
          <AdminTuningPage />
        ) : pathname.includes('/notification-campaigns') ? (
          <NotificationCampaigns />
        ) : pathname.includes('/campaigns') ? (
          <AdminCampaignsPage />
        ) : pathname.includes('/corrections') ? (
          <AdminCorrectionsPage />
        ) : pathname.includes('/revenue') ? (
          <AdminRevenuePage />
        ) : pathname.includes('/notifications') ? (
          <AdminNotificationsPage />
        ) : pathname.includes('/analytics') ? (
          <AnalyticsDashboard />
        ) : pathname.includes('/ab-tests') ? (
          <ABTestsPage />
        ) : (
          <DashboardPage />
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
