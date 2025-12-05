import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const variantStyles = {
    default: "bg-slate-700 text-slate-200",
    success: "bg-green-600/20 text-green-400 border border-green-500/30",
    warning: "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30",
    danger: "bg-red-600/20 text-red-400 border border-red-500/30",
    info: "bg-miboTeal/20 text-miboTeal border border-miboTeal/30",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
