import React from "react";
import BaseCard from "@/components/ui/BaseCard";

interface CharacterCardProps {
  character: Character;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  return (
    <BaseCard
      href={`/character/${character.id}`}
      imageUrl={character.imageUrl}
      title={character.name}
      subtitle={character.role}
      hoverEffect="zoom"
      size="sm"
    />
  );
};

export default CharacterCard;
