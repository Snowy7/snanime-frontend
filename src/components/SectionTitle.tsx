import React from "react";
import { Play } from "lucide-react"; // Or your preferred icon library
import { useLanguage } from "@/context/LanguageContext";

interface SectionTitleProps {
  title: string;
  onViewAllClick?: () => void;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, onViewAllClick }) => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between mb-4 md:mb-6">
      <div className="flex items-center">
        <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-white">{title}</h2>
      </div>
      {onViewAllClick && (
        <button onClick={onViewAllClick} className="text-sm md:text-base text-primary hover:text-primary/80 transition-colors font-medium cursor-pointer">
          {t("view_all")}
        </button>
      )}
    </div>
  );
};

export default SectionTitle;
