'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts';

const data = [
  { time: '8 AM', value: 40 },
  { time: '10 AM', value: 65 },
  { time: '12 PM', value: 45 },
  { time: '2 PM', value: 75 },
  { time: '4 PM', value: 50 },
  { time: '6 PM', value: 95 },
  { time: '8 PM', value: 80 },
];

export const AdherenceChart: React.FC = () => {
  return (
    <div className="w-full h-28 my-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16B364" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#16B364" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            formatter={(value: any) => [`${value}%`, 'Waveform Level']}
            labelFormatter={() => ''}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#16B364"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#waveGradient)"
            dot={{ r: 4, fill: '#16B364', strokeWidth: 2, stroke: '#ffffff' }}
            activeDot={{ r: 6, fill: '#006C4E', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
