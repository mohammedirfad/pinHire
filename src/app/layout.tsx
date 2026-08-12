import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/authContext';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Pinhire — Real Map-Based Job Portal | See Where Jobs Actually Are',
    template: '%s | Pinhire Live Map Jobs',
  },
  description:
    'Discover active hiring locations on a live interactive map. Pinhire pinpoints tech, engineering, and design roles directly at exact office coordinates — no forced signups.',
  keywords: [
    'map job portal',
    'jobs near me',
    'interactive job map',
    'hiring locations map',
    'tech jobs bangalore',
    'kochi infopark jobs',
    'software engineering jobs',
    'remote developer jobs',
    'Pinhire jobs',
    'map job search'
  ],
  authors: [{ name: 'Pinhire Inc.' }],
  creator: 'Pinhire',
  publisher: 'Pinhire',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Pinhire — Real Map-Based Job Portal',
    description: 'See where the jobs actually are. Interactive live hiring map for tech & engineering roles.',
    url: 'http://localhost:3000',
    siteName: 'Pinhire',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'Pinhire Map-Based Job Portal Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pinhire — Real Map-Based Job Portal',
    description: 'Find real hiring locations on an interactive live map.',
    creator: '@pinhire',
    images: ['/icon.svg'],
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex min-h-full flex-col bg-slate-50 dark:bg-slate-950`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="bottom-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
