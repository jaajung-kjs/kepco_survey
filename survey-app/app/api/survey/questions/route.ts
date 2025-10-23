import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    let query = supabase.from('survey_questions').select('*');

    switch (type) {
      case 'own-dept':
        query = query.eq('evaluation_target', '본인 소속 조직');
        break;
      case 'other-dept':
        query = query.eq('evaluation_target', '타 부서/지사').eq('for_executives_only', true);
        break;
      case 'management':
        query = query.eq('evaluation_target', '관리처 전반');
        break;
      case 'opinion':
        query = query.eq('evaluation_target', '종합 의견');
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid question type' },
          { status: 400 }
        );
    }

    const { data: questions, error } = await query.order('question_number');

    if (error) throw error;

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching survey questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey questions' },
      { status: 500 }
    );
  }
}
