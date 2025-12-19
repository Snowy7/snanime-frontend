"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { History } from "lucide-react";

export default function HistoryLoading() {
  return (
    <main className="min-h-screen bg-background pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
            <History className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Watch History</h1>
            <Skeleton className="h-5 w-32 mt-1" />
          </div>
        </div>

        {/* List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5">
              <Skeleton className="w-32 aspect-video rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

