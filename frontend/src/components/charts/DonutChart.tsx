import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  height = 200,
  centerLabel = 'Total',
  centerValue,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const displayVal = centerValue !== undefined ? centerValue : total;

  return (
    <div className="relative flex items-center justify-center" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="85%"
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'rgba(21, 27, 44, 0.9)',
              border: '1px solid rgba(229, 231, 235, 0.1)',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#FFFFFF',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Middle center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center pointer-events-none">
        <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
          {displayVal}
        </span>
        <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase mt-1 tracking-wider">
          {centerLabel}
        </span>
      </div>
    </div>
  );
};
