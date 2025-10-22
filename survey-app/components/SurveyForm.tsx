'use client';

import { useState, useEffect } from 'react';
import DepartmentPositionSelect from './DepartmentPositionSelect';
import OwnDeptSurvey from './OwnDeptSurvey';
import OtherDeptEvaluation from './OtherDeptEvaluation';
import ManagementSurvey from './ManagementSurvey';
import OpinionSurvey from './OpinionSurvey';
import type { Department, Position } from '@/lib/constants';
import type { SurveyQuestion } from '@/types';

type Step = 'select' | 'own-dept' | 'other-dept' | 'management' | 'opinion';

export default function SurveyForm() {
  const [currentStep, setCurrentStep] = useState<Step>('select');
  const [department, setDepartment] = useState<Department | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [ownDeptAnswers, setOwnDeptAnswers] = useState<Record<number, number>>({});
  const [otherDeptAnswers, setOtherDeptAnswers] = useState<Record<string, Record<string, number>>>({});
  const [managementScaleAnswers, setManagementScaleAnswers] = useState<Record<number, number>>({});
  const [managementTextAnswers, setManagementTextAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [ownDeptQuestions, setOwnDeptQuestions] = useState<SurveyQuestion[]>([]);
  const [otherDeptQuestions, setOtherDeptQuestions] = useState<SurveyQuestion[]>([]);
  const [managementQuestions, setManagementQuestions] = useState<SurveyQuestion[]>([]);
  const [opinionQuestions, setOpinionQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentStep === 'own-dept') {
      loadOwnDeptQuestions();
    } else if (currentStep === 'other-dept') {
      loadOtherDeptQuestions();
    } else if (currentStep === 'management') {
      loadManagementQuestions();
    } else if (currentStep === 'opinion') {
      loadOpinionQuestions();
    }
  }, [currentStep]);

  const loadOwnDeptQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/survey/questions?type=own-dept');
      const data = await response.json();
      setOwnDeptQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOtherDeptQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/survey/questions?type=other-dept');
      const data = await response.json();
      setOtherDeptQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadManagementQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/survey/questions?type=management');
      const data = await response.json();
      setManagementQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOpinionQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/survey/questions?type=opinion');
      const data = await response.json();
      setOpinionQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentPositionSubmit = (dept: Department, pos: Position) => {
    setDepartment(dept);
    setPosition(pos);
    setCurrentStep('own-dept');
  };

  const handleOwnDeptSubmit = (answers: Record<number, number>) => {
    setOwnDeptAnswers(answers);
    // 간부인 경우 타부서 평가로, 직원인 경우 관리처 평가로
    if (position === '간부') {
      setCurrentStep('other-dept');
    } else {
      setCurrentStep('management');
    }
  };

  const handleOtherDeptSubmit = (answers: Record<string, Record<string, number>>) => {
    setOtherDeptAnswers(answers);
    setCurrentStep('management');
  };

  const handleManagementSubmit = (scaleAnswers: Record<number, number>, textAnswers: Record<number, string>) => {
    setManagementScaleAnswers(scaleAnswers);
    setManagementTextAnswers(textAnswers);
    setCurrentStep('opinion');
  };

  const handleOpinionSubmit = async (opinionAnswers: Record<number, string>) => {
    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          department,
          position,
          ownDeptAnswers,
          otherDeptAnswers: position === '간부' ? otherDeptAnswers : undefined,
          managementScaleAnswers,
          managementTextAnswers,
          opinionAnswers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit survey');
      }

      // Redirect to thank you page or survey completed page
      window.location.href = '/survey/completed';
    } catch (error) {
      console.error('Error submitting survey:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'own-dept') {
      setCurrentStep('select');
    } else if (currentStep === 'other-dept') {
      setCurrentStep('own-dept');
    } else if (currentStep === 'management') {
      if (position === '간부') {
        setCurrentStep('other-dept');
      } else {
        setCurrentStep('own-dept');
      }
    } else if (currentStep === 'opinion') {
      setCurrentStep('management');
    }
  };

  return (
    <div>
      {currentStep === 'select' && (
        <DepartmentPositionSelect onSubmit={handleDepartmentPositionSubmit} />
      )}

      {currentStep === 'own-dept' && (
        <>
          {loading ? (
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-center text-gray-600">문항을 불러오는 중...</p>
            </div>
          ) : (
            <OwnDeptSurvey
              questions={ownDeptQuestions}
              onNext={handleOwnDeptSubmit}
              onBack={handleBack}
            />
          )}
        </>
      )}

      {currentStep === 'other-dept' && (
        <>
          {loading ? (
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-center text-gray-600">문항을 불러오는 중...</p>
            </div>
          ) : (
            <OtherDeptEvaluation
              questions={otherDeptQuestions}
              onNext={handleOtherDeptSubmit}
              onBack={handleBack}
              currentDepartment={department!}
            />
          )}
        </>
      )}

      {currentStep === 'management' && (
        <>
          {loading ? (
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-center text-gray-600">문항을 불러오는 중...</p>
            </div>
          ) : (
            <ManagementSurvey
              questions={managementQuestions}
              onNext={handleManagementSubmit}
              onBack={handleBack}
            />
          )}
        </>
      )}

      {currentStep === 'opinion' && (
        <>
          {loading ? (
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-center text-gray-600">문항을 불러오는 중...</p>
            </div>
          ) : (
            <OpinionSurvey
              questions={opinionQuestions}
              onNext={handleOpinionSubmit}
              onBack={handleBack}
              submitting={submitting}
              submitError={submitError}
            />
          )}
        </>
      )}
    </div>
  );
}
