import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
    const supabase = await createServerSupabaseClient();

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
    // Q21~Q25를 q1~q5로 매핑
    if (data.otherDeptAnswers && data.position === '간부') {
      for (const [questionNumber, deptScores] of Object.entries(data.otherDeptAnswers)) {
        const mappedQuestionNum = parseInt(questionNumber) - 20; // Q21->q1, Q22->q2, ...
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
      const { error} = await supabase.rpc('increment_management_score', {
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
        // Get question text from survey_questions table
        const { data: questionData, error: questionError } = await supabase
          .from('survey_questions')
          .select('question_text')
          .eq('question_number', parseInt(questionNumber))
          .maybeSingle();

        if (questionError) {
          console.error('Error fetching question text:', questionError);
          continue; // Skip this question if error occurs
        }

        if (!questionData || !questionData.question_text) {
          console.error(`Question ${questionNumber} not found in survey_questions`);
          continue; // Skip this question if not found
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

    // 5. Update user's has_completed flag
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
