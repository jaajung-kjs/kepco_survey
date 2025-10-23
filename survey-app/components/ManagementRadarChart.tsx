'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface ManagementRadarChartProps {
  data: {
    evaluationType: string;
    average: number;
  }[];
}

export default function ManagementRadarChart({ data }: ManagementRadarChartProps) {
  const chartData = data.map(item => ({
    subject: item.evaluationType,
    평균점수: parseFloat((item.average || 0).toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={90} domain={[0, 5]} />
        <Radar
          name="평균점수"
          dataKey="평균점수"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.5}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}
