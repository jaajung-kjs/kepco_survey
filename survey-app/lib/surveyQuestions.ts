import { supabase } from './supabase';
import type { SurveyQuestion } from '@/types';

export async function getSurveyQuestions(): Promise<SurveyQuestion[]> {
  const { data, error } = await supabase
    .from('survey_questions')
    .select('*')
    .order('question_number');

  if (error) {
    console.error('Error fetching survey questions:', error);
    return [];
  }

  return data as SurveyQuestion[];
}

export async function getOwnDeptQuestions(): Promise<SurveyQuestion[]> {
  const { data, error } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('evaluation_target', '본인 소속 조직')
    .order('question_number');

  if (error) {
    console.error('Error fetching own dept questions:', error);
    return [];
  }

  return data as SurveyQuestion[];
}

export async function getOtherDeptQuestions(): Promise<SurveyQuestion[]> {
  const { data, error } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('evaluation_target', '타 부서/지사')
    .eq('for_executives_only', true)
    .order('question_number');

  if (error) {
    console.error('Error fetching other dept questions:', error);
    return [];
  }

  return data as SurveyQuestion[];
}

export async function getManagementQuestions(): Promise<SurveyQuestion[]> {
  const { data, error } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('evaluation_target', '관리처 전반')
    .order('question_number');

  if (error) {
    console.error('Error fetching management questions:', error);
    return [];
  }

  return data as SurveyQuestion[];
}

export async function getGeneralOpinionQuestions(): Promise<SurveyQuestion[]> {
  const { data, error } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('evaluation_target', '종합 의견')
    .order('question_number');

  if (error) {
    console.error('Error fetching general opinion questions:', error);
    return [];
  }

  return data as SurveyQuestion[];
}
