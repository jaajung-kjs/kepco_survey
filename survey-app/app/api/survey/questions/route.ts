import { NextRequest, NextResponse } from 'next/server';
import {
  getOwnDeptQuestions,
  getOtherDeptQuestions,
  getManagementQuestions,
  getGeneralOpinionQuestions,
} from '@/lib/surveyQuestions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    let questions;

    switch (type) {
      case 'own-dept':
        questions = await getOwnDeptQuestions();
        break;
      case 'other-dept':
        questions = await getOtherDeptQuestions();
        break;
      case 'management':
        questions = await getManagementQuestions();
        break;
      case 'opinion':
        questions = await getGeneralOpinionQuestions();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid question type' },
          { status: 400 }
        );
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching survey questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey questions' },
      { status: 500 }
    );
  }
}
