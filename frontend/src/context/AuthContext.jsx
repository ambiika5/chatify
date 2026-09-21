import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";
import { socketManager } from "../socket";

const TOKEN_KEY = "chatify_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        () => localStorage.getItem(TOKEN_KEY) || null
    );
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem(TOKEN_KEY);

        if (!savedToken) {
            setLoading(false);
            return;
        }

        setToken(savedToken);

        api.getMe(savedToken)
            .then((data) => {
                setUser(data.user);
            })
            .catch(() => {
                localStorage.removeItem(TOKEN_KEY);
                setToken(null);
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = async (email, password) => {
        const data = await api.login({ email, password });

        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);

        return data;
    };

    const register = (username, email, password) => {
        return api.register({ username, email, password });
    };

    const logout = async () => {
        try {
            if (token) {
                await api.logout(token);
            }
        } catch {
            // backend logout failures should not block local logout
        }

        socketManager.disconnect();

        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                loading,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}