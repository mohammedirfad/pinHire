'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ResumeUploader } from '@/components/ResumeUploader';
import { ParsedResume } from '@/lib/resumeParser';
import { JobCard } from '@/components/JobCard';
import { JobDetailModal } from '@/components/JobDetailModal';
import { MOCK_JOBS, JobMock } from '@/lib/mockData';
import { geocodeLocation, KNOWN_CITIES } from '@/lib/geo';
import { MapPin, Sparkles, CheckCircle2, Briefcase, Award, Search, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const JobMap = dynamic(() => import('@/components/JobMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-slate-900 text-slate-400 rounded-2xl animate-pulse">
      <span className="text-xs font-semibold">Loading Live Map Pins…</span>
    </div>
  ),
});

const POPULAR_CITIES = [
  'Bangalore, India',
  'Kochi, India',
  'Mumbai, India',
  'Delhi NCR, India',
  'Hyderabad, India',
  'San Francisco, CA',
  'London, UK',
  'Remote Worldwide',
];

export default function ResumeSearchPage() {
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
  const [targetLocation, setTargetLocation] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 });
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Pagination state for matched jobs
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const handleParsed = (data: ParsedResume, jobsFromApi?: any[]) => {
    setParsed(data);
    setTargetLocation(data.locationPreference || 'Bangalore, India');
    setCurrentPage(1);

    const jobsList = jobsFromApi && jobsFromApi.length > 0 ? jobsFromApi : MOCK_JOBS;
    setMatchedJobs(jobsList);

    // Geocode candidate target location & re-center map
    updateMapLocation(data.locationPreference || 'Bangalore, India');
  };

  const updateMapLocation = async (locName: string) => {
    if (!locName || !locName.trim()) return;
    const coords = await geocodeLocation(locName);
    if (coords) {
      setMapCenter({ lat: coords.lat, lng: coords.lng });
      toast.success(`Map centered on ${locName}`);
    }
  };

  const handleLocationChange = (newLoc: string) => {
    setTargetLocation(newLoc);
    updateMapLocation(newLoc);
  };

  // Pagination math
  const totalPages = Math.ceil(matchedJobs.length / pageSize);
  const paginatedJobs = matchedJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Page Title Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-xs font-bold border border-brand-100 dark:border-brand-900">
            <Sparkles className="h-3.5 w-3.5 text-coral-500" />
            Resume-First Job Search
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Upload Resume → Discover Matching Map Jobs
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Extract candidate skills, experience level, and preferred city to pinpoint matching active roles directly on the map.
          </p>
        </div>

        {/* Resume Uploader Component */}
        <ResumeUploader onParsed={(p, jobs) => handleParsed(p, jobs)} />

        {/* Analysis Results & Map View */}
        {parsed && (
          <div className="space-y-6 pt-4">

            {/* Extracted Resume Profile & Interactive Target Location Card */}
            <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-6 dark:border-brand-900 dark:bg-brand-950/40 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-100 dark:border-brand-900 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Extracted Candidate Profile
                  </h2>
                </div>
                <span className="text-xs text-brand-700 dark:text-brand-300 font-bold bg-brand-100 dark:bg-brand-900 px-3 py-1 rounded-full w-fit">
                  <Briefcase className="inline h-3.5 w-3.5 mr-1" />
                  {parsed.experienceYears}+ Years Experience Detected
                </span>
              </div>

              {/* Skills Badges */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Extracted Tech Skills ({parsed.skills.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                    >
                      ⚡ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Roles & Interactive Location Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-brand-100 dark:border-brand-900/60">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Target Candidate Roles:</span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {parsed.detectedRoles.join(', ')}
                  </div>
                </div>

                {/* Target Location Input & Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-coral-500" />
                    Target Job Location (Select to update live map):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={targetLocation}
                      onChange={(e) => setTargetLocation(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && updateMapLocation(targetLocation)}
                      placeholder="e.g. Bangalore, Kochi, Remote"
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                    <button
                      onClick={() => updateMapLocation(targetLocation)}
                      className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors"
                    >
                      Update Map
                    </button>
                  </div>

                  {/* Quick City Selector Chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {POPULAR_CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleLocationChange(city)}
                        className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                          targetLocation === city
                            ? 'bg-brand-600 text-white border-brand-600 font-bold'
                            : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {city.split(',')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Map of Matched Jobs */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between px-3 py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-coral-500" />
                  Matched Map Job Pins ({matchedJobs.length}) near "{targetLocation}"
                </span>
                <span className="text-[11px] text-slate-500">Centered on target location</span>
              </div>
              <div className="h-[380px] w-full rounded-xl overflow-hidden">
                <JobMap
                  jobs={matchedJobs}
                  center={mapCenter}
                  selectedJobId={selectedJob?.id}
                  onSelectJob={(job) => setSelectedJob(job)}
                />
              </div>
            </div>

            {/* Matched Job Cards Grid with Match Scores & Pagination */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Top Matching Job Openings for Your Resume
                </h3>
                <span className="text-xs text-slate-500">
                  Showing {paginatedJobs.length} of {matchedJobs.length} matches
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedJobs.map((job) => (
                  <div key={job.id} className="relative group">
                    {/* Match Score Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-extrabold shadow-md">
                        🎯 {job.matchScore || 90}% Match
                      </span>
                    </div>
                    <JobCard
                      job={job}
                      isSelected={selectedJob?.id === job.id}
                      onSelect={(j) => setSelectedJob(j)}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-xl text-xs font-bold transition-all ${
                        currentPage === page
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Slide-over Job Detail Modal */}
      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
