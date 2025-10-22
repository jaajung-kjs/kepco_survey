'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface RankingBarChartProps {
  data: {
    department: string;
    score: number;
    rank: number;
  }[];
  title: string;
}

const COLORS = [
  '#ef4444', // 1위 - 빨강
  '#f97316', // 2위 - 주황
  '#f59e0b', // 3위 - 노랑
  '#84cc16', // 4위 - 연두
  '#22c55e', // 5위 - 초록
  '#14b8a6', // 6위 - 청록
  '#06b6d4', // 7위 - 하늘
  '#3b82f6', // 8위 - 파랑
  '#8b5cf6', // 9위 - 보라
  '#a855f7', // 10위 - 자주
];

export default function RankingBarChart({ data, title }: RankingBarChartProps) {
  // 순위별로 정렬
  const sortedData = [...data].sort((a, b) => a.rank - b.rank);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={sortedData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 5]} />
          <YAxis dataKey="department" type="category" width={100} />
          <Tooltip />
          <Legend />
          <Bar dataKey="score" name="평균 점수" fill="#8b5cf6">
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
