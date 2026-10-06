import { createContext, useContext, useState, useCallback } from 'react';
import * as store from '../lib/store';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => store.getSession());

  const login = useCallback(async (username, password, role) => {
    const result = await store.handleLogin(username, password, role);
    if (result.ok) setSession(result.user);
    return result;
  }, []);

  const register = useCallback(async (newUser) => {
    const result = await store.handleRegister(newUser);
    if (result.ok) setSession(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await store.clearSession();
    setSession(null);
  }, []);

  return (
    <SessionContext.Provider value={{ session, login, register, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

// The one hook every component uses to read/change who's logged in.
export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
