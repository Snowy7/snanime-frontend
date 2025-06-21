"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // For active link
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Bookmark, User, Crown, Menu, X } from "lucide-react";
import { ControlButton } from "./ui/button"; // Adjust path if needed
import { useLanguage } from "@/context/LanguageContext";
import SearchDropdown from "./SearchDropdown";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t, getDirection } = useLanguage();
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t("home") }, // Assuming home is '/'
    {
      href: "/browse",
      label: t("browse_"),
      hasDropdown: true,
      dropdownItems: [
        { href: "/browse/anime", label: t("anime") },
        { href: "/browse/movies", label: t("movies") },
        { href: "/browse/series", label: t("series") },
        { href: "/browse/genres", label: t("genres") },
      ],
    },
    { href: "/news", label: t("news") },
  ];
  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSearchToggle = () => {
    setIsSearchExpanded((prev) => !prev);
  };

  const handleSearchClose = () => {
    setIsSearchExpanded(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
                ${isScrolled || isMobileMenuOpen ? "bg-black/40 backdrop-blur-lg shadow-xl" : "bg-transparent"}
            `}
    >
      {pathname === "/" && <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left Side: Logo and Nav Links */}
          <div className="flex items-center space-x-4 md:space-x-6 lg:space-x-8">
            <Link href="/" className="flex flex-col items-start" onClick={handleNavLinkClick}>
              <div className="flex items-center">
                <span className="text-2xl md:text-3xl font-bold text-white select-none">Snアニメ</span>
              </div>
              <span className="text-[10px] md:text-xs text-white -mt-1 hidden sm:block select-none">Laugh, Watch, Repeat!</span>
            </Link>

            <ul className="hidden md:flex items-center space-x-5 lg:space-x-7">
              {navLinks.map((link) => (
                <li key={link.href} className="relative py-2 group">
                  <Link
                    href={link.href || "#"}
                    className={`text-sm lg:text-base font-medium transition-colors
                                                        ${pathname === link.href ? "text-white" : "text-neutral-300 hover:text-white"}
                                                `}
                    onClick={handleNavLinkClick}
                  >
                    <span className="flex items-center">
                      {link.label}
                      {link.hasDropdown && <ChevronDown className="w-4 h-4 mx-1 opacity-70" />}
                    </span>
                    {pathname === link.href && <span className="absolute left-1/2 -translate-x-1/2 bottom-[-6px] w-1.5 h-1.5 bg-white rounded-full"></span>}
                  </Link>

                  {/* Modern Dropdown Menu with Grid Layout */}
                  {link.hasDropdown && link.dropdownItems && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-neutral-800/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out transform group-hover:translate-y-0 translate-y-2 z-50">
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          {link.dropdownItems.map((item, index) => {
                            const icons = [
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" key="anime">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path
                                  fillRule="evenodd"
                                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                  clipRule="evenodd"
                                />
                              </svg>,
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" key="movies">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>,
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" key="series">
                                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                              </svg>,
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" key="genres">
                                <path
                                  fillRule="evenodd"
                                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>,
                            ];

                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={`group/item flex flex-col items-center p-4 rounded-xl transition-all duration-200 hover:scale-105
                                                                                                        ${
                                                                                                          pathname === item.href
                                                                                                            ? "text-red-400 bg-red-500/10 border border-red-500/20 shadow-lg shadow-red-500/10"
                                                                                                            : "text-neutral-300 hover:text-white hover:bg-neutral-800/50 border border-transparent hover:border-neutral-700/50"
                                                                                                        }
                                                                                                `}
                                onClick={handleNavLinkClick}
                              >
                                <div
                                  className={`p-3 rounded-lg mb-2 transition-colors
                                                                                                        ${
                                                                                                          pathname === item.href
                                                                                                            ? "bg-red-500/20 text-red-400"
                                                                                                            : "bg-neutral-800/50 text-neutral-400 group-hover/item:bg-neutral-700/50 group-hover/item:text-white"
                                                                                                        }
                                                                                                `}
                                >
                                  {icons[index] || icons[0]}
                                </div>
                                <span className="text-sm font-medium text-center">{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>          {/* Right Side: Search, Icons, Premium Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <SearchDropdown 
              isExpanded={isSearchExpanded}
              onToggle={handleSearchToggle}
              onClose={handleSearchClose}
            />

            <div className="hidden md:flex items-center space-x-2 sm:space-x-3">
              <ControlButton type="navbar-action" variant="navbar" iconOnly>
                <Bookmark className="w-5 h-5" />
              </ControlButton>
              <ControlButton type="navbar-action" variant="navbar" iconOnly>
                <User className="w-5 h-5" />
              </ControlButton>
              <ControlButton type="premium" variant="navbar">
                <Crown className="w-4 h-4 mx-2" color="gold" /> {/* Color handled by ControlButton */}
                <span className="text-xs md:text-sm">{t("try_premium")}</span>
              </ControlButton>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-neutral-300 hover:text-white focus:outline-none" aria-label="Toggle menu">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-lg shadow-xl overflow-hidden"
          >
            <ul className="flex flex-col px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block py-2.5 px-3 text-base font-medium transition-colors rounded-md
                      ${pathname === link.href ? "text-red-400 bg-neutral-700/60" : "text-neutral-200 hover:text-white hover:bg-neutral-700/40"}
                    `}
                    onClick={handleNavLinkClick}
                  >
                    <span className="flex items-center">
                      {link.label}
                      {link.hasDropdown && <ChevronDown className="w-4 h-4 ml-auto opacity-70" />}
                    </span>
                  </Link>
                  <ControlButton type="navbar-action" variant="navbar" className="w-full justify-start !p-2.5 !rounded-md !bg-transparent hover:!bg-neutral-700/40">
                    <Bookmark className="w-5 h-5 mr-3" /> My List
                  </ControlButton>
                </li>
              ))}
              <li>
                <ControlButton type="navbar-action" variant="navbar" className="w-full justify-start !p-2.5 !rounded-md !bg-transparent hover:!bg-neutral-700/40">
                  <User className="w-5 h-5 mr-3" /> Profile
                </ControlButton>
              </li>
              <li className="pt-1">
                <ControlButton type="premium" variant="navbar" className="w-full justify-center !py-2.5 !rounded-md !bg-yellow-500/10 hover:!bg-yellow-500/20">
                  <Crown className="w-5 h-5" /> {/* Color handled by ControlButton */}
                  <span className="text-sm">{t("try_premium")}</span>
                </ControlButton>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
