'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface ManagementRadarChartProps {
  data: {
    evaluation_type: string;
    avg_score: number;
  }[];
}

export default function ManagementRadarChart({ data }: ManagementRadarChartProps) {
  const chartData = data.map(item => ({
    subject: item.evaluation_type,
    평균점수: parseFloat(item.avg_score.toFixed(2)),
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
