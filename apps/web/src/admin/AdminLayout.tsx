import type { CSSProperties, ReactNode } from 'react';

type NavKey =
  | 'dashboard' | 'users' | 'fraud' | 'payouts' | 'boost-logs'
  | 'events' | 'tuning' | 'campaigns' | 'corrections' | 'revenue'
  | 'notifications' | 'analytics' | 'ab-tests' | 'live-events'
  | 'fraud-management' | 'notification-campaigns';

interface NavItem {
  key: NavKey;
  label: string;
  roles?: string[]; // undefined = herkese açık
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Genel Durum' },
  { key: 'users', label: 'Kullanıcılar' },
  { key: 'analytics', label: 'Analytics', roles: ['super_admin', 'analytics_viewer'] },
  { key: 'ab-tests', label: 'A/B Testler', roles: ['super_admin'] },
  { key: 'live-events', label: 'Live Events' },
  { key: 'fraud-management', label: 'Fraud Yönetimi', roles: ['super_admin', 'fraud_reviewer'] },
  { key: 'payouts', label: 'Ödeme Talepleri' },
  { key: 'boost-logs', label: 'Boost Kayıtları' },
  { key: 'tuning', label: 'Live Tuning', roles: ['super_admin'] },
  { key: 'campaigns', label: 'Kampanyalar', roles: ['super_admin', 'campaign_manager'] },
  { key: 'notification-campaigns', label: 'Bildirim Kampanyaları', roles: ['super_admin', 'campaign_manager'] },
  { key: 'corrections', label: 'Bakiye Düzeltme', roles: ['super_admin'] },
  { key: 'revenue', label: 'Gelir & Ödeme' },
  { key: 'notifications', label: 'Bildirimler' },
];

export function AdminLayout({
  active,
  onNavigate,
  onExit,
  adminRole,
  children
}: {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  onExit: () => void;
  adminRole?: string;
  children: ReactNode;
}) {
  const visibleItems = NAV_ITEMS.filter(item => {
    if (!item.roles) return true;
    if (!adminRole) return false;
    return item.roles.includes(adminRole) || adminRole === 'super_admin';
  });

  return (
    <div style={shellStyle}>
      <aside style={sidebarStyle}>
        <h3 style={{ marginTop: 0 }}>Yönetim</h3>
        {visibleItems.map(item => (
          <NavButton
            key={item.key as string}
            active={active === item.key}
            onClick={() => onNavigate(item.key)}
            label={item.label}
          />
        ))}
        <button onClick={onExit} style={exitButtonStyle}>Oyuna Dön</button>
      </aside>
      <main style={contentStyle}>{children}</main>
    </div>
  );
}

function NavButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={navButtonStyle(active)}>
      {label}
    </button>
  );
}

const shellStyle: CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  background: '#05070b',
  color: 'white'
};

const sidebarStyle: CSSProperties = {
  width: 220,
  padding: 20,
  borderRight: '1px solid rgba(255,255,255,0.08)',
  background: '#0b1118',
  display: 'flex',
  flexDirection: 'column',
  gap: 10
};

const contentStyle: CSSProperties = {
  flex: 1,
  padding: 24
};

function navButtonStyle(active: boolean): CSSProperties {
  return {
    border: '1px solid rgba(255,255,255,0.08)',
    background: active ? '#1d3650' : '#111821',
    color: 'white',
    borderRadius: 12,
    padding: '12px 14px',
    textAlign: 'left',
    cursor: 'pointer'
  };
}

const exitButtonStyle: CSSProperties = {
  marginTop: 'auto',
  border: '1px solid rgba(255,255,255,0.08)',
  background: '#1d1f29',
  color: 'white',
  borderRadius: 12,
  padding: '12px 14px',
  cursor: 'pointer'
};
