"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <main className="min-h-screen bg-background pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header Skeleton */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full" />
            <div className="flex-1 text-center md:text-left space-y-2">
              <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
              <Skeleton className="h-5 w-64 mx-auto md:mx-0" />
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        {/* Quick Links Skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  );
}

