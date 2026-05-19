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
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8091";

function CallbackInner() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const run = async () => {
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

      // Claim any guest resume the user was building before OAuth redirect.
      const pendingResumeId = window.localStorage.getItem("pending_resume_id");
      const pendingTemplateKey = window.localStorage.getItem("pending_template_key");
      if (pendingResumeId) {
        try {
          await fetch(`${API_BASE}/resume/my-resumes/${pendingResumeId}/claim`, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          window.localStorage.removeItem("pending_resume_id");
          window.localStorage.removeItem("pending_template_key");
          const editUrl = `/edit/resume?id=${pendingResumeId}${pendingTemplateKey ? `&template=${encodeURIComponent(pendingTemplateKey)}` : ""}`;
          router.replace(editUrl);
          return;
        } catch {
          // Claim failed — fall through to normal redirect
          window.localStorage.removeItem("pending_resume_id");
          window.localStorage.removeItem("pending_template_key");
        }
      }

      // Strip the hash from history so the token doesn't linger in the URL bar.
      try {
        window.history.replaceState({}, "", returnTo);
      } catch {
        /* ignore */
      }
      router.replace(returnTo);
    };

    run();
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