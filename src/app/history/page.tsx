import { Metadata } from "next";
import HistoryPageClient from "@/components/pages/HistoryPageClient";

export const metadata: Metadata = {
  title: "Watch History - SnAnime",
  description: "View your watch history and continue where you left off.",
};

export default function HistoryPage() {
  return <HistoryPageClient />;
}

