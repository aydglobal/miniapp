import { createContext, useContext, useMemo, useState } from 'react';
import type { PlayerProfile } from '../../../../packages/shared/src/index';

type UserStore = {
  user: PlayerProfile | null;
  setUser: (user: PlayerProfile | null) => void;
};

const UserContext = createContext<UserStore | null>(null);

export function UserProvider({
  children,
  initialUser = null
}: {
  children: React.ReactNode;
  initialUser?: PlayerProfile | null;
}) {
  const [user, setUser] = useState<PlayerProfile | null>(initialUser);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const store = useContext(UserContext);
  if (!store) {
    throw new Error('useUser must be used within UserProvider');
  }
  return store;
}
