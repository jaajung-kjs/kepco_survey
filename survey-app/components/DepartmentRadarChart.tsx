'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface DepartmentRadarChartProps {
  data: {
    evaluation_type: string;
    own_avg: number;
    final_avg: number;
    rank: number;
  }[];
}

export default function DepartmentRadarChart({ data }: DepartmentRadarChartProps) {
  const chartData = data.map(item => ({
    subject: item.evaluation_type,
    본인평가: parseFloat(item.own_avg.toFixed(2)),
    최종점수: parseFloat(item.final_avg.toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={90} domain={[0, 5]} />
        <Radar
          name="본인평가"
          dataKey="본인평가"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.3}
        />
        <Radar
          name="최종점수"
          dataKey="최종점수"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.3}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}
