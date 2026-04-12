import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchAuth, login as apiLogin, logout as apiLogout } from "../lib/api";
const AuthContext = createContext({
    admin: false,
    loading: true,
    login: apiLogin,
    logout: apiLogout,
});
export function AuthProvider({ children }) {
    const [admin, setAdmin] = useState(false);
    const [email, setEmail] = useState();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchAuth()
            .then((s) => {
            setAdmin(s.admin);
            setEmail(s.email);
        })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);
    const logout = useCallback(async () => {
        await apiLogout();
        setAdmin(false);
        setEmail(undefined);
    }, []);
    return (_jsx(AuthContext.Provider, { value: { admin, email, loading, login: apiLogin, logout }, children: children }));
}
export function useAuth() {
    return useContext(AuthContext);
}
