'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface DepartmentRadarChartSmallProps {
  data: Array<{
    evaluation_type: string;
    final_avg: number;
  }>;
  department: string;
}

export default function DepartmentRadarChartSmall({ data, department }: DepartmentRadarChartSmallProps) {
  const chartData = data.map(item => ({
    subject: item.evaluation_type,
    score: item.final_avg,
  }));

  return (
    <div className="w-full h-full">
      <h3 className="text-center font-semibold text-gray-800 mb-2">{department}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Radar
            name="최종점수"
            dataKey="score"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
