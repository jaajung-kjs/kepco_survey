import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SubmitData {
  department: string;
  position: string;
  ownDeptAnswers: Record<number, number>;
  otherDeptAnswers?: Record<string, Record<string, number>>;
  managementScaleAnswers: Record<number, number>;
  managementTextAnswers: Record<number, string>;
  opinionAnswers: Record<number, string>;
}

export async function POST(request: NextRequest) {
  try {
    // Get auth user from cookie
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user data from users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already completed
    if (user.has_completed) {
      return NextResponse.json(
        { error: 'Survey already completed' },
        { status: 400 }
      );
    }

    const data: SubmitData = await request.json();

    // 1. Update department scores (본인 소속 조직)
    for (const [questionNumber, score] of Object.entries(data.ownDeptAnswers)) {
      const { error } = await supabase.rpc('increment_dept_score', {
        dept: data.department,
        question: `q${questionNumber}`,
        score: score
      });

      if (error) {
        console.error('Error updating department score:', error);
        throw error;
      }
    }

    // 2. Update other department scores (간부만)
    if (data.otherDeptAnswers && data.position === '간부') {
      for (const [questionNumber, deptScores] of Object.entries(data.otherDeptAnswers)) {
        const mappedQuestionNum = parseInt(questionNumber) - 20;
        for (const [department, score] of Object.entries(deptScores)) {
          const { error } = await supabase.rpc('increment_other_score', {
            dept: department,
            question: `q${mappedQuestionNum}`,
            score: score
          });

          if (error) {
            console.error('Error updating other department score:', error);
            throw error;
          }
        }
      }
    }

    // 3. Update management scores (5점척도)
    for (const [questionNumber, score] of Object.entries(data.managementScaleAnswers)) {
      const { error } = await supabase.rpc('increment_management_score', {
        question: `q${questionNumber}`,
        score: score
      });

      if (error) {
        console.error('Error updating management score:', error);
        throw error;
      }
    }

    // 4. Save text responses (관리처 서술형 + 종합 의견)
    const allTextResponses = {
      ...data.managementTextAnswers,
      ...data.opinionAnswers
    };

    for (const [questionNumber, response] of Object.entries(allTextResponses)) {
      if (response && response.trim()) {
        const { data: questionData, error: questionError } = await supabase
          .from('survey_questions')
          .select('question_text')
          .eq('question_number', parseInt(questionNumber))
          .maybeSingle();

        if (questionError) {
          console.error('Error fetching question text:', questionError);
          throw questionError;
        }

        if (!questionData || !questionData.question_text) {
          const errorMsg = `Question ${questionNumber} not found in survey_questions`;
          console.error(errorMsg);
          throw new Error(errorMsg);
        }

        const { error } = await supabase
          .from('text_responses')
          .insert({
            auth_user_id: user.auth_user_id,
            question_number: parseInt(questionNumber),
            question_text: questionData.question_text,
            response_text: response.trim(),
            respondent_department: data.department
          });

        if (error) {
          console.error('Error saving text response:', error);
          throw error;
        }
      }
    }

    // 5. 모든 저장이 완료된 후 완료 플래그 업데이트
    const { error: updateError } = await supabase
      .from('users')
      .update({ has_completed: true })
      .eq('auth_user_id', user.auth_user_id);

    if (updateError) {
      console.error('Error updating user completion status:', updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'Survey submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting survey:', error);
    return NextResponse.json(
      { error: 'Failed to submit survey' },
      { status: 500 }
    );
  }
}
