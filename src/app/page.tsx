import { Metadata } from "next";
import HomeClient from "@/components/pages/HomeClient";

export const metadata: Metadata = {
  title: "Home",
  description: "SnAnime - Your ultimate destination for streaming high-quality anime. Discover new series, watch the latest episodes, and immerse yourself in the world of anime.",
};

export default function Home() {
  return <HomeClient />;
}
