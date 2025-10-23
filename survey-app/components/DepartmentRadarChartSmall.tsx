'use client';

import Link from 'next/link';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface DepartmentRadarChartSmallProps {
  data: Array<{
    evaluationType: string;
    finalScore: number;
  }>;
  department: string;
}

export default function DepartmentRadarChartSmall({ data, department }: DepartmentRadarChartSmallProps) {
  const chartData = data.map(item => ({
    subject: item.evaluationType,
    score: item.finalScore || 0,
  }));

  return (
    <Link href={`/admin/department/${encodeURIComponent(department)}`} className="block w-full h-full cursor-pointer hover:shadow-lg transition-shadow rounded-lg border border-gray-200 p-4 bg-white">
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
    </Link>
  );
}
