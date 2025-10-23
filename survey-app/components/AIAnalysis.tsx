'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface AIAnalysisProps {
  data: any;
  type: 'department' | 'management';
  targetKey?: string; // department name for department analysis
}

export default function AIAnalysis({ data, type, targetKey }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 컴포넌트 마운트 시 저장된 분석 확인
  useEffect(() => {
    checkCachedAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, targetKey]);

  const checkCachedAnalysis = async () => {
    try {
      const params = new URLSearchParams({
        type: type === 'department' ? 'department_detail' : 'management_detail',
      });

      if (targetKey) {
        params.append('target', targetKey);
      }

      const res = await fetch(`/api/admin/ai-analysis?${params.toString()}`);

      if (!res.ok) {
        throw new Error('Failed to check cached analysis');
      }

      const result = await res.json();

      if (result.exists && result.data) {
        setAnalysis(result.data.content.analysis);
        setCachedAt(result.data.updatedAt);
      }
    } catch (err) {
      console.error('Error checking cached analysis:', err);
    } finally {
      setIsInitialLoad(false);
    }
  };

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Generate AI analysis
      const analysisRes = await fetch(`/api/admin/ai-analysis/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!analysisRes.ok) {
        throw new Error('Failed to generate analysis');
      }

      const analysisResult = await analysisRes.json();
      const generatedAnalysis = analysisResult.analysis;

      setAnalysis(generatedAnalysis);

      // 2. Save to database
      const saveRes = await fetch('/api/admin/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisType: type === 'department' ? 'department_detail' : 'management_detail',
          targetKey: targetKey || null,
          content: {
            analysis: generatedAnalysis,
            generatedAt: new Date().toISOString(),
          },
        }),
      });

      if (!saveRes.ok) {
        console.error('Failed to save analysis to database');
      } else {
        const saveResult = await saveRes.json();
        setCachedAt(saveResult.data.updatedAt);
      }
    } catch (err) {
      setError('AI 분석 생성에 실패했습니다. 다시 시도해주세요.');
      console.error('AI Analysis Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isInitialLoad) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">AI 종합 분석</h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
          <p className="text-gray-600 mt-4">저장된 분석을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">AI 종합 분석</h2>
        {analysis && !loading && (
          <button
            onClick={() => generateAnalysis()}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            재생성
          </button>
        )}
      </div>

      {!analysis && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            AI가 데이터를 분석하여 객관적인 인사이트를 제공합니다.
          </p>
          <button
            onClick={() => generateAnalysis()}
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

      {analysis && !loading && (
        <div>
          {cachedAt && (
            <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              마지막 업데이트: {formatDate(cachedAt)}
            </div>
          )}
          <div className="prose max-w-none">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
