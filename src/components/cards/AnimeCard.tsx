import React from "react";
import Image from "next/image";
import Link from "next/link"; // Optional: if you want cards to link somewhere

interface AnimeCardProps {
  show: SnAnimeData | SnAnimeRelated | SnAnimeRecommendations;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ show }) => {
  return (
    <Link href={`/anime/${show.id}`} className="group block overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ">
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        {" "}
        {/* Aspect ratio for typical poster */}
        <Image src={show.image} alt={show.title} fill style={{ objectFit: "cover" }} className="transition-transform duration-300 group-hover:scale-115 group-hover:-rotate-6" />
      </div>
      <div className="p-3 md:p-4">
        <h3 className="text-sm md:text-base font-semibold text-white truncate group-hover:text-green-400 transition-colors">{show.title}</h3>
        <p className="text-xs md:text-sm text-neutral-400 mt-1">{show.type}</p>
      </div>
    </Link>
  );
};

export default AnimeCard;
