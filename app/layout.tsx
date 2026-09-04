import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter 4.1 — variable font with opsz axis, served via next/font (Google Fonts latest)
// Includes 6 Display cuts via opsz, humanist italics, UPM 2048. All text uses Inter.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "German1000 · Open-and-play vocabulary",
  description: "A stateless, whimsical German vocabulary deck with all 1,000 frequency-ranked forms, explanations, examples, and randomized exercises.",
  openGraph: {
    title: "German1000 · Open-and-play vocabulary",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
