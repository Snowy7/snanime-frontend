"use client";

import { Suspense } from "react";
import { AnimeProvider } from "@/context/AnimeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <AuthProvider>
          <AnimeProvider>{children}</AnimeProvider>
        </AuthProvider>
      </Suspense>
    </LanguageProvider>
  );
}
