import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import Card from "../ui/Card";

export interface DonutChartData {
  label: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export interface DonutChartProps {
  data: DonutChartData[];
  title: string;
  centerLabel?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  centerLabel,
}) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            nameKey="label"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e2836",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-slate-300 text-sm">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="text-center -mt-48 pointer-events-none">
          <p className="text-2xl font-bold text-white">{centerLabel}</p>
        </div>
      )}
    </Card>
  );
};

export default DonutChart;
