"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  User, 
  Globe, 
  Bell,
  Shield,
  Trash2,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SettingsPageClient() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 rounded-full bg-white/5 mb-6">
              <Settings className="w-12 h-12 text-white/40" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign in to access settings</h1>
            <p className="text-white/60 mb-6 max-w-md">
              Customize your SnAnime experience.
            </p>
            <Button onClick={() => signIn()} size="lg" className="gap-2">
              Sign In
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-28 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-white/60">Manage your account preferences</p>
          </div>
        </div>

        {/* Account Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
              Account
            </h2>
            <div className="bg-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
              {/* Profile */}
              <div className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                  {user?.profileImageUrl ? (
                    <Image
                      src={user.profileImageUrl}
                      alt={user.displayName || "Profile"}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{user?.displayName || "User"}</p>
                  <p className="text-sm text-white/60">{user?.email}</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/handler/account-settings">Edit</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
              Preferences
            </h2>
            <div className="bg-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
              {/* Language */}
              <div className="p-4 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Language</p>
                  <p className="text-sm text-white/60">Choose your preferred language</p>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
                  className="bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>

              {/* Notifications */}
              <div className="p-4 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Bell className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Notifications</p>
                  <p className="text-sm text-white/60">Manage notification preferences</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </div>
          </div>

          {/* Security */}
          <div>
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
              Security
            </h2>
            <div className="bg-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
              <Link 
                href="/handler/account-settings"
                className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
              >
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Security Settings</p>
                  <p className="text-sm text-white/60">Password, 2FA, and sessions</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </Link>
            </div>
          </div>

          {/* Danger Zone */}
          <div>
            <h2 className="text-sm font-semibold text-red-400/60 uppercase tracking-wider mb-3">
              Danger Zone
            </h2>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Delete Account</p>
                  <p className="text-sm text-white/60">Permanently delete your account and data</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <Button 
            variant="ghost" 
            className="w-full justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </main>
  );
}

