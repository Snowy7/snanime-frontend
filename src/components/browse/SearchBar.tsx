import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}: SearchBarProps) {
  const { t } = useLanguage();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localQuery);
    onSearchSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className="w-full px-4 py-3 pr-12 bg-neutral-900/80 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700"
        />
        <button
          type="submit"
          className="absolute right-2 p-2 text-neutral-400 hover:text-neutral-200 focus:outline-none focus:text-neutral-200 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
} 