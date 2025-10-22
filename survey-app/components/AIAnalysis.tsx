'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface AIAnalysisProps {
  data: any;
  type: 'department' | 'management';
}

export default function AIAnalysis({ data, type }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/ai-analysis/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to generate analysis');
      }

      const result = await res.json();
      setAnalysis(result.analysis);
    } catch (err) {
      setError('AI 분석 생성에 실패했습니다. 다시 시도해주세요.');
      console.error('AI Analysis Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">AI 종합 분석</h2>

      {!analysis && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            AI가 데이터를 분석하여 객관적인 인사이트를 제공합니다.
          </p>
          <button
            onClick={generateAnalysis}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            AI 분석 생성하기
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">AI가 데이터를 분석하고 있습니다...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {analysis && (
        <div className="prose max-w-none">
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
