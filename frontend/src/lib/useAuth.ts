import { useState, useEffect } from "react";

interface User {
  subject: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setState({ user: data.user, loading: false, error: null });
      } else {
        setState({ user: null, loading: false, error: null });
      }
    } catch (err) {
      setState({ user: null, loading: false, error: "Failed to check auth" });
    }
  }

  function login() {
    window.location.href = "/auth/login";
  }

  function logout() {
    window.location.href = "/auth/logout";
  }

  return { ...state, login, logout };
}
