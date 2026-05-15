"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { setAuthTokens } from "@/src/hooks/useAuth";

/**
 * OAuth callback landing page.
 *
 * Backend's /auth/oauth/{provider}/callback redirects here on success:
 *     /auth/callback?return_to=/user/dashboard#access_token=eyJ...&refresh_token=...
 *
 * On error the backend redirects with query params instead of a fragment:
 *     /auth/callback?oauth_error=access_denied&oauth_message=The+user+denied+the+request
 *
 * Tokens live in the URL fragment (#) so they never appear in server logs or
 * Referer headers. We read them client-side, store them, then bounce the user
 * to return_to.
 */
function CallbackInner() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const oauthError = search?.get("oauth_error");
    const oauthMessage = search?.get("oauth_message");
    if (oauthError) {
      toast.error(oauthMessage || `OAuth failed (${oauthError})`);
      router.replace("/");
      return;
    }

    // Tokens come back in the URL fragment.
    if (typeof window === "undefined") return;
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token") || undefined;
    const returnTo = search?.get("return_to") || "/user/dashboard";

    if (!accessToken) {
      toast.error("Sign-in failed: no token returned");
      router.replace("/");
      return;
    }

    setAuthTokens(accessToken, refreshToken, false);
    toast.success("Signed in ✨");
    // Strip the hash from history so the token doesn't linger in the URL bar.
    try {
      window.history.replaceState({}, "", returnTo);
    } catch {
      /* ignore */
    }
    router.replace(returnTo);
  }, [router, search]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-[#088395] border-t-transparent rounded-full animate-spin" />
        <p className="text-foreground/70">Completing sign-in…</p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-foreground/60">Loading…</p>
        </main>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
