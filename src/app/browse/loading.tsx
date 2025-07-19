"use client";

import Loading from "@/components/Loading";

export default function LoadingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Loading size="large" />
      <p className="text-white text-2xl font-bold">Loading your experience...</p>
    </div>
  );
}
