'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Navigation, Sparkles, X } from 'lucide-react';
import { getLocalLocationSuggestions } from '@/lib/geo';
import { getLocalKeywordSuggestions } from '@/lib/search';

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
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{ label: string; lat?: number; lng?: number }>>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const keywordBlurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationBlurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setKeyword(initialKeyword);
  }, [initialKeyword]);

  useEffect(() => {
    setLocation(initialLocation);
  }, [initialLocation]);

  useEffect(() => {
    const query = keyword.trim();
    if (query.length < 1) {
      setKeywordSuggestions([]);
      return;
    }

    const localSuggestions = getLocalKeywordSuggestions(query, 6);
    setKeywordSuggestions(localSuggestions);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/jobs/suggestions?q=${encodeURIComponent(query)}`);
        if (!res.ok) return;
        const data = await res.json();
        const remoteSuggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
        const merged = [...localSuggestions, ...remoteSuggestions].filter(
          (item, index, arr) => arr.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) === index
        );
        setKeywordSuggestions(merged.slice(0, 8));
      } catch {
        setKeywordSuggestions(localSuggestions);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    const query = location.trim();
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    const localSuggestions = getLocalLocationSuggestions(query, 5);
    setLocationSuggestions(localSuggestions);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=in&q=${encodeURIComponent(query)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const remoteSuggestions = (Array.isArray(data) ? data : []).map((item: any) => ({
          label: item.display_name,
          lat: Number(item.lat),
          lng: Number(item.lon),
        }));
        const merged = [...localSuggestions, ...remoteSuggestions].filter(
          (item, index, arr) => arr.findIndex((candidate) => candidate.label === item.label) === index
        );
        setLocationSuggestions(merged.slice(0, 6));
      } catch {
        setLocationSuggestions(localSuggestions);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ keyword, location });
  };

  const handleLocationSelect = (label: string) => {
    setLocation(label);
    setShowLocationSuggestions(false);
    onSearch({ keyword, location: label });
  };

  const handleKeywordSelect = (label: string) => {
    setKeyword(label);
    setShowKeywordSuggestions(false);
    onSearch({ keyword: label, location });
  };

  const clearKeyword = () => {
    setKeyword('');
    setKeywordSuggestions([]);
    setShowKeywordSuggestions(false);
    onSearch({ keyword: '', location });
  };

  const clearLocation = () => {
    setLocation('');
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
    onSearch({ keyword, location: '' });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-white p-2 shadow-xl border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1.2fr,auto] gap-2 items-center">
        
        {/* Role / Keyword Input */}
        <div className="relative flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-transparent focus-within:border-brand-500 transition-colors">
          <Search className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setShowKeywordSuggestions(true);
            }}
            onFocus={() => setShowKeywordSuggestions(true)}
            onBlur={() => {
              keywordBlurTimer.current = setTimeout(() => setShowKeywordSuggestions(false), 120);
            }}
            placeholder="Role, skill, or company (e.g. React, Stripe)"
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
          />
          {keyword && (
            <button
              type="button"
              onClick={clearKeyword}
              title="Clear role, skill, or company"
              className="flex-shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {showKeywordSuggestions && keywordSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {keywordSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleKeywordSelect(suggestion)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Search className="h-3.5 w-3.5 flex-shrink-0 text-brand-500" />
                  <span className="truncate">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location Input with City Autocomplete & GPS Locate */}
        <div className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-transparent focus-within:border-brand-500 transition-colors">
          <MapPin className="h-5 w-5 text-coral-500 flex-shrink-0" />
          <input
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowLocationSuggestions(true);
            }}
            onFocus={() => setShowLocationSuggestions(true)}
            onBlur={() => {
              locationBlurTimer.current = setTimeout(() => setShowLocationSuggestions(false), 120);
            }}
            placeholder="City, district, or country (e.g. Bangalore)"
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
          />
          {location && (
            <button
              type="button"
              onClick={clearLocation}
              title="Clear location"
              className="flex-shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
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
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {locationSuggestions.map((suggestion) => (
                <button
                  key={suggestion.label}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleLocationSelect(suggestion.label)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-coral-500" />
                  <span className="line-clamp-2">{suggestion.label}</span>
                </button>
              ))}
            </div>
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
