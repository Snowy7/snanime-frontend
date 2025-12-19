"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Menu, User, X, LogOut, Settings, Globe, Heart, History, TrendingUp, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/context/LanguageContext";
import SearchDropdown from "./SearchDropdown";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t, getDirection, language, setLanguage } = useLanguage();
  const { user, isAuthenticated, signIn, signUp, signOut } = useAuth();
  const isRTL = getDirection() === "rtl";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSearchToggle = () => {
    setIsSearchExpanded((prev) => !prev);
  };

  const handleSearchClose = () => {
    setIsSearchExpanded(false);
  };

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/browse", label: "Anime" },
    { href: "/trending", label: "Trending" },
    { href: "/latest", label: "Latest" },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-4 z-50 transition-all duration-500",
        "mx-4 md:mx-auto max-w-5xl rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20 py-2"
      )}
    >
      <div className="mx-auto px-6 max-w-full">
        <div className="flex h-12 items-center justify-between">
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors lg:hidden"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/" className="flex flex-col items-start group" onClick={handleNavLinkClick}>
              <div className="flex items-center">
                <span className="text-xl md:text-2xl font-bold text-white select-none group-hover:text-primary transition-colors">Snアニメ</span>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all relative group hover:bg-white/5",
                  pathname === link.href
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center transition-all duration-300 bg-transparent border-none">
              <SearchDropdown 
                isExpanded={isSearchExpanded}
                onToggle={handleSearchToggle}
                onClose={handleSearchClose}
              />
            </div>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-white/60 hover:text-white hover:bg-white/10">
                  <Globe size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-white/10 backdrop-blur-xl text-white">
                <DropdownMenuItem onClick={() => setLanguage("en")} className="focus:bg-white/10 cursor-pointer">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ar")} className="focus:bg-white/10 cursor-pointer font-arabic">
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 border border-white/10 bg-white/5 overflow-hidden">
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black/90 border-white/10 backdrop-blur-xl text-white mt-2">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                      <p className="text-xs leading-none text-white/50">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                    <Link href="/profile" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                    <Link href="/watchlist" className="flex items-center w-full">
                      <Bookmark className="mr-2 h-4 w-4" />
                      <span>Watchlist</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                    <Link href="/favorites" className="flex items-center w-full">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favorites</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                    <Link href="/history" className="flex items-center w-full">
                      <History className="mr-2 h-4 w-4" />
                      <span>Watch History</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                    <Link href="/profile/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    className="focus:bg-red-500/20 focus:text-red-400 text-red-400 cursor-pointer"
                    onSelect={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden sm:inline-flex text-white/70 hover:text-white hover:bg-white/5"
                  onClick={() => signIn()}
                >
                  Sign In
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="hidden sm:inline-flex rounded-full px-5 h-8 text-xs font-bold bg-white text-black hover:bg-white/90 shadow-none border-none"
                  onClick={() => signUp()}
                >
                  Get Started
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="sm:hidden rounded-full w-8 h-8"
                  onClick={() => signIn()}
                >
                  <User size={18} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
        {isMobileMenuOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-xl border-b border-white/5 overflow-hidden">
          <nav className="flex flex-col p-6 gap-2">
              {navLinks.map((link) => (
                  <Link
                key={link.href}
                    href={link.href}
                    onClick={handleNavLinkClick}
                className={cn(
                  "px-4 py-3 rounded-xl text-lg font-medium transition-colors",
                  pathname === link.href
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                      {link.label}
                  </Link>
            ))}
            
            {isAuthenticated && user && (
              <>
                <div className="h-px bg-white/10 my-2" />
                <Link href="/watchlist" onClick={handleNavLinkClick} className="px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-3">
                  <Bookmark size={18} /> Watchlist
                </Link>
                <Link href="/favorites" onClick={handleNavLinkClick} className="px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-3">
                  <Heart size={18} /> Favorites
                </Link>
                <Link href="/history" onClick={handleNavLinkClick} className="px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-3">
                  <History size={18} /> Watch History
                </Link>
                <Link href="/profile" onClick={handleNavLinkClick} className="px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-3">
                  <User size={18} /> Profile
                </Link>
              </>
            )}
            
            {!isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={() => { handleNavLinkClick(); signIn(); }}
                >
                  Sign In with Google
                </Button>
              </div>
        )}
    </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
