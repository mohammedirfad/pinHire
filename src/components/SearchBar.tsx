'use client';

import React, { useState } from 'react';
import { Search, MapPin, Briefcase, Navigation, Sparkles } from 'lucide-react';
import { KNOWN_CITIES } from '@/lib/geo';

interface SearchBarProps {
  initialKeyword?: string;
  initialLocation?: string;
  onSearch: (query: { keyword: string; location: string }) => void;
  onLocateUser?: () => void;
}

export function SearchBar({
  initialKeyword = '',
  initialLocation = '',
  onSearch,
  onLocateUser,
}: SearchBarProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ keyword, location });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-white p-2 shadow-xl border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1.2fr,auto] gap-2 items-center">
        
        {/* Role / Keyword Input */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-transparent focus-within:border-brand-500 transition-colors">
          <Search className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Role, skill, or company (e.g. React, Stripe)"
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
          />
        </div>

        {/* Location Input with City Autocomplete & GPS Locate */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-transparent focus-within:border-brand-500 transition-colors">
          <MapPin className="h-5 w-5 text-coral-500 flex-shrink-0" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, district, or country (e.g. Bangalore)"
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
          />
          {onLocateUser && (
            <button
              type="button"
              onClick={onLocateUser}
              title="Auto-detect my location"
              className="p-1 rounded-md text-slate-400 hover:text-brand-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
            >
              <Navigation className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search CTA */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-pin transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4 text-coral-400" />
          Find Map Jobs
        </button>

      </div>
    </form>
  );
}
