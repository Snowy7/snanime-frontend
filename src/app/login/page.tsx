"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { getDirection } = useLanguage();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isRTL = getDirection() === "rtl";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    router.push("/");
  };

  return (
    <main className="min-h-screen w-full relative overflow-hidden flex items-center justify-center py-20">
      {/* Background with Image and Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
        <img 
          src="/images/anime-sakuna.jpg" 
          alt="Background" 
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      <div className="relative z-20 w-full max-w-md px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="rounded-3xl border border-white/10 bg-black/10 p-8 shadow-2xl shadow-black/80 backdrop-blur-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{isRTL ? "تسجيل الدخول" : "Welcome Back"}</h1>
            <p className="text-white/60">
              {isRTL ? "مرحبًا بعودتك. سجّل الدخول للمتابعة." : "Enter your details to access your account"}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">
                {isRTL ? "البريد الإلكتروني" : "Email Address"}
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                required
                className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none ring-0 placeholder:text-white/20 focus:border-red-500/50 focus:bg-white/10 transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                  {isRTL ? "كلمة المرور" : "Password"}
                </label>
                <Link href="/forgot-password" className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  {isRTL ? "نسيت كلمة المرور؟" : "Forgot password?"}
                </Link>
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
                className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none ring-0 placeholder:text-white/20 focus:border-red-500/50 focus:bg-white/10 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 text-center">
                {error}
              </div>
            )}

            <Button 
              variant="primary" 
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-red-600/20 mt-2 hover:scale-[1.02] active:scale-[0.98] transition-all" 
              disabled={isLoading}
            >
              {isLoading ? (isRTL ? "جارٍ تسجيل الدخول..." : "Signing in...") : isRTL ? "تسجيل الدخول" : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-white/60">
              {isRTL ? "ليس لديك حساب؟ " : "Don't have an account? "}
              <Link href="/signup" className="text-white font-semibold hover:text-red-400 transition-colors ml-1">
                {isRTL ? "إنشاء حساب" : "Sign up"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}


