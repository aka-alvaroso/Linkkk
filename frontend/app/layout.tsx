import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import { ToastProvider } from "./contexts/ToastContext";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="view-transition" content="same-origin" />
      </head>
      <body>
        <ToastProvider>
          <SessionProvider>{children}</SessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
