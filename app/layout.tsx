import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "LiftLog",
  description:
    "A fast workout tracker built with Next.js and Supabase for logging lifts, progress, and smart training recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
