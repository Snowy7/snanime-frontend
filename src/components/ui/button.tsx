// components/ui/button.tsx
"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variantStyles = {
    default: "bg-neutral-900 hover:bg-neutral-800 text-white",
    outline: "border border-neutral-800 hover:bg-neutral-900/50 text-neutral-200",
    ghost: "hover:bg-neutral-900/50 text-neutral-200",
  };

  const sizeStyles = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-6 py-3",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// NavigationButton - Modern Acrylic Design
export const NavigationButton = ({ direction, onClick, className = "" }: { direction: "left" | "right"; onClick: () => void; className?: string }) => {
  const isLeft = direction === "left";
  const Icon = isLeft ? ChevronLeft : ChevronRight;
  const position = isLeft ? "left-6" : "right-6";

  return (
    <button
      onClick={onClick}
      className={`cursor-pointer absolute ${position} top-1/2 -translate-y-1/2 w-16 h-16 group flex items-center justify-center ${className}`}
      style={{
        background: `
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.08) 0%, 
            rgba(255, 255, 255, 0.02) 50%, 
            rgba(0, 0, 0, 0.2) 100%
          )
        `,
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2)
        `,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `
          0 12px 48px rgba(0, 0, 0, 0.6),
          0 0 20px rgba(255, 255, 255, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.15),
          inset 0 -1px 0 rgba(0, 0, 0, 0.3)
        `;
        e.currentTarget.style.background = `
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.12) 0%, 
            rgba(255, 255, 255, 0.04) 50%, 
            rgba(0, 0, 0, 0.1) 100%
          )
        `;
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `
          0 8px 32px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2)
        `;
        e.currentTarget.style.background = `
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.08) 0%, 
            rgba(255, 255, 255, 0.02) 50%, 
            rgba(0, 0, 0, 0.2) 100%
          )
        `;
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
    >
      <Icon 
        className={`w-8 h-8 text-white transition-all duration-300 group-hover:scale-110 ${
          isLeft ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"
        }`}
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
        }}
      />
    </button>
  );
};

// ControlButton - Premium Acrylic Design
export const ControlButton = ({
  type,
  children,
  className = "",
  variant = "default",
  iconOnly = false,
  iconColorClass,
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
  const getTypeStyles = () => {
    const styles = {
      primary: {
        gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(251, 146, 60, 0.08) 100%)",
        hoverGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(251, 146, 60, 0.12) 100%)",
        accentColor: "rgb(239, 68, 68)",
        glowColor: "rgba(239, 68, 68, 0.3)",
      },
      save: {
        gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.08) 100%)",
        hoverGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(147, 51, 234, 0.12) 100%)",
        accentColor: "rgb(59, 130, 246)",
        glowColor: "rgba(59, 130, 246, 0.3)",
      },
      share: {
        gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(20, 184, 166, 0.08) 100%)",
        hoverGradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.18) 0%, rgba(20, 184, 166, 0.12) 100%)",
        accentColor: "rgb(34, 197, 94)",
        glowColor: "rgba(34, 197, 94, 0.3)",
      },
      premium: {
        gradient: "linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)",
        hoverGradient: "linear-gradient(135deg, rgba(251, 191, 36, 0.18) 0%, rgba(245, 158, 11, 0.12) 100%)",
        accentColor: "rgb(251, 191, 36)",
        glowColor: "rgba(251, 191, 36, 0.3)",
      },
      "navbar-action": {
        gradient: "linear-gradient(135deg, rgba(156, 163, 175, 0.12) 0%, rgba(107, 114, 128, 0.08) 100%)",
        hoverGradient: "linear-gradient(135deg, rgba(156, 163, 175, 0.18) 0%, rgba(107, 114, 128, 0.12) 100%)",
        accentColor: "rgb(156, 163, 175)",
        glowColor: "rgba(156, 163, 175, 0.3)",
      },
    };
    return styles[type] || styles.primary;
  };

  const typeStyles = getTypeStyles();
  const isPrimary = type === "primary";

  return (
    <button 
      className={`cursor-pointer group relative overflow-hidden ${className}`}
      onClick={onClick}
      style={{
        padding: isPrimary ? "16px 32px" : "12px 24px",
        background: `
          ${typeStyles.gradient},
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 255, 255, 0.01) 50%, 
            rgba(0, 0, 0, 0.15) 100%
          )
        `,
        backdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid rgba(255, 255, 255, 0.1)`,
        borderRadius: isPrimary ? '16px' : '12px',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.4),
          0 2px 8px ${typeStyles.glowColor},
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2)
        `,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: isPrimary ? '16px' : '14px',
        fontWeight: '600',
        color: 'white',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        e.currentTarget.style.background = `
          ${typeStyles.hoverGradient},
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.08) 0%, 
            rgba(255, 255, 255, 0.02) 50%, 
            rgba(0, 0, 0, 0.1) 100%
          )
        `;
        e.currentTarget.style.boxShadow = `
          0 12px 48px rgba(0, 0, 0, 0.5),
          0 4px 16px ${typeStyles.glowColor},
          0 0 20px ${typeStyles.glowColor},
          inset 0 1px 0 rgba(255, 255, 255, 0.15),
          inset 0 -1px 0 rgba(0, 0, 0, 0.25)
        `;
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.background = `
          ${typeStyles.gradient},
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 255, 255, 0.01) 50%, 
            rgba(0, 0, 0, 0.15) 100%
          )
        `;
        e.currentTarget.style.boxShadow = `
          0 8px 32px rgba(0, 0, 0, 0.4),
          0 2px 8px ${typeStyles.glowColor},
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2)
        `;
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
      }}
    >
      {/* Animated shine effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `linear-gradient(45deg, 
            transparent 30%, 
            rgba(255, 255, 255, 0.1) 50%, 
            transparent 70%
          )`,
          transform: 'translateX(-100%)',
          animation: 'shine 2s infinite',
          borderRadius: 'inherit',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-3 transition-all duration-300 group-hover:scale-105">
        {children}
      </div>
      
      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </button>
  );
};

// IconButton - Modern Acrylic Icon-Only Design
export const IconButton = ({ type, icon, className = "" }: { type: "save" | "share"; icon: React.ReactNode; className?: string }) => {
  const getTypeStyles = () => {
    const styles = {
      save: {
        gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.08) 100%)",
        hoverGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(147, 51, 234, 0.12) 100%)",
        glowColor: "rgba(59, 130, 246, 0.3)",
      },
      share: {
        gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(20, 184, 166, 0.08) 100%)",
        hoverGradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.18) 0%, rgba(20, 184, 166, 0.12) 100%)",
        glowColor: "rgba(34, 197, 94, 0.3)",
      },
    };
    return styles[type];
  };

  const typeStyles = getTypeStyles();

  return (
    <button
      className={`cursor-pointer group relative overflow-hidden ${className}`}
      style={{
        width: '56px',
        height: '56px',
        background: `
          ${typeStyles.gradient},
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 255, 255, 0.01) 50%, 
            rgba(0, 0, 0, 0.15) 100%
          )
        `,
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.4),
          0 2px 8px ${typeStyles.glowColor},
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2)
        `,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05) rotateZ(5deg)';
        e.currentTarget.style.background = `
          ${typeStyles.hoverGradient},
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.08) 0%, 
            rgba(255, 255, 255, 0.02) 50%, 
            rgba(0, 0, 0, 0.1) 100%
          )
        `;
        e.currentTarget.style.boxShadow = `
          0 12px 48px rgba(0, 0, 0, 0.5),
          0 4px 16px ${typeStyles.glowColor},
          0 0 20px ${typeStyles.glowColor},
          inset 0 1px 0 rgba(255, 255, 255, 0.15),
          inset 0 -1px 0 rgba(0, 0, 0, 0.25)
        `;
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1) rotateZ(0deg)';
        e.currentTarget.style.background = `
          ${typeStyles.gradient},
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 255, 255, 0.01) 50%, 
            rgba(0, 0, 0, 0.15) 100%
          )
        `;
        e.currentTarget.style.boxShadow = `
          0 8px 32px rgba(0, 0, 0, 0.4),
          0 2px 8px ${typeStyles.glowColor},
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2)
        `;
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(0.95) rotateZ(0deg)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05) rotateZ(5deg)';
      }}
    >
      {/* Animated pulse effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at center, 
            ${typeStyles.glowColor} 0%, 
            transparent 70%
          )`,
          animation: 'pulse 2s infinite',
          borderRadius: 'inherit',
        }}
      />
      
      {/* Icon with enhanced styling */}
      <div 
        className="relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" 
        style={{
          color: 'white',
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
        }}
      >
        {icon}
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
      `}</style>
    </button>
  );
};
