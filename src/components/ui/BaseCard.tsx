import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, Play, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BaseCardProps {
  href: string;
  imageUrl: string | null;
  title: string;
  subtitle?: string;
  badges?: {
    text: string;
    color?: string;
  }[];
  rating?: number;
  year?: number;
  status?: string;
  extraInfo?: {
    label: string;
    value: string | number;
  }[];
  description?: string;
  tags?: string[];
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
  size?: "sm" | "md" | "lg";
  viewMode?: "grid" | "list";
  hoverEffect?: "scale" | "rotate" | "zoom" | "none";
}

const BaseCard: React.FC<BaseCardProps> = ({
  href,
  imageUrl,
  title,
  subtitle,
  badges = [],
  rating,
  year,
  status,
  extraInfo = [],
  description,
  tags = [],
  className = "",
  imageClassName = "",
  contentClassName = "",
  size = "md",
  viewMode = "grid",
  hoverEffect = "scale"
}) => {
  const sizeClasses = {
    sm: "h-48",
    md: "h-64",
    lg: "h-80"
  };

  const hoverEffectClasses = {
    scale: "group-hover:scale-105",
    rotate: "group-hover:rotate-2",
    zoom: "group-hover:scale-125",
    none: ""
  };

  if (viewMode === "list") {
    return (
      <Link href={href} className={cn(
        "group flex gap-4 p-4 bg-black/30 backdrop-blur-sm rounded-xl",
        "border-neutral-800 hover:border-neutral-600",
        "hover:bg-black/40 transition-all duration-300",
        className
      )}>
        <div className={cn(
          "relative w-32 overflow-hidden rounded-lg",
          sizeClasses[size],
          imageClassName
        )}>
          <Image
            src={imageUrl || "/images/default-anime.png"}
            alt={title}
            fill
            className={cn(
              "object-cover transition-transform duration-300",
              hoverEffectClasses[hoverEffect]
            )}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className={cn("flex-1 min-w-0", contentClassName)}>
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {badges.map((badge, index) => (
              <span
                key={index}
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  badge.color || "bg-blue-600/20 text-blue-300"
                )}
              >
                {badge.text}
              </span>
            ))}
          </div>

          {(rating || year || status) && (
            <div className="flex items-center gap-4 mt-3 text-sm">
              {rating && (
                <span className="flex items-center text-yellow-400">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  {rating}
                </span>
              )}
              {year && (
                <span className="flex items-center text-neutral-400">
                  <Calendar className="w-4 h-4 mr-1" />
                  {year}
                </span>
              )}
              {status && (
                <span className="text-neutral-500">{status}</span>
              )}
            </div>
          )}

          {description && (
            <p className="text-sm text-neutral-400 line-clamp-2 mt-3">
              {description}
            </p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-neutral-800/50 text-neutral-300 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-0.5 bg-neutral-800/50 text-neutral-400 rounded text-xs">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {extraInfo.length > 0 && (
            <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
              {extraInfo.map((info, index) => (
                <span key={index}>
                  {info.label}: {info.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-xl",
        "bg-black/20 backdrop-blur-sm border-neutral-800",
        "hover:border-neutral-600 transition-all duration-300",
        className
      )}
    >
      <div className={cn(
        "relative w-full aspect-[2/3] overflow-hidden",
        imageClassName
      )}>
        <Image
          src={imageUrl || "/images/default-anime.png"}
          alt={title}
          fill
          className={cn(
            "object-cover transition-transform duration-500",
            hoverEffectClasses[hoverEffect]
          )}
        />
        
        {/* Overlay with hover effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play/Info button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-white/30">
            <Info className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex flex-wrap justify-between gap-2">
          {badges.map((badge, index) => (
            <span
              key={index}
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
                badge.color || "bg-blue-600/80 text-white"
              )}
            >
              {badge.text}
            </span>
          ))}
          {rating && (
            <span className="flex items-center space-x-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-white font-medium">{rating}</span>
            </span>
          )}
        </div>
      </div>

      <div className={cn("p-4", contentClassName)}>
        <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-neutral-400 mt-1 line-clamp-1">{subtitle}</p>
        )}

        {(year || status) && (
          <div className="flex items-center justify-between text-xs text-neutral-400 mt-2">
            {year && <span>{year}</span>}
            {status && <span>{status}</span>}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 bg-neutral-800/50 text-neutral-400 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {extraInfo.length > 0 && (
          <div className="flex items-center justify-between text-xs text-neutral-500 mt-2">
            {extraInfo.slice(0, 2).map((info, index) => (
              <span key={index}>
                {info.value}
              </span>
            ))}
          </div>
        )}

        {/* Hover popup with additional information */}
        <div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-full p-4 bg-black/90 backdrop-blur-sm">
            {description && (
              <p className="text-sm text-neutral-300 line-clamp-3 mb-2">
                {description}
              </p>
            )}
            {extraInfo.length > 2 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400">
                {extraInfo.slice(2).map((info, index) => (
                  <span key={index}>
                    {info.label}: {info.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BaseCard; 