import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Link Shortener",
  description: "Create and manage your short links easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
