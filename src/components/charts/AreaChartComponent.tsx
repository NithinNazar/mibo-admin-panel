import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "../ui/Card";

export interface AreaChartData {
  date: string;
  value: number;
}

export interface AreaChartComponentProps {
  data: AreaChartData[];
  title: string;
  color?: string;
  gradient?: boolean;
}

const AreaChartComponent: React.FC<AreaChartComponentProps> = ({
  data,
  title,
  color = "#2CA5A9",
  gradient = true,
}) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            {gradient && (
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e2836",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={gradient ? "url(#colorValue)" : color}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default AreaChartComponent;
