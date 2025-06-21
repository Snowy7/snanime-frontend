// components/ui/button.tsx
"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// NavigationButton (assuming it's fine as is, or add className if needed)
export const NavigationButton = ({ direction, onClick, className = "" }: { direction: "left" | "right"; onClick: () => void; className?: string }) => {
  const isLeft = direction === "left";
  const Icon = isLeft ? ChevronLeft : ChevronRight;
  const position = isLeft ? "left-6" : "right-6";

  return (
    <button
      onClick={onClick}
      className={`cursor-pointer absolute ${position} top-1/2 -translate-y-1/2 w-14 h-14 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border-0 border-t-1 border-white/20 z-30 hover:scale-110 hover:shadow-xl hover:border-white/40 group ${className}`}
    >
      <Icon className={`w-7 h-7 text-white transition-transform duration-200 group-hover:scale-110 ${isLeft ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`} />
    </button>
  );
};

// ControlButton (Modified for Navbar variants)
export const ControlButton = ({
  type,
  children,
  className = "",
  variant = "default",
  iconOnly = false, // For navbar icon buttons
  iconColorClass, // For specific icon coloring like premium
  onClick,
}: {
  type: "primary" | "save" | "share" | "premium" | "navbar-action";
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "navbar";
  iconOnly?: boolean;
  iconColorClass?: string;
  onClick?: () => void;
}) => {
  let baseClasses = "cursor-pointer group relative flex items-center transition-all duration-300 font-medium";
  let contentClasses = "relative z-10 flex items-center";
  let hoverGradientDiv = null;

  if (variant === "navbar") {
    let specificGradient = "";
    let specificHoverTextColor = "";
    if (type === "premium") {
      baseClasses += ` gap-3 bg-black/20 backdrop-blur-md text-white px-8 py-3 rounded-lg text-lg border-t border-white/30 hover:bg-black/80 hover:scale-105 hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 ${className}`;
      // Icon color is handled by cloning the icon child below
      specificGradient = "from-yellow-100/20 to-yellow-400/20";
      specificHoverTextColor = "group-hover:text-yellow-400";
    } else if (type === "navbar-action") {
      baseClasses += ` gap-3 bg-black/20 backdrop-blur-md text-white px-4 py-3 rounded-full text-lg border-t border-white/30 hover:bg-black/80 hover:scale-105 hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 ${className}`;
      // Children is the icon itself
      specificGradient = "from-blue-800/20 to-red-800/20";
      specificHoverTextColor = "group-hover:text-blue-300";
    }

    if (specificGradient) {
      hoverGradientDiv = <div className={`absolute inset-0 bg-gradient-to-r ${specificGradient} opacity-5 ${type == "premium" ? "rounded-lg" : "rounded-full"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>;
    }
    contentClasses += ` ${specificHoverTextColor}`;
  } else {
    // Default variant styles
    baseClasses += ` gap-3 bg-black/20 backdrop-blur-md text-white px-8 py-3 rounded-lg text-lg border-t border-white/30 hover:bg-black/80 hover:scale-105 hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 ${className}`;
    contentClasses += " gap-3";
    let specificGradient = "";
    let specificHoverTextColor = "";

    switch (type) {
      case "primary":
        specificGradient = "from-red-600/20 to-orange-600/20";
        specificHoverTextColor = "group-hover:text-red-400";
        break;
      case "save":
        specificGradient = "from-blue-600/20 to-purple-600/20";
        specificHoverTextColor = "group-hover:text-blue-400";
        break;
      case "share":
        specificGradient = "from-green-600/20 to-teal-600/20";
        specificHoverTextColor = "group-hover:text-green-400";
        break;
      case "navbar-action":
        specificGradient = "from-neutral-800/20 to-neutral-800/20";
        specificHoverTextColor = "group-hover:text-neutral-300";
        break;
      default:
        specificGradient = "from-gray-600/20 to-gray-600/20";
        specificHoverTextColor = "group-hover:text-gray-400";
        break;
    }
    if (specificGradient) {
      hoverGradientDiv = <div className={`absolute inset-0 bg-gradient-to-r ${specificGradient} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>;
    }
    contentClasses += ` ${specificHoverTextColor}`;
  }

  return (
    <button className={baseClasses} onClick={onClick} disabled={type === "premium" && !iconOnly}>
      {hoverGradientDiv}
      <div className={contentClasses}>
        {variant === "navbar" && type === "premium" && React.Children.count(children) === 2
          ? React.Children.map(children, (child, index) => {
              if (index === 0 && React.isValidElement(child)) {
                // First child is icon
                const element = child as React.ReactElement<any>;
                return React.cloneElement(element, {
                  className: `${element.props.className || ""} ${iconColorClass || "text-yellow-400"}`, // Apply icon color
                });
              }
              // Second child is text span
              if (index === 1 && React.isValidElement(child)) {
                const element = child as React.ReactElement<any>;
                return React.cloneElement(element, {
                  className: `${element.props.className || ""} ${iconColorClass ? "text-white" : "text-yellow-400/90"}`,
                });
              }
              return child;
            })
          : children}
      </div>
    </button>
  );
};

// IconButton (Original - kept for other uses if needed, or can be removed if ControlButton covers all)
export const IconButton = ({ type, icon, className = "" }: { type: "save" | "share"; icon: React.ReactNode; className?: string }) => {
  const getButtonStyles = () => {
    switch (type) {
      case "save":
        return {
          gradient: "from-blue-600/20 to-purple-600/20",
          hoverColor: "group-hover:text-blue-400",
        };
      case "share":
        return {
          gradient: "from-green-600/20 to-teal-600/20",
          hoverColor: "group-hover:text-green-400",
        };
      default:
        return {
          gradient: "from-gray-600/20 to-gray-600/20",
          hoverColor: "group-hover:text-gray-400",
        };
    }
  };
  const { gradient, hoverColor } = getButtonStyles();
  return (
    <button
      className={`cursor-pointer group relative flex items-center gap-2 bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 border-t border-white/30 hover:bg-black/30 hover:scale-105 hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className={`transition-all duration-200 group-hover:scale-110 group-hover:rotate-12 relative z-10 ${hoverColor}`}>{icon}</div>
    </button>
  );
};
