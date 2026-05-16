import type { Metadata, Viewport } from "next";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import { ToastProvider } from "./contexts/ToastContext";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import { locales, defaultLocale, type Locale } from '@/i18n/request';
import FeedbackBanner from "./components/FeedbackBanner/FeedbackBanner";

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
  alternates: {
    canonical: 'https://linkkk.dev',
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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://linkkk.dev/#organization",
        name: "Linkkk",
        url: "https://linkkk.dev",
        logo: "https://linkkk.dev/linkkk-logo-noBg.svg",
        sameAs: ["https://github.com/aka-alvaroso/Linkkk"],
      },
      {
        "@type": "WebSite",
        "@id": "https://linkkk.dev/#website",
        url: "https://linkkk.dev",
        name: "Linkkk - Smart Link Management Platform",
        description: "Create short links, track analytics, and manage your URLs with custom rules. Free and open-source link management platform.",
        publisher: { "@id": "https://linkkk.dev/#organization" },
        dateModified: new Date().toISOString().split("T")[0],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How is this different from Bitly?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Bitly shortens URLs. Linkkk gives them behavior. You can define conditions (country, device, VPN, bots, schedule) and actions (redirect, block, password, webhook). A link that does different things depending on who clicks.",
            },
          },
          {
            "@type": "Question",
            name: "Do I need to know how to code?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. The rules engine is visual: select conditions, choose actions, save. If you can fill out a form, you can use Linkkk.",
            },
          },
          {
            "@type": "Question",
            name: "How fast are the redirects?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Under 50 milliseconds. Your visitors won't notice any delay. Slow redirects kill conversions — ours don't.",
            },
          },
          {
            "@type": "Question",
            name: "What happens if I exceed my plan limits?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "You can't create more links, but existing ones keep working. We never break active links. You can upgrade whenever you want.",
            },
          },
          {
            "@type": "Question",
            name: "What if Linkkk shuts down?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The code is on GitHub. You can self-host it. And your destination URLs will always work independently — only redirects depend on us, and we've designed them so you can migrate if needed.",
            },
          },
          {
            "@type": "Question",
            name: "Is my data safe?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Passwords hashed with bcrypt. Data encrypted. IPs anonymized for GDPR compliance. We don't sell data to anyone. Period.",
            },
          },
          {
            "@type": "Question",
            name: "Can I try everything before paying?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. The free plan includes rules, analytics and QR codes. PRO just removes limits. You can even try as a guest without giving your email.",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang={locale}>
      <head>
        <meta name="view-transition" content="same-origin" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider>
            <SessionProvider>{children}</SessionProvider>
            <FeedbackBanner />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
