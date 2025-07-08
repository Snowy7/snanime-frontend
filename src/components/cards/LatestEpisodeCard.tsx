import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

type LatestEpisodeCardProps = {
  episode: SnAnimeRecentlyUpdated;
};

const LatestEpisodeCard: React.FC<LatestEpisodeCardProps> = ({ episode }) => {
  const { t } = useLanguage();

  return (
    <Link href={`/anime/${episode.id}`} className="group block overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ">
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        {" "}
        {/* Aspect ratio for typical poster */}
        <Image src={episode.image} alt={episode.title} fill style={{ objectFit: "cover" }} className="transition-transform duration-300 group-hover:scale-115 group-hover:-rotate-6" />
        {/* overlay on hover showing extra info */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3">
          <div className="flex flex-wrap gap-2">
            {/* badge like dev for each item */}
            {episode.sub && episode.sub > 0 ? <span className={`bg-green-500/20 border border-green-700 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full`}>Sub {episode.sub}</span> : null}
            {episode.dub && episode.dub > 0 ? <span className={`bg-green-500/20 border border-green-700 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full`}>Dub {episode.dub}</span> : null}
            {episode.duration && <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-blue-500/20 border border-blue-500 backdrop-blur-sm text-white">{episode.duration}</span>}
            {episode.type && <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-purple-500/20 border border-purple-700 backdrop-blur-sm text-white">{t(episode.type)}</span>}
          </div>
        </div>
      </div>
      <div className="p-3 md:p-4">
        <h3 className="text-sm md:text-base font-semibold text-white truncate group-hover:text-green-400 transition-colors">{episode.title}</h3>
        <p className="text-xs md:text-sm text-neutral-400 mt-1">{t("episode")} {episode.sub}</p>
      </div>
    </Link>
  );
};

const getColorFromRating = (rating: string): string => {
  switch (rating) {
    case "R":
      return "bg-red-500/20 border border-red-700 backdrop-blur-sm";
    case "PG":
      return "bg-yellow-500/20 border border-yellow-700 backdrop-blur-sm";
    case "PG-13":
      return "bg-orange-500/20 border border-orange-700 backdrop-blur-sm";
    case "G":
      return "bg-green-500/20 border border-green-700 backdrop-blur-sm";
    default:
      return "bg-gray-500/20 border border-gray-700 backdrop-blur-sm";
  }
};

export default LatestEpisodeCard;
