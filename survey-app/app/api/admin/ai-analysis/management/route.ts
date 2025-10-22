import { NextRequest, NextResponse } from 'next/server';
import { generateManagementAnalysis } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.byType || !data.questions) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    const analysis = await generateManagementAnalysis(data);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI analysis' },
      { status: 500 }
    );
  }
}
