import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Sparta – Sports Performance & Athlete Analytics Platform",
    template: "%s | Sparta",
  },

  description:
    "Sparta is a modern sports performance analytics platform for athletes and coaches. Track strength, speed, jump metrics, training load, and improve performance using science-based testing tools.",

  keywords: [
    "Sparta",
    "Sparta sports",
    "sports performance analytics",
    "athlete testing",
    "sports science platform",
    "athlete monitoring",
    "strength and conditioning",
    "fitness performance tracking",
    "jump test analytics",
    "athlete dashboard",
    "sports technology",
    "CMJ analysis",
    "speed test metrics",
    "Sparta athletic performance platform",
    "Sparta fitness platform",
    "Sparta training analytics",
    "athlete performance test",
    "athlete strength tracking",
    "athletic performance measurement",
    "fitness test analytics",
    "countermovement jump test analysis",
    "sprint test tracking",
    "vertical jump analytics",
    "strength and conditioning tools",
    "athlete wellness monitoring",
    "best sports performance analytics platform",
    "tools to measure athlete strength",
    "how to track athlete progress online",
    "athlete dashboard for coaches",
    "best athlete testing website",
    "online sports training analytics",
    "how to evaluate athlete performance scientifically",
    "sports performance tool for coaches",
    "sports metrics tracking website",
    "athlete test calculator online",
    "sports science app for athletes",
    "sports analytics for youth athletes",
    "affordable performance testing too",
    "Sparta sports app",
    "Sparta athlete testing",
    "Sparta platform features",
    "Sparta performance tests",
    "Sparta fitness analytics",
    "Sparta sports technology",
  ],

  authors: [{ name: "Sparta Team" }],
  creator: "Sparta",
  publisher: "Sparta",

  metadataBase: new URL("https://sportsv2-two.vercel.app"), // change to your real domain

  openGraph: {
    title: "Sparta – Sports Performance & Athlete Analytics",
    description:
      "Analyze athletic performance, track strength and conditioning metrics, and improve training results with Sparta's advanced sports analytics tools.",
    url: "https://sportsv2-two.vercel.app",
    siteName: "Sparta",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://sportsv2-two.vercel.app/sparta.png",
        width: 1200,
        height: 630,
        alt: "Sparta – Sports Performance Analytics",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Sparta – Sports Performance & Athlete Analytics",
    description:
      "Sports performance analytics platform for athletes, coaches, and trainers. Track jumps, speed, strength, load, and performance metrics easily.",
    images: ["https://sportsv2-two.vercel.app/sparta.png"],
    creator: "@sparta",
  },

  alternates: {
    canonical: "https://sportsv2-two.vercel.app/sparta.png",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  verification: {
    google: "u8z5QIKb2U2ME0HuY9R6oVs8uTuIYk-8brYY3FNpQAU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ReactQueryProvider>
            {children}
            <Analytics />
          </ReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
