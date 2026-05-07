import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearAuthToken, getAuthToken, setAuthToken } from "../services/storage";

type AuthState = {
  token: string | null;
  isBootstrapping: boolean;
};

type AuthContextValue = AuthState & {
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, isBootstrapping: true });

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const token = await getAuthToken();
        if (!mounted) return;
        setState({ token, isBootstrapping: false });
      } catch (err) {
        console.error("Failed to load auth token:", err);
        if (!mounted) return;
        setState({ token: null, isBootstrapping: false });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (token: string) => {
    await setAuthToken(token);
    setState((s) => ({ ...s, token }));
  }, []);

  const signOut = useCallback(async () => {
    await clearAuthToken();
    setState((s) => ({ ...s, token: null }));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ ...state, signIn, signOut }), [state, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

