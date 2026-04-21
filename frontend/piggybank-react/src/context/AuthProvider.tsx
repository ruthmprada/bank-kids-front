import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "../types";
import {
  fetchAuthenticatedUser,
  clearStoredUser,
  getStoredUser,
  logoutFromSupabase,
  saveStoredUser,
} from "../services/authService";
import { supabase } from "../services/supabaseClient";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function syncUser() {
      try {
        const nextUser = await fetchAuthenticatedUser();

        if (isMounted) {
          setUser(nextUser);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncUser();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function loginUser(user: User) {
    saveStoredUser(user);
    setUser(user);
  }

  function logout() {
    void logoutFromSupabase();
    clearStoredUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
