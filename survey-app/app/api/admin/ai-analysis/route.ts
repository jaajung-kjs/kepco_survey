import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: 저장된 AI 분석 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const analysisType = searchParams.get('type');
    const targetKey = searchParams.get('target');

    if (!analysisType) {
      return NextResponse.json(
        { error: 'Analysis type is required' },
        { status: 400 }
      );
    }

    // Query for existing analysis
    let query = supabase
      .from('ai_analyses')
      .select('*')
      .eq('analysis_type', analysisType);

    if (targetKey) {
      query = query.eq('target_key', targetKey);
    } else {
      query = query.is('target_key', null);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching AI analysis:', error);
      return NextResponse.json(
        { error: 'Failed to fetch AI analysis' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { exists: false, data: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      exists: true,
      data: {
        id: data.id,
        analysisType: data.analysis_type,
        targetKey: data.target_key,
        content: data.analysis_content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/ai-analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: AI 분석 결과 저장 (새로 생성 또는 업데이트)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysisType, targetKey, content } = body;

    if (!analysisType || !content) {
      return NextResponse.json(
        { error: 'analysisType and content are required' },
        { status: 400 }
      );
    }

    // Check if analysis exists
    let query = supabase
      .from('ai_analyses')
      .select('id')
      .eq('analysis_type', analysisType);

    if (targetKey) {
      query = query.eq('target_key', targetKey);
    } else {
      query = query.is('target_key', null);
    }

    const { data: existing } = await query.single();

    let data, error;

    if (existing) {
      // Update existing
      const result = await supabase
        .from('ai_analyses')
        .update({
          analysis_content: content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      // Insert new
      const result = await supabase
        .from('ai_analyses')
        .insert({
          analysis_type: analysisType,
          target_key: targetKey || null,
          analysis_content: content,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error saving AI analysis:', error);
      return NextResponse.json(
        { error: 'Failed to save AI analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        analysisType: data.analysis_type,
        targetKey: data.target_key,
        content: data.analysis_content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/admin/ai-analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: AI 분석 결과 삭제 (재생성 전)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const analysisType = searchParams.get('type');
    const targetKey = searchParams.get('target');

    if (!analysisType) {
      return NextResponse.json(
        { error: 'Analysis type is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('ai_analyses')
      .delete()
      .eq('analysis_type', analysisType);

    if (targetKey) {
      query = query.eq('target_key', targetKey);
    } else {
      query = query.is('target_key', null);
    }

    const { error } = await query;

    if (error) {
      console.error('Error deleting AI analysis:', error);
      return NextResponse.json(
        { error: 'Failed to delete AI analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/ai-analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
