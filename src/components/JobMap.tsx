'use client';

import React, { useEffect, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { MapPin, Sparkles } from 'lucide-react';
import { JobMock } from '@/lib/mockData';
import { getCompanyColor, getCompanyInitials } from '@/lib/companyLogo';

interface JobMapProps {
  jobs: JobMock[];
  selectedJobId?: string | null;
  onSelectJob?: (job: JobMock) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  onBoundsChange?: (bounds: { lat: number; lng: number }) => void;
  searchThisAreaVisible?: boolean;
  onSearchThisAreaClick?: () => void;
}

// Controller component to update map view dynamically with DOM container safety checks
function MapViewController({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const lat = Number(center?.lat);
    const lng = Number(center?.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    try {
      const container = map.getContainer();
      if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
        map.setView([lat, lng], zoom, { animate: false });
      }
    } catch (err) {
      // Suppress transient Leaflet pane positioning errors during unmount/tab changes
    }
  }, [center?.lat, center?.lng, zoom, map]);
  return null;
}

// Controller component to detect map movement with safety guards
function MapEventsHandler({ onBoundsChange }: { onBoundsChange?: (center: { lat: number; lng: number }) => void }) {
  useMapEvents({
    moveend: (e) => {
      try {
        const c = e.target.getCenter();
        if (c && typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng)) {
          onBoundsChange?.({ lat: c.lat, lng: c.lng });
        }
      } catch (err) {
        // Safe catch for Leaflet unmounting events
      }
    },
  });
  return null;
}

export default function JobMap({
  jobs,
  selectedJobId,
  onSelectJob,
  center = { lat: 12.9716, lng: 77.5946 }, // Default Bangalore
  zoom = 12,
  onBoundsChange,
  searchThisAreaVisible,
  onSearchThisAreaClick,
}: JobMapProps) {

  // Create custom marker icons with company logo or pin
  const createCustomIcon = (job: JobMock, isSelected: boolean) => {
    const logoUrl = job.company?.logoUrl;
    const hasLogo = logoUrl && logoUrl.length > 5;
    const initials = getCompanyInitials(job.company?.name);
    const color = getCompanyColor(job.company?.name);

    const html = `
      <div class="relative group cursor-pointer transform transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-10'}">
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border-2 ${isSelected ? 'border-coral-500 shadow-pin ring-4 ring-coral-500/20' : 'border-brand-600'} text-white shadow-lg">
          <div class="h-6 w-6 rounded-full overflow-hidden bg-brand-700 flex items-center justify-center flex-shrink-0 border border-slate-700">
            ${
              hasLogo
                ? `<img src="${logoUrl}" alt="${job.company.name}" class="h-full w-full object-cover"/>`
                : `<span class="flex h-full w-full items-center justify-center text-[10px] font-extrabold text-white" style="background:${color}">${initials}</span>`
            }
          </div>
          <span class="text-xs font-semibold whitespace-nowrap tracking-tight text-white max-w-[120px] truncate">
            ${job.company.name}
          </span>
        </div>
        <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${isSelected ? 'border-t-coral-500' : 'border-t-brand-600'} mx-auto -mt-0.5"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-map-pin',
      iconSize: [140, 42],
      iconAnchor: [70, 42],
      popupAnchor: [0, -42],
    });
  };

  const validJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    return jobs.filter(
      j => typeof j?.lat === 'number' && typeof j?.lng === 'number' && !isNaN(j.lat) && !isNaN(j.lng)
    );
  }, [jobs]);

  const safeCenterLat = typeof center?.lat === 'number' && !isNaN(center.lat) ? center.lat : 12.9716;
  const safeCenterLng = typeof center?.lng === 'number' && !isNaN(center.lng) ? center.lng : 77.5946;

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800">
      
      {/* Floating "Search This Area" Button */}
      {searchThisAreaVisible && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <button
            onClick={onSearchThisAreaClick}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xl border border-brand-500 hover:bg-brand-700 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-coral-400 animate-spin" style={{ animationDuration: '4s' }} />
            Search this area
          </button>
        </div>
      )}

      {/* Map Tile Layer */}
      <MapContainer
        center={[safeCenterLat, safeCenterLng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%', backgroundColor: '#0f172a' }}
        zoomControl={false}
      >
        <MapViewController center={{ lat: safeCenterLat, lng: safeCenterLng }} zoom={zoom} />
        <MapEventsHandler onBoundsChange={onBoundsChange} />

        {/* CartoDB Dark Matter / Voyager Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Job Pins */}
        {validJobs.map((job) => {
          const isSelected = selectedJobId === job.id;
          return (
            <Marker
              key={job.id}
              position={[job.lat, job.lng]}
              icon={createCustomIcon(job, isSelected)}
              eventHandlers={{
                click: () => onSelectJob?.(job),
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 max-w-[220px]">
                  <div className="flex items-center gap-2 mb-1.5">
                    {job.company.logoUrl ? (
                      <img src={job.company.logoUrl} alt={job.company.name} className="h-6 w-6 rounded object-cover border" />
                    ) : (
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded border text-[10px] font-extrabold text-white"
                        style={{ backgroundColor: getCompanyColor(job.company.name) }}
                      >
                        {getCompanyInitials(job.company.name)}
                      </span>
                    )}
                    <span className="font-semibold text-slate-900 text-xs">{job.company.name}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">{job.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-coral-500 inline" />
                    {job.locationLabel}
                  </p>
                  <button
                    onClick={() => onSelectJob?.(job)}
                    className="mt-2 w-full py-1.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded text-xs font-semibold transition-colors"
                  >
                    View Job & Apply
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
