import React from "react";
import Image from "next/image";
import Link from "next/link";

interface CharacterCardProps {
  character: Character;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  return (
    <Link 
      href={`/character/${character.id}`} 
      className="group block overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <Image 
          src={character.imageUrl} 
          alt={character.name} 
          fill 
          style={{ objectFit: "cover" }} 
          className="transition-transform duration-300 group-hover:scale-115 group-hover:-rotate-6" 
        />
      </div>
      <div className="p-3 md:p-4">
        <h3 className="text-sm md:text-base font-semibold text-white truncate group-hover:text-green-400 transition-colors">
          {character.name}
        </h3>
        <p className="text-xs md:text-sm text-neutral-400 mt-1">
          {character.role}
        </p>
      </div>
    </Link>
  );
};

export default CharacterCard;
