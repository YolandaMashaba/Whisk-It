import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { login as apiLogin, register as apiRegister } from '../api/Index';

const AuthContext = createContext(null);

const STORAGE_TOKEN = 'whisk_token';
const STORAGE_USER = 'whisk_user';

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN));
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_USER);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        if (token) localStorage.setItem(STORAGE_TOKEN, token);
        else localStorage.removeItem(STORAGE_TOKEN);
    }, [token]);

    useEffect(() => {
        if (user) localStorage.setItem(STORAGE_USER, JSON.stringify(user));
        else localStorage.removeItem(STORAGE_USER);
    }, [user]);

    const applyAuth = useCallback((payload) => {
        if (payload?.token) setToken(payload.token);
        if (payload?.user) setUser(payload.user);
    }, []);

    const login = useCallback(
        async (username, password) => {
            const res = await apiLogin(username, password);
            applyAuth(res);
            return res;
        },
        [applyAuth]
    );

    const register = useCallback(
        async (username, password) => {
            const res = await apiRegister(username, password);
            applyAuth(res);
            return res;
        },
        [applyAuth]
    );

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
    }, []);

    const isAdmin = Boolean(user?.is_admin) || user?.role === 'admin';

    const value = useMemo(
        () => ({
            token,
            user,
            login,
            register,
            logout,
            applyAuth,
            isAuthenticated: Boolean(token && user),
            isAdmin,
        }),
        [token, user, login, register, logout, applyAuth, isAdmin]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
