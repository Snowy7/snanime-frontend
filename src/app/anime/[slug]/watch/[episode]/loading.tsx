"use client";

import Loading from "@/components/Loading";

export default function LoadingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Loading size="large" text="Loading your experience..." />
    </div>
  );
}
