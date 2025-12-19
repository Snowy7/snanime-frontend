"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService, UserStats } from "@/services/user";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  User, 
  Bookmark, 
  Heart, 
  History, 
  CheckCircle, 
  Settings,
  Mail,
  Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePageClient() {
  const { user, isAuthenticated, getAccessToken, signIn, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const userStats = await userService.getStats(token);
      setStats(userStats);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 rounded-full bg-white/5 mb-6">
              <User className="w-12 h-12 text-white/40" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign in to view your profile</h1>
            <p className="text-white/60 mb-6 max-w-md">
              Access your watchlist, favorites, and watch history.
            </p>
            <Button onClick={() => signIn()} size="lg" className="gap-2">
              Sign In with Google
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const statCards = [
    { 
      label: "In Watchlist", 
      value: stats?.watchlistCount || 0, 
      icon: <Bookmark className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
      href: "/watchlist"
    },
    { 
      label: "Favorites", 
      value: stats?.favoritesCount || 0, 
      icon: <Heart className="w-5 h-5" />,
      color: "from-red-500 to-pink-500",
      href: "/favorites"
    },
    { 
      label: "Episodes Watched", 
      value: stats?.watchedEpisodes || 0, 
      subtitle: stats?.completedEpisodes ? `${stats.completedEpisodes} completed` : undefined,
      icon: <History className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
      href: "/history"
    },
    { 
      label: "Completed Anime", 
      value: stats?.completedAnime || 0, 
      icon: <CheckCircle className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
      href: "/watchlist?status=COMPLETED"
    },
  ];

  return (
    <main className="min-h-screen bg-background pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-white/10 ring-4 ring-white/10">
                {user?.profileImageUrl ? (
                  <Image
                    src={user.profileImageUrl}
                    alt={user.displayName || "Profile"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white/40" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {user?.displayName || "Anime Fan"}
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-white/60">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => (
              <Link 
                key={stat.label} 
                href={stat.href}
                className="group"
              >
                <div className={`
                  relative overflow-hidden rounded-xl p-6 
                  bg-gradient-to-br ${stat.color} 
                  opacity-90 hover:opacity-100 transition-opacity
                `}>
                  <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-white/10" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-white/80 mb-2">
                      {stat.icon}
                      <span className="text-sm font-medium">{stat.label}</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    {'subtitle' in stat && stat.subtitle && (
                      <p className="text-xs text-white/60 mt-1">{stat.subtitle}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
          
          <div className="grid gap-3">
            <Link 
              href="/watchlist"
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Bookmark className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">My Watchlist</h3>
                <p className="text-sm text-white/60">Track your anime progress</p>
              </div>
            </Link>
            
            <Link 
              href="/favorites"
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="p-3 rounded-lg bg-red-500/20">
                <Heart className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Favorites</h3>
                <p className="text-sm text-white/60">Your favorite anime collection</p>
              </div>
            </Link>
            
            <Link 
              href="/history"
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="p-3 rounded-lg bg-green-500/20">
                <History className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Watch History</h3>
                <p className="text-sm text-white/60">Continue where you left off</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

