import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providors";
import { Noto_Sans_Arabic } from "next/font/google";
import { getServerLanguage } from "@/lib/server-utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "SnAnime",
    template: "%s | SnAnime",
  },
  description: "Watch your favorite anime in high quality with SnAnime. Stream the latest episodes, discover new series, and enjoy a seamless viewing experience.",
  keywords: ["anime", "stream", "watch anime", "high quality", "latest episodes", "snanime"],
  openGraph: {
    title: "SnAnime",
    description: "Watch your favorite anime in high quality with SnAnime. Stream the latest episodes, discover new series, and enjoy a seamless viewing experience.",
    url: "https://snanime.snowydev.xyz",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = await getServerLanguage();
  const dir = language === "ar" ? "rtl" : "ltr";
  return (
    <html
      lang={language}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${notoArabic.variable}`}
      suppressHydrationWarning
    >
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
