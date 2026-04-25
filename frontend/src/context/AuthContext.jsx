import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);
const AUTH_SYNC_KEY = "myshop:auth-sync";
const defaultAuthContext = {
  user: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loadProfile: async () => {},
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile({ silent = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get("/auth/profile/");
      setUser(data);
    } catch {
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    if (localStorage.getItem("accessToken")) loadProfile();
    else setLoading(false);
  }, []);

  function broadcastAuthSync(source) {
    try {
      localStorage.setItem(AUTH_SYNC_KEY, JSON.stringify({ source, at: Date.now() }));
    } catch {
      // localStorage can be unavailable in private contexts.
    }
  }

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== AUTH_SYNC_KEY) return;
      if (localStorage.getItem("accessToken")) loadProfile({ silent: true });
      else setUser(null);
    };
    const onFocus = () => {
      if (localStorage.getItem("accessToken")) loadProfile({ silent: true });
    };
    const onApiMutation = (event) => {
      const url = event.detail?.url || "";
      if (url.startsWith("/auth/profile") || url.startsWith("/auth/loyalty")) {
        loadProfile({ silent: true });
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    window.addEventListener("myshop:api-mutated", onApiMutation);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("myshop:api-mutated", onApiMutation);
    };
  }, []);

  async function login(credentials) {
    const { data } = await api.post("/auth/login/", credentials);
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    await loadProfile();
    broadcastAuthSync("login");
  }

  async function register(payload) {
    await api.post("/auth/register/", payload);
    await login({ username: payload.username, password: payload.password });
  }

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    broadcastAuthSync("logout");
  }

  const value = useMemo(() => ({ user, loading, login, register, logout, loadProfile }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext) || defaultAuthContext;
