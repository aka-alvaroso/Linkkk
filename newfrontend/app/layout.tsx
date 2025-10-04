import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";

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
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
