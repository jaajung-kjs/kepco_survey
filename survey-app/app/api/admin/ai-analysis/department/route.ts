import { NextRequest, NextResponse } from 'next/server';
import { generateDepartmentAnalysis } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.department || !data.byType || !data.questions) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    const analysis = await generateDepartmentAnalysis(data);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI analysis' },
      { status: 500 }
    );
  }
}
