import type { Metadata } from "next";

import "./globals.css";

const metadataBaseUrl =
  process.env.CAPACITOR_SERVER_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  title: "LiftLog",
  description:
    "A fast workout tracker built with Next.js and Supabase for logging lifts, progress, and smart training recommendations.",
  metadataBase: new URL(metadataBaseUrl),
  icons: {
    apple: "/liftlogo-icon.jpg",
    icon: "/liftlogo-icon.jpg",
    shortcut: "/liftlogo-icon.jpg",
  },
  openGraph: {
    images: ["/liftlogo-full.jpg"],
    title: "LiftLog",
  },
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
