"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface Props {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function DocumentationSearchBar({
  onSearch,
  placeholder = "Search templates, tags, categories...",
  initialValue = "",
}: Props) {
  const [query, setQuery] = useState(initialValue);

  // Debounce search queries
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery("");
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 transition hover:border-white/20 focus-within:border-teal-400/50 focus-within:bg-white/8">
        <Search size={18} className="text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full flex-1 border-0 bg-transparent text-sm outline-none placeholder-slate-500 text-white"
        />
        {query && (
          <button
            onClick={handleClear}
            className="rounded-full p-1 hover:bg-white/10 transition"
            aria-label="Clear search"
          >
            <X size={16} className="text-slate-400 hover:text-slate-200" />
          </button>
        )}
      </div>

      {/* Search suggestions or results count would go here */}
    </div>
  );
}
