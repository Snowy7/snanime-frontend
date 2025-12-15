"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function SignupPage() {
  const router = useRouter();
  const { getDirection } = useLanguage();
  const { register, isLoading, error } = useAuth();
  const isRTL = getDirection() === "rtl";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register({
      username,
      email,
      password,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });
    router.push("/");
  };

  return (
    <main className="min-h-screen w-full relative overflow-hidden flex items-center justify-center py-20">
      {/* Background with Image and Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
        <img 
          src="/images/anime-chill.jpg" 
          alt="Background" 
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      <div className="relative z-20 w-full max-w-lg px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="rounded-3xl border border-white/10 bg-black/10 p-8 shadow-2xl shadow-black/80 backdrop-blur-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{isRTL ? "إنشاء حساب" : "Create Account"}</h1>
            <p className="text-white/60">
              {isRTL ? "أنشئ حسابًا لحفظ الأنمي ومتابعة تقدمك." : "Join our community and track your anime journey"}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">
                  {isRTL ? "الاسم الأول" : "First name"}
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  type="text"
                  autoComplete="given-name"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-white/20 focus:border-red-500/50 focus:bg-white/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">
                  {isRTL ? "اسم العائلة" : "Last name"}
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  type="text"
                  autoComplete="family-name"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-white/20 focus:border-red-500/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">
                {isRTL ? "اسم المستخدم" : "Username"}
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                autoComplete="username"
                required
                minLength={3}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-white/20 focus:border-red-500/50 focus:bg-white/10 transition-all"
                placeholder="snowy_dev"
              />
            </div>

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
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-white/20 focus:border-red-500/50 focus:bg-white/10 transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">
                {isRTL ? "كلمة المرور" : "Password"}
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-white/20 focus:border-red-500/50 focus:bg-white/10 transition-all"
                placeholder={isRTL ? "٨ أحرف على الأقل" : "At least 8 characters"}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 text-center">
                {error}
              </div>
            )}

            <Button 
              variant="primary" 
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-red-600/20 mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all" 
              disabled={isLoading}
            >
              {isLoading ? (isRTL ? "جارٍ إنشاء الحساب..." : "Creating account...") : isRTL ? "إنشاء حساب" : "Create Account"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-white/60">
              {isRTL ? "لديك حساب؟ " : "Already have an account? "}
              <Link href="/login" className="text-white font-semibold hover:text-red-400 transition-colors ml-1">
                {isRTL ? "تسجيل الدخول" : "Sign in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}


