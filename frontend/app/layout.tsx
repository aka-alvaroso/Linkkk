import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import { ToastProvider } from "./contexts/ToastContext";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import { locales, defaultLocale, type Locale } from '@/i18n/request';

export const metadata: Metadata = {
  title: "Linkkk",
  description: "Create and manage your short links easily",
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
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
