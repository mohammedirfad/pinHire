import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/authContext';
import { StructuredData } from '@/components/StructuredData';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Pinhire - Map-Based Job Search in India | Jobs Near You',
    template: '%s | Pinhire',
  },
  description:
    'Pinhire helps candidates find software, IT, startup, Infopark, MNC, remote, and fresher jobs on a live map across India. Search jobs by role, skill, company, and location.',
  keywords: [
    'Pinhire',
    'Pinhire jobs',
    'Pinhire online',
    'job search India',
    'jobs in India',
    'map job portal',
    'jobs near me',
    'interactive job map',
    'hiring locations map',
    'IT jobs India',
    'startup jobs India',
    'MNC jobs India',
    'freshers jobs India',
    'tech jobs Bangalore',
    'software jobs Bangalore',
    'Hyderabad IT jobs',
    'Pune software jobs',
    'Chennai IT jobs',
    'Kochi Infopark jobs',
    'software engineering jobs',
    'remote developer jobs',
  ],
  authors: [{ name: 'Pinhire' }],
  creator: 'Pinhire',
  publisher: 'Pinhire',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pinhire.online'),
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
    title: 'Pinhire - Map-Based Job Search in India',
    description:
      'Find jobs near you on a live hiring map. Search India software, IT, startup, MNC, fresher, and remote jobs by role, skill, company, and city.',
    url: '/',
    siteName: 'Pinhire',
    countryName: 'India',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'Pinhire map-based job search logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pinhire - Map-Based Job Search in India',
    description: 'Find software, IT, startup, MNC, fresher, and remote jobs near you on a live map.',
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
          <StructuredData />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="bottom-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
