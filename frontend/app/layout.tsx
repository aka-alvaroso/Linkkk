import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import { ToastProvider } from "./contexts/ToastContext";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import { locales, defaultLocale, type Locale } from '@/i18n/request';

export const metadata: Metadata = {
  title: "Linkkk - Smart Link Management Platform",
  description: "Create short links, track analytics, and manage your URLs with custom rules. Free and open-source link management platform.",
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
  openGraph: {
    title: "Linkkk - Smart Link Management Platform",
    description: "Create short links, track analytics, and manage your URLs with custom rules. Free and open-source link management platform.",
    url: "https://linkkk.dev",
    siteName: "Linkkk",
    images: [
      {
        url: "https://linkkk.dev/og-image.png",
        width: 1200,
        height: 630,
        alt: "Linkkk - Smart Link Management Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Linkkk - Smart Link Management Platform",
    description: "Create short links, track analytics, and manage your URLs with custom rules. Free and open-source link management platform.",
    images: ["https://linkkk.dev/og-image.png"],
  },
  metadataBase: new URL("https://linkkk.dev"),
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale from cookie or default to Spanish
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const locale: Locale = (localeCookie && locales.includes(localeCookie as Locale))
    ? localeCookie as Locale
    : defaultLocale;

  // Load messages for the current locale
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <head>
        <meta name="view-transition" content="same-origin" />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider>
            <SessionProvider>{children}</SessionProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
