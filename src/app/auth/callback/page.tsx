"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

/**
 * OAuth Callback Handler Content
 */
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Check for error in URL params
      const errorParam = searchParams.get("error");
      if (errorParam) {
        setStatus("error");
        setError(errorParam === "oauth_failed" ? "OAuth authentication failed. Please try again." : errorParam);
        return;
      }

      // Get userId and secret from OAuth2 token flow
      const userId = searchParams.get("userId");
      const secret = searchParams.get("secret");

      if (userId && secret) {
        try {
          const { appwriteAuth } = await import("@/lib/appwrite");
          await appwriteAuth.createSession(userId, secret);
          console.log("[Auth Callback] Session created successfully");
        } catch (err) {
          console.error("[Auth Callback] Failed to create session:", err);
          setStatus("error");
          setError("Failed to establish session. Please try again.");
          return;
        }
      }

      // Try to verify the session/user
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          await refreshUser();

          // Small delay to let state update
          await new Promise(resolve => setTimeout(resolve, 100));

          // Check if we have a user now
          const { appwriteAuth } = await import("@/lib/appwrite");
          const user = await appwriteAuth.getUser();

          if (user) {
            setStatus("success");
            // Redirect to home after a brief moment to show success
            setTimeout(() => {
              router.replace("/");
            }, 500);
            return;
          }
        } catch (err) {
          console.log(`[Auth Callback] Attempt ${attempts + 1} failed:`, err);
        }

        attempts++;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // If we get here, we couldn't establish the session
      setStatus("error");
      setError("Could not establish session. Please try signing in again.");
    };

    handleCallback();
  }, [refreshUser, router, searchParams]);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated && status === "loading") {
      setStatus("success");
      setTimeout(() => {
        router.replace("/");
      }, 500);
    }
  }, [isAuthenticated, status, router]);

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-white mb-2">Completing sign in...</h1>
            <p className="text-white/60">Please wait while we verify your account.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-white mb-2">Sign in successful!</h1>
            <p className="text-white/60">Redirecting you to the app...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-white mb-2">Sign in failed</h1>
            <p className="text-white/60 mb-4">{error}</p>
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </main>
  );
}

/**
 * OAuth Callback Page with Suspense boundary
 */
export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen w-full flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-white mb-2">Loading...</h1>
          </div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

