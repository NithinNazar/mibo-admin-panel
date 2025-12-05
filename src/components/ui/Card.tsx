import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "md",
  hover = false,
}) => {
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={`
        bg-miboCardBg rounded-xl border border-white/5
        ${hover ? "hover:shadow-card-hover transition-shadow duration-200" : ""}
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
