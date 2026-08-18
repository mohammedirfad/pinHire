'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar, FilterState } from '@/components/FilterBar';
import { JobCard } from '@/components/JobCard';
import { JobDetailModal } from '@/components/JobDetailModal';
import { MOCK_JOBS } from '@/lib/mockData';
import { getDistanceKm, geocodeLocation } from '@/lib/geo';
import { MapPin, List, Map as MapIcon, AlertCircle, Globe, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const JobMap = dynamic(() => import('@/components/JobMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-400 rounded-2xl animate-pulse">
      <div className="flex flex-col items-center gap-2">
        <MapPin className="h-8 w-8 text-coral-500 animate-bounce" />
        <span className="text-xs font-semibold">Loading Map View...</span>
      </div>
    </div>
  ),
});

function JobsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const initialKeyword = searchParams.get('keyword') || '';
  const initialLocation = searchParams.get('location') || '';

  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);
  const [filters, setFilters] = useState<FilterState>({
    experienceBand: searchParams.get('experienceBand') || 'all',
    jobType: searchParams.get('jobType') || 'all',
    sortBy: searchParams.get('sortBy') || 'latest',
    radiusKm: Number(searchParams.get('radiusKm')) || 0,
  });
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [locating, setLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 }); // Bangalore default
  const [searchThisAreaVisible, setSearchThisAreaVisible] = useState(false);
  const [pendingMapCenter, setPendingMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil((jobs?.length || 0) / pageSize));
  const paginatedJobs = (jobs || []).slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // On mount: if location specified in URL, geocode and center map there; otherwise try browser location
  useEffect(() => {
    if (initialLocation || initialKeyword) {
      fetchJobs(initialKeyword, initialLocation, filters);
    } else {
      tryGeolocate();
    }
  }, []);

  const tryGeolocate = () => {
    if ('geolocation' in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setMapCenter({ lat, lng });
          setLocating(false);
          fetchJobsNearCoords(lat, lng);
        },
        () => {
          setLocating(false);
          // Denied — show all jobs globally
          fetchJobs('', '', filters, true);
        },
        { timeout: 5000 }
      );
    } else {
      fetchJobs('', '', filters, true);
    }
  };

  const fetchJobsNearCoords = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('lat', lat.toString());
      params.set('lng', lng.toString());
      params.set('radiusKm', '100');
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs?.length ? data.jobs : MOCK_JOBS);
      } else setJobs(MOCK_JOBS);
    } catch { setJobs(MOCK_JOBS); }
    finally { setLoading(false); }
  };

  const fetchJobs = async (kw = keyword, loc = location, f = filters, globalFallback = false) => {
    setLoading(true);
    setCurrentPage(1);
    setSelectedJob(null);
    try {
      const params = new URLSearchParams();
      const cleanKeyword = kw.trim();
      const cleanLocation = loc.trim();
      if (cleanKeyword) params.set('keyword', cleanKeyword);

      // ALWAYS geocode the searched location to center the map on that city/country regardless of whether jobs exist
      if (cleanLocation) {
        params.set('location', cleanLocation);
        const geoCoords = await geocodeLocation(cleanLocation);
        if (geoCoords) {
          setMapCenter({ lat: geoCoords.lat, lng: geoCoords.lng });
          params.set('lat', geoCoords.lat.toString());
          params.set('lng', geoCoords.lng.toString());
          if (f.radiusKm > 0) params.set('radiusKm', f.radiusKm.toString());
        }
      }

      if (f.experienceBand !== 'all') params.set('experienceBand', f.experienceBand);
      if (f.jobType !== 'all') params.set('jobType', f.jobType);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      } else setJobs(globalFallback ? MOCK_JOBS : []);
    } catch { setJobs(globalFallback ? MOCK_JOBS : []); }
    finally { setLoading(false); }
  };

  const handleSearchSubmit = (query: { keyword: string; location: string }) => {
    const cleanKeyword = query.keyword.trim();
    const cleanLocation = query.location.trim();
    const nextFilters = cleanLocation ? filters : { ...filters, radiusKm: 0 };
    setKeyword(cleanKeyword);
    setLocation(cleanLocation);
    setFilters(nextFilters);
    fetchJobs(cleanKeyword, cleanLocation, nextFilters);
    updateUrlParams(cleanKeyword, cleanLocation, nextFilters);

    if (cleanKeyword || cleanLocation) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'search',
          path: `/jobs?keyword=${encodeURIComponent(cleanKeyword)}&location=${encodeURIComponent(cleanLocation)}`,
        }),
        keepalive: true,
      }).catch(() => {});
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    fetchJobs(keyword, location, newFilters);
    updateUrlParams(keyword, location, newFilters);
  };

  const updateUrlParams = (kw: string, loc: string, f: FilterState) => {
    const params = new URLSearchParams();
    if (kw) params.set('keyword', kw);
    if (loc) params.set('location', loc);
    if (f.experienceBand !== 'all') params.set('experienceBand', f.experienceBand);
    if (f.jobType !== 'all') params.set('jobType', f.jobType);
    startTransition(() => router.push(`/jobs?${params.toString()}`));
  };

  const handleMapBoundsChange = (newCenter: { lat: number; lng: number }) => {
    const dist = getDistanceKm(mapCenter.lat, mapCenter.lng, newCenter.lat, newCenter.lng);
    if (dist > 5) { setPendingMapCenter(newCenter); setSearchThisAreaVisible(true); }
  };

  const handleSearchThisArea = () => {
    if (pendingMapCenter) {
      setMapCenter(pendingMapCenter);
      setSearchThisAreaVisible(false);
      fetchJobsNearCoords(pendingMapCenter.lat, pendingMapCenter.lng);
      toast.success('Updated job pins for this area!');
    }
  };

  const handleLocateUser = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        fetchJobsNearCoords(pos.coords.latitude, pos.coords.longitude);
        toast.success('Showing jobs near your current location!');
      },
      () => { setLocating(false); toast.info('Location access denied.'); }
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">

      {/* Search Header */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-3 z-20 flex-shrink-0">
        <div className="mx-auto max-w-7xl space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-3xl">
              <SearchBar
                initialKeyword={keyword}
                initialLocation={location}
                onSearch={handleSearchSubmit}
                onLocateUser={handleLocateUser}
              />
            </div>
            {/* Mobile view toggle */}
            <div className="flex md:hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 p-1">
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md text-xs font-semibold flex items-center gap-1 ${viewMode === 'list' ? 'bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white' : 'text-slate-500'}`}>
                <List className="h-4 w-4" /> List
              </button>
              <button onClick={() => setViewMode('map')} className={`p-2 rounded-md text-xs font-semibold flex items-center gap-1 ${viewMode === 'map' ? 'bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white' : 'text-slate-500'}`}>
                <MapIcon className="h-4 w-4" /> Map
              </button>
            </div>
          </div>
          <FilterBar filters={filters} onChange={handleFilterChange} />
        </div>
      </div>

      {/* Main body */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Left: Job List */}
        <div className={`w-full md:w-[460px] lg:w-[500px] flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-4 space-y-3 ${viewMode === 'map' ? 'hidden md:block' : 'block'}`}>

          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {locating
                ? <span className="flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Detecting your location…</span>
                : <><strong className="text-brand-600 dark:text-brand-400">{jobs.length}</strong> pinned jobs {location ? `near "${location}"` : 'worldwide'}</>
              }
            </span>
            <button onClick={() => { setKeyword(''); setLocation(''); fetchJobs('', '', { ...filters, radiusKm: 0 }, true); }} className="flex items-center gap-1 text-brand-600 hover:underline">
              <Globe className="h-3.5 w-3.5" /> Show all
            </button>
          </div>

          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-28 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <>
              <div className="space-y-3">
                {paginatedJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSelected={selectedJob?.id === job.id}
                    onSelect={(j) => { setSelectedJob(j); setMapCenter({ lat: j.lat, lng: j.lng }); }}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 font-medium">
                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({jobs.length} jobs)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 my-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-coral-50 dark:bg-coral-950">
                <AlertCircle className="h-6 w-6 text-coral-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No active jobs found {location ? `in "${location}"` : ''}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The map has been centered on <strong className="text-slate-700 dark:text-slate-300">{location || 'your search location'}</strong>. Currently there are no open job pins at this location.
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => { setKeyword(''); setLocation(''); fetchJobs('', '', { ...filters, radiusKm: 0 }, true); }}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-md"
                >
                  Show All Worldwide Jobs
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Map */}
        <div className={`flex-1 h-full relative ${viewMode === 'list' ? 'hidden md:block' : 'block'}`}>
          <JobMap
            jobs={jobs}
            selectedJobId={selectedJob?.id}
            onSelectJob={j => setSelectedJob(j)}
            center={mapCenter}
            zoom={12}
            onBoundsChange={handleMapBoundsChange}
            searchThisAreaVisible={searchThisAreaVisible}
            onSearchThisAreaClick={handleSearchThisArea}
          />
        </div>
      </div>

      {/* Job Detail Slide-over */}
      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <MapPin className="h-10 w-10 text-coral-500 animate-bounce" />
          <span className="text-xs font-semibold text-slate-500">Loading map jobs…</span>
        </div>
      </div>
    }>
      <JobsPageInner />
    </Suspense>
  );
}
