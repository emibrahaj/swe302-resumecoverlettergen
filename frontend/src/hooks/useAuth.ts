"use client";

import { useEffect, useState } from "react";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  isCompany: boolean;
}

/**
 * Reads auth state from localStorage (token set by AuthModal on login/signup).
 * Returns isLoading=true on first render to avoid navbar flash.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    token: null,
    isCompany: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const isCompany = localStorage.getItem("user_type") === "company";
    setState({
      isAuthenticated: !!token,
      isLoading: false,
      token,
      isCompany,
    });

    // Listen for storage changes (login/logout in other tabs)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "user_type") {
        const updatedToken = localStorage.getItem("access_token");
        const updatedIsCompany = localStorage.getItem("user_type") === "company";
        setState({
          isAuthenticated: !!updatedToken,
          isLoading: false,
          token: updatedToken,
          isCompany: updatedIsCompany,
        });
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return state;
}

/** Call on logout: clears auth tokens from localStorage. */
export function clearAuthTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_type");
}

/** Call on login/signup success: stores tokens in localStorage. */
export function setAuthTokens(
  accessToken: string,
  refreshToken?: string,
  isCompany = false
) {
  localStorage.setItem("access_token", accessToken);
  if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
  localStorage.setItem("user_type", isCompany ? "company" : "user");
}
