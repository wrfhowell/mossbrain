import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { fetchAuth, login as apiLogin, logout as apiLogout } from "../lib/api";

interface AuthCtx {
  admin: boolean;
  email?: string;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  admin: false,
  loading: true,
  login: apiLogin,
  logout: apiLogout,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState(false);
  const [email, setEmail] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuth()
      .then((s) => {
        setAdmin(s.admin);
        setEmail(s.email);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setAdmin(false);
    setEmail(undefined);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, email, loading, login: apiLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
