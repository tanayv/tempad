import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FPL Tempad - Fantasy Premier League Timeline Analysis",
  description: "Analyze your Fantasy Premier League team performance with alternate timeline visualization. View transfer effectiveness and discover what-if scenarios for your FPL team.",
  keywords: "Fantasy Premier League, FPL, analytics, timeline, transfers, football",
  authors: [{ name: "FPL Tempad" }],
  robots: "index, follow",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="dark" storageKey="fpl-tempad-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
