import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import { AnimeProvider } from "@/context/AnimeContext";
import Providers from "@/components/Providors";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SnAnime",
    template: "%s | SnAnime",
  },
  description: "Watch your favorite anime in high quality with SnAnime. Stream the latest episodes, discover new series, and enjoy a seamless viewing experience.",
  keywords: ["anime", "stream", "watch anime", "high quality", "latest episodes", "snanime"],
  openGraph: {
    title: "SnAnime",
    description: "Watch your favorite anime in high quality with SnAnime. Stream the latest episodes, discover new series, and enjoy a seamless viewing experience.",
    url: "https://snanime.com",
    siteName: "SnAnime",
    images: [
      {
        url: "/og-image.png", // Make sure to add an og-image.png to your public folder
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnAnime",
    description: "Watch your favorite anime in high quality with SnAnime. Stream the latest episodes, discover new series, and enjoy a seamless viewing experience.",
    images: ["/og-image.png"], // Make sure to add an og-image.png to your public folder
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
