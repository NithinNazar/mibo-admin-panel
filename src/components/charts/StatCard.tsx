import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Card from "../ui/Card";

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down";
    period: string;
  };
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = "text-miboTeal",
}) => {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs uppercase text-slate-400 font-medium tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>

          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.direction === "up" ? (
                <TrendingUp size={14} className="text-green-400" />
              ) : (
                <TrendingDown size={14} className="text-red-400" />
              )}
              <span
                className={`text-xs font-medium ${
                  trend.direction === "up" ? "text-green-400" : "text-red-400"
                }`}
              >
                {trend.value}%
              </span>
              <span className="text-xs text-slate-500">{trend.period}</span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-lg bg-white/5 ${iconColor}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
