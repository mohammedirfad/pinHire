'use client';

import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';

export function HeroSearch() {
  const router = useRouter();

  const handleSearch = ({ keyword, location }: { keyword: string; location: string }) => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    router.push(`/jobs?${params.toString()}`);
  };

  const handleLocateUser = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          router.push(`/jobs?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
        },
        () => {}
      );
    }
  };

  return (
    <SearchBar
      onSearch={handleSearch}
      onLocateUser={handleLocateUser}
    />
  );
}
