import { Metadata } from "next";
import HomeClient from "@/components/pages/HomeClient";

export const metadata: Metadata = {
  title: "Home",
  description: "SnAnime - Your ultimate destination for streaming high-quality anime. Discover new series, watch the latest episodes, and immerse yourself in the world of anime.",
  metadataBase: new URL("https://snanime.snowydev.xyz"),
  openGraph: {
    title: "SnAnime",
    description: "SnAnime - Your ultimate destination for streaming high-quality anime. Discover new series, watch the latest episodes, and immerse yourself in the world of anime.",
    images: ["/og-image.png"],
  },
  twitter: {
    title: "SnAnime",
    description: "SnAnime - Your ultimate destination for streaming high-quality anime. Discover new series, watch the latest episodes, and immerse yourself in the world of anime.",
    images: ["/og-image.png"],
  },
};

export default function Home() {
  return <HomeClient />;
}
