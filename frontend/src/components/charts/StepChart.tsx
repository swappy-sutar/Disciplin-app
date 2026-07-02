import React from 'react';
import {
  LineChart,
  Line,
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
  color = '#3B82F6',
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#F3F4F6"
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
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}
            formatter={(value: any) => [`${value}%`, 'Consistency']}
          />
          <Line
            type="stepAfter"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 1, fill: '#FFFFFF' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
