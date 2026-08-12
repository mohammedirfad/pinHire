'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { JobMock } from '@/lib/mockData';

const JobMap = dynamic(() => import('@/components/JobMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-400 rounded-2xl animate-pulse">
      <div className="flex flex-col items-center gap-2">
        <MapPin className="h-8 w-8 text-coral-500 animate-bounce" />
        <span className="text-xs font-semibold">Loading Live Map Pins...</span>
      </div>
    </div>
  ),
});

interface HomeMapPreviewProps {
  jobs: JobMock[];
}

export function HomeMapPreview({ jobs }: HomeMapPreviewProps) {
  const router = useRouter();

  return (
    <div className="h-[420px] w-full rounded-2xl overflow-hidden">
      <JobMap
        jobs={jobs}
        onSelectJob={(job) => router.push(`/jobs/${job.slug}`)}
      />
    </div>
  );
}
