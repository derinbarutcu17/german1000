import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "German 1000 · Open-and-play vocabulary",
  description: "A stateless, whimsical German vocabulary deck with all 1,000 frequency-ranked forms, explanations, examples, and randomized exercises.",
  openGraph: {
    title: "German 1000 · Open-and-play vocabulary",
    description: "Open a fresh shuffle of 1,000 German forms, reveal their context, and keep wandering without an account or saved progress.",
    type: "website",
  },
  themeColor: "#f6f8f8",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
