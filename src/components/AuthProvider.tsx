"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { UserProfile, clearStoredUser, getStoredUser, storeUser } from "@/lib/auth";
import { fetchCurrentUser } from "@/lib/backend";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount: try to rehydrate from stored session and verify JWT is still valid
    async function rehydrate() {
      const stored = getStoredUser();
      if (!stored?.token) {
        setLoading(false);
        return;
      }

      // Verify the token is still valid by calling /api/auth/me
      const dbUser = await fetchCurrentUser();
      if (dbUser) {
        // Refresh user profile from MongoDB (e.g. plan upgrades)
        setUser({
          ...stored,
          id: dbUser.id,
          name: dbUser.full_name,
          email: dbUser.email,
          activePlan: dbUser.active_plan,
        });
      } else {
        // Token expired or invalid — clear session
        clearStoredUser();
        setUser(null);
      }
      setLoading(false);
    }
    rehydrate();
  }, []);

  const login = (nextUser: UserProfile) => {
    storeUser(nextUser);
    setUser(nextUser);
  };

  const logout = () => {
    clearStoredUser();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
