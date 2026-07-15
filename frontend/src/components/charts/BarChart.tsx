import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  color?: string; // fallback color
  showYAxis?: boolean;
  showXAxis?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  color = '#3B82F6',
  showYAxis = true,
  showXAxis = true,
}) => {
  const gradientId = `barGradient-${color.replace('#', '')}`;

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={showYAxis ? { top: 10, right: 10, left: -20, bottom: 0 } : { top: 5, right: 5, left: 5, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.15} />
            </linearGradient>
          </defs>
          {showXAxis && (
            <XAxis 
              dataKey="label" 
              stroke="#9CA3AF" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={4}
            />
          )}
          {showYAxis && (
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
          )}
          <Tooltip
            cursor={{ fill: 'rgba(243, 244, 246, 0.05)', radius: 4 }}
            contentStyle={{
              background: 'rgba(21, 27, 44, 0.9)',
              border: '1px solid rgba(229, 231, 235, 0.1)',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#FFFFFF',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
            }}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={8} fill={`url(#${gradientId})`}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || color} 
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
