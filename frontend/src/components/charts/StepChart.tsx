import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface StepChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

export const StepChart: React.FC<StepChartProps> = ({
  data,
  height = 200,
  color = '#10B981', // default success green accent
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorConsistency" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="rgba(229, 231, 235, 0.05)"
          />
          <XAxis 
            dataKey="label" 
            stroke="#9CA3AF" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis 
            stroke="#9CA3AF" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(21, 27, 44, 0.9)',
              border: '1px solid rgba(229, 231, 235, 0.1)',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#FFFFFF',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
            }}
            formatter={(value: any) => [`${value}%`, 'Consistency']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorConsistency)"
            dot={{ r: 4, strokeWidth: 1.5, fill: '#FFFFFF', stroke: color }}
            activeDot={{ r: 6, strokeWidth: 2, fill: color, stroke: '#FFFFFF' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
