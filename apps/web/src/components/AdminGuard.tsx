import { useUser } from '../store/useUser';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  const urlSecret = new URLSearchParams(window.location.search).get('admin_secret');
  const hasUrlAccess = urlSecret === 'adn_admin_4c8e1a92f7b64d0d9e2c5a1b7f3e8c44_lock';

  // Admin secret varsa direkt geç — user bekleme
  if (hasUrlAccess) return <>{children}</>;

  if (!user) {
    return <div style={{ padding: 24, color: 'white' }}>Loading...</div>;
  }

  if (!user.isAdmin) {
    return <div style={{ padding: 24, color: 'white' }}>Yetkin yok</div>;
  }

  return <>{children}</>;
}
